import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { generateRAGResponse, type RAGResponse, type RAGOptions } from '@/lib/services/rag-service';

const prisma = new PrismaClient();

type ChatHistoryMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string | Date;
};

type LearningProfileRecord = {
  preferredTopics?: string[];
  difficultyLevel?: string;
  strongSubjects?: string[];
  weakSubjects?: string[];
  responseStyle?: string;
  languagePreference?: string;
} | null;

/* ─────────────────────────────────────────────────────────────
   Student card — safe fields only, no passwords / tuition / grades
───────────────────────────────────────────────────────────── */
export interface StudentCard {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  generalCourse: string | null;
  gender: string | null;
  city: string | null;
  country: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  techCenter: { name: string } | null;
  role: { displayName: string } | null;
  courses: { name: string; code: string; courseUnit: string; credits: number }[];
}

/* ─────────────────────────────────────────────────────────────
   Intent detection
   Returns the extracted name when the message is asking about
   a specific person, null otherwise.
───────────────────────────────────────────────────────────── */
function detectStudentIntent(message: string): string | null {
  const lower = message.toLowerCase().trim();

  // Patterns: "tell me about John", "who is Mary", "find student Baker",
  //           "show me John Doe", "what do you know about Alice"
  const patterns = [
    /tell me about\s+(.+)/i,
    /who is\s+(.+)/i,
    /find\s+(?:student\s+)?(.+)/i,
    /show me\s+(.+)/i,
    /what do you know about\s+(.+)/i,
    /search for\s+(.+)/i,
    /look up\s+(.+)/i,
    /profile of\s+(.+)/i,
    /info(?:rmation)? (?:on|about)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match?.[1]) {
      // Strip trailing punctuation / filler words
      const name = match[1]
        .replace(/[?.!,]+$/, '')
        .replace(/\b(for me|please|student|user)\b/gi, '')
        .trim();
      // Only treat as a name if 1–4 words and not a generic phrase
      const wordCount = name.split(/\s+/).filter(Boolean).length;
      if (wordCount >= 1 && wordCount <= 4) return name;
    }
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
   Live student lookup — safe fields only
───────────────────────────────────────────────────────────── */
async function lookupStudent(nameQuery: string): Promise<StudentCard | null> {
  const parts = nameQuery.trim().split(/\s+/);
  const [first, ...rest] = parts;
  const last = rest.join(' ');

  try {
    const student = await prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [
          // Exact first+last match first
          ...(last
            ? [{ firstName: { equals: first, mode: 'insensitive' as const }, lastName: { equals: last, mode: 'insensitive' as const } }]
            : []),
          // Partial first name
          { firstName: { contains: first, mode: 'insensitive' as const } },
          // Partial last name (whole query as last name)
          { lastName: { contains: nameQuery, mode: 'insensitive' as const } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        generalCourse: true,
        gender: true,
        city: true,
        country: true,
        linkedinUrl: true,
        githubUrl: true,
        techCenter: { select: { name: true } },
        role: { select: { displayName: true } },
        submittedCourses: {
          where: { status: 'ACTIVE' },
          select: { name: true, code: true, courseUnit: true, credits: true },
        },
      },
    });

    if (!student) return null;

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      profileImageUrl: student.profileImageUrl ?? null,
      generalCourse: student.generalCourse ?? null,
      gender: student.gender ?? null,
      city: student.city ?? null,
      country: student.country ?? null,
      linkedinUrl: student.linkedinUrl ?? null,
      githubUrl: student.githubUrl ?? null,
      techCenter: student.techCenter ?? null,
      role: student.role ? { displayName: student.role.displayName } : null,
      courses: student.submittedCourses.map((c) => ({
        name: c.name,
        code: c.code,
        courseUnit: c.courseUnit,
        credits: c.credits,
      })),
    };
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────
   Format student data as a prompt context block
───────────────────────────────────────────────────────────── */
function formatStudentContext(student: StudentCard): string {
  const courseList =
    student.courses.length > 0
      ? student.courses.map((c) => `  • ${c.name} (${c.code}) — ${c.courseUnit}, ${c.credits} credits`).join('\n')
      : '  None enrolled';

  return `LIVE STUDENT PROFILE (from database — answer using this data):
- Full name: ${student.firstName} ${student.lastName}
- Role: ${student.role?.displayName ?? 'Student'}
- Tech Center: ${student.techCenter?.name ?? 'Not assigned'}
- General course: ${student.generalCourse ?? 'Not specified'}
- Location: ${[student.city, student.country].filter(Boolean).join(', ') || 'Not specified'}
- Active courses:
${courseList}
`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const conversationId = searchParams.get('conversationId');

  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
  }

  try {
    if (conversationId) {
      const conversation = await prisma.aIConversation.findFirst({
        where: { id: conversationId, userId, isActive: true },
        select: { id: true, title: true, messages: true, updatedAt: true },
      });

      return NextResponse.json({
        success: true,
        data: {
          conversation,
        },
      });
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, topics: true },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations,
      },
    });
  } catch (error) {
    console.error('Chat history fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch chat history' }, { status: 500 });
  }
}

/**
 * POST /api/ai/chat
 * 
 * Main chat endpoint with RAG (Retrieval-Augmented Generation) integration
 * 
 * Request Body:
 * - message: string (required) - The user's message
 * - conversationHistory: array (optional) - Previous conversation messages
 * - userId: string (optional) - User ID for personalization and storage
 * - userContext: string (optional) - Pre-built user context from cache
 * - profileRecommendations: string (optional) - Profile recommendations
 * - conversationId: string (optional) - Existing conversation ID to continue
 * - useRAG: boolean (optional) - Whether to use RAG (default: true)
 * - strictMode: boolean (optional) - Strict mode for RAG (default: false)
 * - hybridSearch: boolean (optional) - Use hybrid search (default: false)
 * 
 * Returns:
 * - success: boolean
 * - data.response: string - AI response
 * - data.conversationId: string - Conversation ID
 * - data.sources: array - RAG sources with relevance scores (if RAG used)
 * - data.fromCache: boolean - Whether response was from cache (if RAG used)
 * - data.provider: string - AI provider used
 * - data.ragEnabled: boolean - Whether RAG was enabled
 * 
 * Authentication: Optional (user ID required for personalization)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication is required' },
        { status: 401 },
      );
    }

    const {
      message,
      conversationHistory,
      conversationId
    } = await request.json();
    const userId = session.user.id;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const conversationHistoryMessages = Array.isArray(conversationHistory)
      ? (conversationHistory as ChatHistoryMessage[])
      : [];

    // Build trusted context from the authenticated user's database record.
    let userContext = '';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        role: { select: { displayName: true } },
        techCenter: { select: { name: true } },
        submittedCourses: { select: { name: true } },
      },
    });

    if (user) {
      const courses = user.submittedCourses.map((course) => course.name).join(', ');
      userContext = `
TRUSTED CURRENT USER DATA:
- Name: ${user.firstName} ${user.lastName}
- Role: ${user.role?.displayName || 'Student'}
- Enrolled Courses: ${courses || 'None'}
- Tech Center: ${user.techCenter?.name || 'Not assigned'}
`;
    }

    if (userId) {
      try {
        const learningProfileContext = await getLearningProfileContext(userId);
        if (learningProfileContext) {
          userContext += `\n\n${learningProfileContext}`;
        }
      } catch (profileError) {
        console.error('Learning profile error:', profileError);
      }
    }

    const relevantHistory = await getRecentConversationHistory(userId, conversationHistoryMessages);

    let response: string = '';
    let ragData: RAGResponse | null = null;
    let ragEnabled = false;
    let studentCard: StudentCard | null = null;

    const isIdentityQuestion = /\b(who am i|who is me|what is my name|tell me about me)\b/i.test(message);

    if (isIdentityQuestion && user) {
      response = `You are ${user.firstName} ${user.lastName}, a ${user.role?.displayName || 'student'} at ${user.techCenter?.name || 'your tech center'}.`;
    }

    // ── Student lookup ───────────────────────────────────────────────────────
    let studentContext = '';
    let isStudentQuery = false;

    if (!response) {
      const detectedName = detectStudentIntent(message);
      if (detectedName) {
        const found = await lookupStudent(detectedName);
        if (found) {
          studentCard = found;
          studentContext = formatStudentContext(found);
          isStudentQuery = true;
          console.log(`[ChatRoute] Student lookup matched: ${found.firstName} ${found.lastName}`);
        }
      }
    }

    // Chat is always database-only. Client-provided AI mode flags are ignored.
    // For student queries we relax strictMode because the live DB data IS the source.
    if (!response) try {
      console.log('[ChatRoute] Attempting database-only RAG generation...');
      const ragOptions: RAGOptions = {
        strictMode: !isStudentQuery,   // relax when we have live student data
        useCache: !isStudentQuery,     // never cache personalised student answers
        maxSources: 3,
        similarityThreshold: 0.65,
        hybridSearch: false,
        includeUserContext: true,
        temperature: 0.7,
        maxTokens: 450,
        studentContext: isStudentQuery ? studentContext : undefined,
      };

      ragData = await generateRAGResponse(message, userContext, ragOptions);
      response = ragData.response;
      ragEnabled = true;
      console.log('[ChatRoute] Database-only RAG generation successful');
    } catch (ragError) {
      console.error('[ChatRoute] Database-only RAG generation failed:', ragError);
      response = 'I could not answer because the knowledge base is temporarily unavailable. Please try again later.';
    }

    // Store conversation if userId is provided
    let savedConversationId = conversationId || null;
    if (userId) {
      try {
        savedConversationId = await storeConversation(userId, message, response, relevantHistory, conversationId);
      } catch (storageError) {
        console.error('Conversation storage error:', storageError);
        // Continue even if storage fails
      }
    }

    // Define types for source and response data
    interface SourceData {
      id: string;
      title: string;
      category: string;
      subcategory: string | null;
      similarity: number;
      source: string;
      chunkIndex: number;
    }

    interface ResponseData {
      response: string;
      conversationId: string | null;
      ragEnabled: boolean;
      studentCard?: StudentCard | null;
      sources?: SourceData[];
      fromCache?: boolean;
      provider?: string;
      strictModeActive?: boolean;
      sourcesFound?: number;
      processingTime?: number;
      tokenUsage?: {
        prompt: number;
        completion: number;
        total: number;
      };
    }

    const responseData: ResponseData = {
      response,
      conversationId: savedConversationId,
      ragEnabled,
      studentCard: studentCard ?? null,
    };

    // Add RAG metadata if RAG was used
    if (ragEnabled && ragData) {
      responseData.sources = ragData.sources.map(source => ({
        id: source.id,
        title: source.title,
        category: source.category,
        subcategory: source.subcategory || null,
        similarity: source.similarity,
        source: source.source,
        chunkIndex: source.chunkIndex ?? 0 // ✅ Fixed: Provide default value of 0 if undefined
      }));
      responseData.fromCache = ragData.fromCache;
      responseData.provider = ragData.provider;
      responseData.strictModeActive = ragData.strictModeActive;
      responseData.sourcesFound = ragData.sourcesFound;
      responseData.processingTime = ragData.processingTime;
      if (ragData.tokenUsage) {
        responseData.tokenUsage = ragData.tokenUsage;
      }
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process your message' },
      { status: 500 }
    );
  }
}

async function getRecentConversationHistory(userId: string | undefined, fallbackHistory: ChatHistoryMessage[] = []) {
  if (!userId) {
    return fallbackHistory.slice(-8);
  }

  try {
    const recentConversation = await prisma.aIConversation.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { messages: true },
    });

    const storedMessages = Array.isArray(recentConversation?.messages)
      ? (recentConversation.messages as ChatHistoryMessage[])
      : [];

    const mergedHistory = [...storedMessages.slice(-8), ...fallbackHistory.slice(-8)];
    const uniqueHistory = new Map<string, ChatHistoryMessage>();

    for (const message of mergedHistory) {
      if (message?.role && message?.content) {
        uniqueHistory.set(`${message.role}:${message.content}`, message);
      }
    }

    return Array.from(uniqueHistory.values()).slice(-10);
  } catch (historyError) {
    console.error('Conversation history error:', historyError);
    return fallbackHistory.slice(-8);
  }
}

async function getLearningProfileContext(userId: string) {
  try {
    const profile = await prisma.aILearningProfile.findUnique({
      where: { userId },
      select: {
        preferredTopics: true,
        difficultyLevel: true,
        strongSubjects: true,
        weakSubjects: true,
        responseStyle: true,
        languagePreference: true,
      },
    });

    if (!profile) {
      return '';
    }

    const details = [
      profile.preferredTopics?.length ? `- Preferred topics: ${profile.preferredTopics.join(', ')}` : '',
      profile.difficultyLevel ? `- Difficulty level: ${profile.difficultyLevel}` : '',
      profile.strongSubjects?.length ? `- Strong subjects: ${profile.strongSubjects.join(', ')}` : '',
      profile.weakSubjects?.length ? `- Needs extra support in: ${profile.weakSubjects.join(', ')}` : '',
      profile.responseStyle ? `- Response style: ${profile.responseStyle}` : '',
      profile.languagePreference ? `- Language preference: ${profile.languagePreference}` : '',
    ].filter(Boolean);

    return details.length > 0 ? `\n\nLEARNING PROFILE:\n${details.join('\n')}` : '';
  } catch (profileError) {
    console.error('Learning profile lookup error:', profileError);
    return '';
  }
}

async function storeConversation(userId: string, userMessage: string, aiResponse: string, history: ChatHistoryMessage[] = [], conversationId?: string) {
  const messages = [
    ...(history || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
    })),
    {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    },
    {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    },
  ];

  const existingConversation = conversationId
    ? await prisma.aIConversation.findFirst({
      where: { id: conversationId, userId, isActive: true },
    })
    : await prisma.aIConversation.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

  const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
  const topics = extractTopics(userMessage);
  const difficulty = assessDifficulty(userMessage);

  let savedConversation;

  if (existingConversation) {
    savedConversation = await prisma.aIConversation.update({
      where: { id: existingConversation.id },
      data: {
        title,
        messages: messages as unknown as object,
        topics,
        difficulty,
      },
    });
  } else {
    savedConversation = await prisma.aIConversation.create({
      data: {
        userId,
        title,
        messages: messages as unknown as object,
        topics,
        difficulty,
      },
    });
  }

  const existingProfile = await prisma.aILearningProfile.findUnique({
    where: { userId },
    select: {
      preferredTopics: true,
      difficultyLevel: true,
    },
  });

  await updateLearningProfile(userId, userMessage, existingProfile as LearningProfileRecord);

  return savedConversation.id;
}

async function updateLearningProfile(userId: string, message: string, existingProfile?: LearningProfileRecord) {
  const topics = extractTopics(message);
  const difficulty = assessDifficulty(message);

  if (existingProfile) {
    await prisma.aILearningProfile.update({
      where: { userId },
      data: {
        totalQuestionsAsked: { increment: 1 },
        preferredTopics: {
          set: Array.from(new Set([...(existingProfile.preferredTopics || []), ...topics])),
        },
        difficultyLevel: difficulty === 'hard' ? 'intermediate' : existingProfile.difficultyLevel || 'beginner',
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.aILearningProfile.create({
      data: {
        userId,
        totalQuestionsAsked: 1,
        preferredTopics: topics,
        difficultyLevel: difficulty === 'hard' ? 'intermediate' : 'beginner',
      },
    });
  }
}

function extractTopics(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const topics = [];

  const topicKeywords = {
    'math': ['math', 'algebra', 'calculus', 'geometry', 'statistics'],
    'programming': ['code', 'programming', 'javascript', 'python', 'react', 'api'],
    'science': ['science', 'physics', 'chemistry', 'biology'],
    'language': ['english', 'writing', 'grammar', 'literature'],
    'course': ['course', 'class', 'assignment', 'homework', 'grade'],
    'navigation': ['navigate', 'find', 'where', 'how to', 'location']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ['general'];
}

function assessDifficulty(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Simple heuristic for difficulty assessment
  const complexIndicators = ['explain', 'why', 'how does', 'analyze', 'compare', 'implement'];
  const basicIndicators = ['what is', 'where', 'find', 'show me', 'help me'];

  if (complexIndicators.some(indicator => lowerMessage.includes(indicator))) {
    return 'hard';
  } else if (basicIndicators.some(indicator => lowerMessage.includes(indicator))) {
    return 'easy';
  }

  return 'medium';
}

