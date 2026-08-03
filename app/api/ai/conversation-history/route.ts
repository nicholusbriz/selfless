import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Retrieve user's conversation history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const conversations = await prisma.aIConversation.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip
    });

    return NextResponse.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Conversation History GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation history' },
      { status: 500 }
    );
  }
}

// DELETE - Archive conversation (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');

    if (!conversationId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify conversation belongs to user
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        userId
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Soft delete (archive) the conversation
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        isActive: false,
        archivedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('Conversation Archive Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive conversation' },
      { status: 500 }
    );
  }
}