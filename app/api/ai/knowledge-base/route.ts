import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all knowledge base entries or filter by category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const where: any = { isActive: true };
    
    if (category) {
      where.category = { contains: category };
    }
    
    if (subcategory) {
      where.subcategory = { contains: subcategory };
    }

    const [knowledge, total] = await Promise.all([
      prisma.aIKnowledgeBase.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { accessCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip
      }),
      prisma.aIKnowledgeBase.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: knowledge,
      total,
      hasMore: skip + limit < total
    });
  } catch (error) {
    console.error('Knowledge Base GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knowledge base' },
      { status: 500 }
    );
  }
}

// POST - Create new knowledge base entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { category, subcategory, title, content, summary, tags, difficulty, priority, relatedIds } = body;

    if (!category || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Category, title, and content are required' },
        { status: 400 }
      );
    }

    const knowledge = await prisma.aIKnowledgeBase.create({
      data: {
        category,
        subcategory,
        title,
        content,
        summary,
        tags: tags || [],
        difficulty,
        priority: priority || 0,
        relatedIds: relatedIds || []
      }
    });

    return NextResponse.json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    console.error('Knowledge Base POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge base entry' },
      { status: 500 }
    );
  }
}