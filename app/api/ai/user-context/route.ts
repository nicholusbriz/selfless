import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import { checkProfileCompleteness, generateProfileRecommendations } from '@/lib/profile-completeness';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch all user context data in parallel
    const [learningProfile, user, recentConversations] = await Promise.all([
      prisma.aILearningProfile.findUnique({
        where: { userId }
      }),
      prisma.user.findUnique({
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
      }),
      prisma.aIConversation.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 3,
        select: {
          topics: true,
          difficulty: true
        }
      })
    ]);

    // Build combined context in the format expected by AI
    let combinedContext = '';
    
    if (user) {
      const courses = user.submittedCourses.map(c => c.name).join(', ');
      const recentGrades = user.grades.slice(-3).map(g => g.score).join(', ');
      
      combinedContext = `
      
USER CONTEXT:
- Name: ${user.firstName} ${user.lastName}
- Role: ${user.role?.displayName || 'Student'}
- Enrolled Courses: ${courses || 'None'}
- Recent Grades: ${recentGrades || 'No grades yet'}
- Tech Center: ${user.techCenter?.name || 'Not assigned'}
`;
      
      if (learningProfile) {
        combinedContext += `
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

    if (recentConversations.length > 0) {
      const recentTopics = recentConversations.flatMap(c => c.topics || []);
      const recentDifficulties = recentConversations.map(c => c.difficulty).filter(Boolean);
      
      combinedContext += `
RECENT CONVERSATION HISTORY:
- Recent Topics: ${recentTopics.length > 0 ? recentTopics.join(', ') : 'None'}
- Conversation Difficulty: ${recentDifficulties.length > 0 ? recentDifficulties.join(', ') : 'None'}
- Total Recent Conversations: ${recentConversations.length}
`;
    }

    // Check profile completeness
    let profileRecommendations = '';
    if (user) {
      const profileCompleteness = checkProfileCompleteness(user);
      profileRecommendations = generateProfileRecommendations(profileCompleteness);
    }

    return NextResponse.json({
      success: true,
      data: {
        context: combinedContext,
        profileRecommendations
      }
    });
  } catch (error) {
    console.error('Failed to fetch user context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user context' },
      { status: 500 }
    );
  }
}