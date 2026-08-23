import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateRAGResponse, type RAGResponse, type RAGOptions } from '@/lib/services/rag-service';

const prisma = new PrismaClient();

// Custom error types for better error handling
class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

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

// Basic AI identity - all specific knowledge comes from database
const AI_IDENTITY = `
You are Atbriz Ai, an intelligent learning assistant designed to help students succeed.

ASSISTANCE GUIDELINES:
1. You are Atbriz Ai - an intelligent learning assistant designed to help students succeed
2. Help users navigate the platform and find features using the knowledge base
3. Explain how to use different features and tools based on database information
4. Provide information about courses, grades, and academic progress from context
5. Assist with assignment questions and educational content
6. Help with coding and technical questions
7. Answer general questions about any topic (math, science, history, etc.)
8. Be encouraging and educational in your approach
9. When helping with assignments, provide guidance rather than just answers
10. Adapt responses based on the user's role (student/teacher/admin)
11. Maintain a friendly, professional, and educational tone
12. Reference yourself as "Atbriz Ai" when appropriate
13. Be personal and adaptive to each user's learning journey
14. Use the provided knowledge base information for platform-specific questions
15. If you don't have specific information in the knowledge base, provide general helpful guidance
16. When users ask about who created you or who developed the platform, provide information about Nicholus Turyamureba (Atbriz) from the developer category in the knowledge base

When answering questions:
- Use the knowledge base information provided below for platform-specific questions
- If the question is educational (assignments, homework, concepts), provide helpful explanations
- If the question is general knowledge, answer it to the best of your ability
- If asked about the creator/developer, provide information about Nicholus Turyamureba (Atbriz)
- Always be helpful, educational, and encouraging
- If you don't know something, admit it and suggest where the user might find help
`;

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
    const { 
      message, 
      conversationHistory, 
      userId, 
      userContext: prebuiltUserContext, 
      profileRecommendations, 
      conversationId,
      useRAG = true,
      strictMode = false,
      hybridSearch = false
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const conversationHistoryMessages = Array.isArray(conversationHistory)
      ? (conversationHistory as ChatHistoryMessage[])
      : [];

    // Use prebuilt context if provided (from TanStack Query cache), otherwise fetch from database
    let userContext = '';
    
    if (prebuiltUserContext) {
      // Use cached context from TanStack Query (already formatted)
      userContext = prebuiltUserContext;
    } else if (userId) {
      // Fallback to database fetch if no cached context
      try {
        // Fetch user's academic data only (simplified for speed)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            role: true,
            techCenter: true,
            submittedCourses: {
              include: {
                grades: true
              }
            },
            grades: true
          }
        });

        if (user) {
          // Build personalized context
          const courses = user.submittedCourses.map(c => c.name).join(', ');
          const recentGrades = user.grades.slice(-3).map(g => g.score).join(', ');
          
          userContext = `
          
USER CONTEXT:
- Name: ${user.firstName} ${user.lastName}
- Role: ${user.role?.displayName || 'Student'}
- Enrolled Courses: ${courses || 'None'}
- Recent Grades: ${recentGrades || 'No grades yet'}
- Tech Center: ${user.techCenter?.name || 'Not assigned'}
`;
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue without user context if database fails
      }
    }

    // Add profile recommendations to context if provided
    if (profileRecommendations) {
      userContext += profileRecommendations;
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

    // Use RAG if enabled and available
    if (useRAG) {
      try {
        console.log('[ChatRoute] Attempting RAG generation...');
        const ragOptions: RAGOptions = {
          strictMode,
          useCache: true,
          maxSources: 5,
          similarityThreshold: 0.5,
          hybridSearch,
          includeUserContext: true,
          temperature: 0.7,
          maxTokens: 1000
        };

        ragData = await generateRAGResponse(message, userContext, ragOptions);
        response = ragData.response;
        ragEnabled = true;
        console.log('[ChatRoute] RAG generation successful');
      } catch (ragError) {
        console.error('[ChatRoute] RAG generation failed, falling back to traditional chat:', ragError);
        // Fall back to traditional chat if RAG fails
        ragEnabled = false;
      }
    }

    // Fallback to traditional chat if RAG is disabled or failed
    if (!ragEnabled) {
      // Get relevant knowledge base content (keyword-based fallback)
      let knowledgeBaseContext = '';
      try {
        const relevantKnowledge = await getRelevantKnowledge(message);
        if (relevantKnowledge.length > 0) {
          knowledgeBaseContext = `
          
RELEVANT KNOWLEDGE BASE:
${relevantKnowledge.map(k => `
## ${k.title}
**Category:** ${k.category}${k.subcategory ? ` > ${k.subcategory}` : ''}
**Content:** ${k.content}
${k.summary ? `**Summary:** ${k.summary}` : ''}
${k.tags.length > 0 ? `**Tags:** ${k.tags.join(', ')}` : ''}
`).join('\n---\n')}
`;
        }
      } catch (kbError) {
        console.error('Knowledge base error:', kbError);
        // Continue without knowledge base if it fails
      }

      // Check which AI service to use. Default to Groq only.
      const aiService = (process.env.AI_SERVICE || 'groq').toLowerCase();

      try {
        const providerOrder =
          aiService === 'groq'
            ? ['groq']
            : aiService === 'openai'
              ? ['openai']
              : aiService === 'gemini'
                ? ['gemini']
                : ['groq'];

        const providerMap = {
          gemini: {
            configured: () => Boolean(process.env.GEMINI_API_KEY?.trim()),
            call: callGeminiAPI,
          },
          openai: {
            configured: () => Boolean(process.env.OPENAI_API_KEY?.trim()),
            call: callOpenAIAPI,
          },
          groq: {
            configured: () => Boolean(process.env.GROQ_API_KEY?.trim()),
            call: callGroqAPI,
          },
        } as const;

        for (const providerName of providerOrder) {
          const provider = providerMap[providerName as keyof typeof providerMap];

          if (!provider?.configured()) {
            continue;
          }

          try {
            response = await provider.call(message, relevantHistory, userContext, knowledgeBaseContext);
            console.log(`[ChatRoute] Using ${providerName} provider (traditional mode)`);
            break;
          } catch (providerError) {
            // Distinguish between quota errors (try next provider) and network errors (skip to fallback)
            if (providerError instanceof QuotaExceededError) {
              console.warn(`AI provider ${providerName} quota exceeded, trying next provider`);
              continue; // Try next provider
            } else if (providerError instanceof NetworkError) {
              console.warn(`AI provider ${providerName} network error, trying next provider`);
              continue; // Try next provider
            } else {
              const errorMessage = providerError instanceof Error ? providerError.message : 'Unknown error';
              console.warn(`AI provider ${providerName} error: ${errorMessage}`);
              continue; // Try next provider for any other error
            }
          }
        }

        if (!response) {
          response = generateFallbackResponse(message);
        }
      } catch (error) {
        console.error('AI request error:', error);
        response = generateFallbackResponse(message);
      }
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
      ragEnabled
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

async function getRelevantKnowledge(message: string) {
  const topics = extractTopics(message);
  const lowerMessage = message.toLowerCase();
  
  // Find relevant knowledge base entries with broader search - limited to 5 for speed
  const knowledge = await prisma.aIKnowledgeBase.findMany({
    where: {
      isActive: true,
      OR: [
        ...topics.map((topic: string) => ({
          category: { contains: topic }
        })),
        ...topics.map((topic: string) => ({
          subcategory: { contains: topic }
        })),
        ...topics.map((topic: string) => ({
          tags: { has: topic }
        })),
        {
          title: { contains: lowerMessage }
        },
        {
          content: { contains: lowerMessage }
        }
      ]
    },
    orderBy: [
      { priority: 'desc' },
      { accessCount: 'desc' }
    ],
    take: 5 // Reduced from 10 to 5 for faster responses
  });
  
  // Update access count
  for (const item of knowledge) {
    await prisma.aIKnowledgeBase.update({
      where: { id: item.id },
      data: { accessCount: { increment: 1 } }
    });
  }
  
  return knowledge;
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

async function callGeminiAPI(message: string, conversationHistory: ChatHistoryMessage[] = [], userContext: string = '', knowledgeBaseContext: string = '') {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const systemContent = AI_IDENTITY + userContext + knowledgeBaseContext;
  const historyPrompt = conversationHistory.length > 0
    ? `\n\nConversation history:\n${conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}`
    : '';

  const prompt = `${systemContent}${historyPrompt}\n\nUser message:\n${message}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || 'Gemini API request failed';
    
    // Check if it's a quota/limit error
    if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('exceeded')) {
      throw new QuotaExceededError(errorMessage);
    }
    
    // Check if it's a network-related error
    if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      throw new NetworkError(errorMessage);
    }
    
    throw new Error(errorMessage);
  }

  const content = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).join('') || '';

  if (!content) {
    throw new Error('Gemini returned an empty response');
  }

  return content;
}

async function callOpenAIAPI(message: string, conversationHistory: ChatHistoryMessage[] = [], userContext: string = '', knowledgeBaseContext: string = '') {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemContent = AI_IDENTITY + userContext + knowledgeBaseContext;

  const messages = [
    {
      role: 'system',
      content: systemContent
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: message
    }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (data.error) {
    const errorMessage = data.error.message;
    
    // Check if it's a quota/limit error
    if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('billing') || errorMessage.includes('exceeded')) {
      throw new QuotaExceededError(errorMessage);
    }
    
    // Check if it's a network-related error
    if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      throw new NetworkError(errorMessage);
    }
    
    throw new Error(errorMessage);
  }

  return data.choices[0].message.content;
}

/**
 * ✅ FIXED: Updated Groq API call with the latest supported model
 */
async function callGroqAPI(message: string, conversationHistory: ChatHistoryMessage[] = [], userContext: string = '', knowledgeBaseContext: string = '') {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  
  if (!apiKey) {
    throw new Error('Groq API key is not configured');
  }

  const systemContent = AI_IDENTITY + userContext + knowledgeBaseContext;

  const messages = [
    {
      role: 'system',
      content: systemContent
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user',
      content: message
    }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      // ✅ FIXED: Updated to use the latest supported model
      model: 'llama-3.1-70b-versatile', // Alternative: 'mixtral-8x7b-32768' or 'llama3-8b-8192'
      messages,
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (data.error) {
    const errorMessage = data.error.message;
    
    // Check if it's a quota/limit error
    if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('rate limit') || errorMessage.includes('exceeded')) {
      throw new QuotaExceededError(errorMessage);
    }
    
    // Check if it's a network-related error
    if (errorMessage.includes('network') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      throw new NetworkError(errorMessage);
    }
    
    throw new Error(errorMessage);
  }

  return data.choices[0].message.content;
}

function generateFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Simple pattern matching for basic responses
  if (lowerMessage.includes('navigate') || lowerMessage.includes('find') || lowerMessage.includes('where')) {
    return "I can help you navigate the Selfless CE platform! Here are the main sections:\n\n• Dashboard (/dashboard) - Overview of your academic progress\n• Courses (/dashboard/courses) - Manage your BYU-Idaho courses\n• Grades (/dashboard/grades) - View your grades and GPA\n• Cleaning (/dashboard/cleaning) - Weekly cleaning schedules\n• Internships (/dashboard/internships) - Internship opportunities\n• Support Groups (/dashboard/support-groups) - Connect with peers\n• Profile (/dashboard/profile) - Your personal settings\n\nWhat specifically are you looking for?";
  }
  
  if (lowerMessage.includes('assignment') || lowerMessage.includes('homework') || lowerMessage.includes('help')) {
    return "I'd be happy to help you with your assignments! Currently, I'm experiencing high network demand, which may affect my response capabilities.\n\nFor the best experience, please wait a moment and try again. I'll be able to provide:\n• Detailed explanations of concepts\n• Step-by-step problem solving\n• Code debugging and help\n• Research assistance\n\nIn the meantime, what specific topic or problem are you working on?";
  }
  
  if (lowerMessage.includes('grade') || lowerMessage.includes('gpa')) {
    return "You can view your grades and GPA by navigating to the Grades section in the dashboard (/dashboard/grades). There you'll see:\n\n• All your course grades\n• Current GPA calculation\n• Academic progress tracking\n• Grade history\n\nIf you have questions about a specific grade or need help understanding your academic standing, feel free to ask!";
  }
  
  return "I'm your AI assistant for Selfless CE! I'm currently experiencing high network demand, but I'm still here to help you with:\n\n• Platform navigation and features\n• Assignment questions and explanations\n• Course information and requirements\n• General questions about any topic\n• Coding help and debugging\n\nPlease wait a moment and try again for full AI capabilities. What would you like to know?";
}