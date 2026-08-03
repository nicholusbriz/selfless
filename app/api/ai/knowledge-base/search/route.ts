import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Search knowledge base with relevance scoring
    const searchTerms = query.toLowerCase().split(/\s+/);
    
    const results = await prisma.aIKnowledgeBase.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: searchTerms } },
          { category: { contains: query, mode: 'insensitive' } },
          { subcategory: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { accessCount: 'desc' }
      ],
      take: 5, // Limit to top 5 for faster responses
      select: {
        id: true,
        category: true,
        subcategory: true,
        title: true,
        content: true,
        summary: true,
        tags: true,
        difficulty: true,
        priority: true
      }
    });

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}