import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string; messageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, messageId } = await params;
    const userId = session.user.id;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId,
        senderId: userId,
        conversation: {
          participantIds: { has: userId },
          isActive: true,
        },
      },
      select: {
        id: true,
        conversationId: true,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found or you do not own it' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.message.delete({
        where: { id: message.id },
      });

      const conversation = await transaction.conversation.findUnique({
        where: { id: message.conversationId },
        select: { lastMessageId: true },
      });

      if (conversation?.lastMessageId === message.id) {
        const previousMessage = await transaction.message.findFirst({
          where: { conversationId: message.conversationId },
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, createdAt: true },
        });

        await transaction.conversation.update({
          where: { id: message.conversationId },
          data: {
            lastMessageId: previousMessage?.id || null,
            lastMessage: previousMessage?.content || null,
            lastMessageAt: previousMessage?.createdAt || null,
          },
        });
      }
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
