import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma/client';
import { isChatTheme } from '@/lib/messaging/chatThemes';

export async function GET() {
  try {
    const user = await requireAuth();
    const preferences = await prisma.user.findUnique({
      where: { id: user.id },
      select: { chatTheme: true },
    });

    if (!preferences) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      theme: isChatTheme(preferences.chatTheme)
        ? preferences.chatTheme
        : 'classic',
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load chat theme';
    const status = message === 'Unauthorized' ? 401 : 500;
    if (status === 500) console.error('Failed to load chat theme:', error);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body: unknown = await request.json().catch(() => null);

    if (
      typeof body !== 'object' ||
      body === null ||
      !('theme' in body) ||
      !isChatTheme(body.theme)
    ) {
      return NextResponse.json(
        { error: 'A valid chat theme is required' },
        { status: 400 },
      );
    }

    const preferences = await prisma.user.update({
      where: { id: user.id },
      data: { chatTheme: body.theme },
      select: { chatTheme: true },
    });

    return NextResponse.json({ theme: preferences.chatTheme });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save chat theme';
    const status = message === 'Unauthorized' ? 401 : 500;
    if (status === 500) console.error('Failed to save chat theme:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
