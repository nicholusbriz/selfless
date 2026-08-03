import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { logAIChatUsage } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/ai/log-usage
 * 
 * Log AI chat usage with optional RAG metrics
 * 
 * Request Body:
 * - userId: string (required) - User ID
 * - techCenterId: string (optional) - Tech center ID
 * - details: object (optional) - Usage details
 *   - messageCount: number - Number of messages
 *   - firstMessage: string - First message in conversation
 * - ragMetrics: object (optional) - RAG-specific metrics
 *   - ragEnabled: boolean - Whether RAG was used
 *   - sourcesFound: number - Number of sources retrieved
 *   - fromCache: boolean - Whether response was from cache
 *   - provider: string - AI provider used
 *   - tokenUsage: object - Token usage data
 *     - prompt: number - Prompt tokens
 *     - completion: number - Completion tokens
 *     - total: number - Total tokens
 *   - processingTime: number - Processing time in ms
 *   - sources: array - Source information
 *     - id: string - Source ID
 *     - similarity: number - Similarity score
 *     - source: string - Source type (semantic/keyword/hybrid)
 * 
 * Returns:
 * - success: boolean
 * 
 * Authentication: Required (user must be authenticated)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, techCenterId, details, ragMetrics } = body;

    // Verify the user is logging their own usage
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Log the AI chat usage
    await logAIChatUsage(userId, techCenterId, details || {
      messageCount: 1,
      firstMessage: 'Chat opened'
    });

    // Log RAG metrics if provided
    if (ragMetrics) {
      try {
        console.log('[LogUsage] Logging RAG metrics:', ragMetrics);
        
        // Store RAG metrics in a separate table or log
        // For now, we'll log to console and could extend to database
        const ragLog = {
          userId,
          techCenterId,
          ragEnabled: ragMetrics.ragEnabled || false,
          sourcesFound: ragMetrics.sourcesFound || 0,
          fromCache: ragMetrics.fromCache || false,
          provider: ragMetrics.provider || 'unknown',
          tokenUsage: ragMetrics.tokenUsage || null,
          processingTime: ragMetrics.processingTime || 0,
          sources: ragMetrics.sources || [],
          timestamp: new Date()
        };

        // Log to console for now - could be extended to database
        console.log('[RAG Metrics]', JSON.stringify(ragLog));

        // Optional: Store in database if you have a RAG metrics table
        // await prisma.rAGMetrics.create({ data: ragLog });
      } catch (ragError) {
        console.error('[LogUsage] Failed to log RAG metrics:', ragError);
        // Continue even if RAG logging fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log AI usage:', error);
    return NextResponse.json(
      { error: 'Failed to log usage' },
      { status: 500 }
    );
  }
}