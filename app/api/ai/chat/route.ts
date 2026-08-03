import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, userId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user context if userId is provided
    let userContext = '';
    let learningProfile = null;
    let conversationHistoryContext = '';
    
    if (userId) {
      try {
        // Fetch user's learning profile
        learningProfile = await prisma.aILearningProfile.findUnique({
          where: { userId }
        });

        // Fetch user's academic data
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
          
          if (learningProfile) {
            userContext += `
LEARNING PROFILE:
- Learning Style: ${learningProfile.learningStyle.join(', ') || 'Not determined'}
- Difficulty Level: ${learningProfile.difficultyLevel}
- Strong Subjects: ${learningProfile.strongSubjects.join(', ') || 'Being identified'}
- Areas for Improvement: ${learningProfile.weakSubjects.join(', ') || 'Being identified'}
- Concepts Mastered: ${learningProfile.conceptsMastered.length}
- Response Style Preference: ${learningProfile.responseStyle}
- Total Questions Asked: ${learningProfile.totalQuestionsAsked}
`;
          }
        }

        // Fetch recent conversation history for additional context
        const recentConversations = await prisma.aIConversation.findMany({
          where: {
            userId,
            isActive: true
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 3,
          select: {
            messages: true,
            topics: true,
            difficulty: true
          }
        });

        if (recentConversations.length > 0) {
          const recentTopics = recentConversations.flatMap(c => c.topics || []);
          const recentDifficulties = recentConversations.map(c => c.difficulty).filter(Boolean);
          
          conversationHistoryContext = `
RECENT CONVERSATION HISTORY:
- Recent Topics: ${recentTopics.length > 0 ? recentTopics.join(', ') : 'None'}
- Conversation Difficulty: ${recentDifficulties.length > 0 ? recentDifficulties.join(', ') : 'None'}
- Total Recent Conversations: ${recentConversations.length}
`;
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue without user context if database fails
      }
    }

    // Get relevant knowledge base content
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

    // Check which AI service to use
    const aiService = process.env.AI_SERVICE || 'openai'; // Default to OpenAI

    let response;

    if (aiService === 'groq') {
      response = await callGroqAPI(message, conversationHistory, userContext, knowledgeBaseContext, conversationHistoryContext);
    } else if (aiService === 'openai') {
      response = await callOpenAIAPI(message, conversationHistory, userContext, knowledgeBaseContext, conversationHistoryContext);
    } else {
      // Fallback to a simple response if no API is configured
      response = generateFallbackResponse(message);
    }

    // Store conversation if userId is provided
    if (userId) {
      try {
        await storeConversation(userId, message, response, conversationHistory);
        await updateLearningProfile(userId, message, learningProfile);
      } catch (storageError) {
        console.error('Conversation storage error:', storageError);
        // Continue even if storage fails
      }
    }

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process your message' },
      { status: 500 }
    );
  }
}

async function getRelevantKnowledge(message: string) {
  const topics = extractTopics(message);
  const lowerMessage = message.toLowerCase();
  
  // Find relevant knowledge base entries with broader search
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
    take: 10 // Increased to get more comprehensive results
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

async function storeConversation(userId: string, userMessage: string, aiResponse: string, history: any[]) {
  // This is a simplified version - in production, you'd want to update existing conversations
  // or create new ones based on session management
  
  const messages = [
    ...(history || []).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString()
    })),
    {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    },
    {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    }
  ];

  // Create or update conversation
  await prisma.aIConversation.create({
    data: {
      userId,
      title: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : ''),
      messages: messages as any,
      topics: extractTopics(userMessage),
      difficulty: assessDifficulty(userMessage)
    }
  });
}

async function updateLearningProfile(userId: string, message: string, existingProfile: any) {
  const topics = extractTopics(message);
  const difficulty = assessDifficulty(message);
  
  if (existingProfile) {
    // Update existing profile
    await prisma.aILearningProfile.update({
      where: { userId },
      data: {
        totalQuestionsAsked: { increment: 1 },
        preferredTopics: {
          push: topics
        },
        updatedAt: new Date()
      }
    });
  } else {
    // Create new profile
    await prisma.aILearningProfile.create({
      data: {
        userId,
        totalQuestionsAsked: 1,
        preferredTopics: topics,
        difficultyLevel: difficulty === 'hard' ? 'intermediate' : 'beginner'
      }
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

async function callOpenAIAPI(message: string, conversationHistory: any[] = [], userContext: string = '', knowledgeBaseContext: string = '', conversationHistoryContext: string = '') {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemContent = AI_IDENTITY + userContext + knowledgeBaseContext + conversationHistoryContext;

  const messages = [
    {
      role: 'system',
      content: systemContent
    },
    ...conversationHistory.map((msg: any) => ({
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
    throw new Error(data.error.message);
  }

  return data.choices[0].message.content;
}

async function callGroqAPI(message: string, conversationHistory: any[] = [], userContext: string = '', knowledgeBaseContext: string = '', conversationHistoryContext: string = '') {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key is not configured');
  }

  const systemContent = AI_IDENTITY + userContext + knowledgeBaseContext + conversationHistoryContext;

  const messages = [
    {
      role: 'system',
      content: systemContent
    },
    ...conversationHistory.map((msg: any) => ({
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
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
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
    return "I'd be happy to help you with your assignments! Currently, I'm in basic mode, but I can still provide some guidance.\n\nFor full AI assistance including:\n• Detailed explanations of concepts\n• Step-by-step problem solving\n• Code debugging and help\n• Research assistance\n\nPlease ask your administrator to configure an AI service (OpenAI or Groq) in the environment variables.\n\nIn the meantime, what specific topic or problem are you working on?";
  }
  
  if (lowerMessage.includes('grade') || lowerMessage.includes('gpa')) {
    return "You can view your grades and GPA by navigating to the Grades section in the dashboard (/dashboard/grades). There you'll see:\n\n• All your course grades\n• Current GPA calculation\n• Academic progress tracking\n• Grade history\n\nIf you have questions about a specific grade or need help understanding your academic standing, feel free to ask!";
  }
  
  return "I'm your AI assistant for Selfless CE! I can help you with:\n\n• Platform navigation and features\n• Assignment questions and explanations\n• Course information and requirements\n• General questions about any topic\n• Coding help and debugging\n\nFor full AI capabilities, please ensure an AI service (OpenAI or Groq) is configured. What would you like to know?";
}