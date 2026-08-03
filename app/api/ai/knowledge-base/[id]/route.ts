import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Update knowledge base entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category, subcategory, title, content, summary, tags, difficulty, priority, relatedIds, isActive, helpfulRating } = body;

    const knowledge = await prisma.aIKnowledgeBase.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(title && { title }),
        ...(content && { content }),
        ...(summary !== undefined && { summary }),
        ...(tags && { tags }),
        ...(difficulty && { difficulty }),
        ...(priority !== undefined && { priority }),
        ...(relatedIds && { relatedIds }),
        ...(isActive !== undefined && { isActive }),
        ...(helpfulRating !== undefined && { helpfulRating })
      }
    });

    return NextResponse.json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    console.error('Knowledge Base PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update knowledge base entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete knowledge base entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.aIKnowledgeBase.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Knowledge base entry deleted successfully'
    });
  } catch (error) {
    console.error('Knowledge Base DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete knowledge base entry' },
      { status: 500 }
    );
  }
}