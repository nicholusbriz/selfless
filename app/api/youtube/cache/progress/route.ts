// app/api/youtube/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const videoId = searchParams.get('videoId');

  if (!userId || !videoId) {
    return NextResponse.json({ error: 'Missing userId or videoId' }, { status: 400 });
  }

  const progress = await prisma.watchProgress.findUnique({
    where: { userId_videoId: { userId, videoId } },
  });

  return NextResponse.json({ progress: progress?.lastPosition || 0 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, videoId, position } = body;

  if (!userId || !videoId || position === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await prisma.watchProgress.upsert({
    where: { userId_videoId: { userId, videoId } },
    update: { lastPosition: position, progress: (position / 100) * 100, updatedAt: new Date() },
    create: { userId, videoId, lastPosition: position, progress: 0, updatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}