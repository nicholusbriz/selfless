import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/music-analytics/play-event - Track a music play event (public)
export async function POST(request: NextRequest) {
  try {
    const { sessionId, anonymousId, videoId, videoTitle, channelTitle, category, duration, completed } = await request.json();

    if (!sessionId || !anonymousId || !videoId || !videoTitle) {
      return NextResponse.json({ error: 'Session ID, Anonymous ID, video ID, and video title are required' }, { status: 400 });
    }

    // Verify the session exists and belongs to the anonymous ID
    const session = await prisma.musicPlayerSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.anonymousId !== anonymousId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create the play event
    const playEvent = await prisma.musicPlayEvent.create({
      data: {
        sessionId,
        anonymousId,
        videoId,
        videoTitle,
        channelTitle: channelTitle || null,
        category: category || null,
        playedAt: new Date(),
        duration: duration || null,
        completed: completed || false
      }
    });

    return NextResponse.json({ playEvent });
  } catch (error) {
    console.error('Error creating play event:', error);
    return NextResponse.json({ error: 'Failed to create play event' }, { status: 500 });
  }
}
