import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/music-analytics/session - Create a new music player session (public)
export async function POST(request: NextRequest) {
  try {
    const { anonymousId, deviceInfo, ipAddress, userAgent, location, latitude, longitude } = await request.json();

    if (!anonymousId) {
      return NextResponse.json({ error: 'Anonymous ID is required' }, { status: 400 });
    }

    // Generate a unique session ID
    const sessionId = `${anonymousId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the music player session
    const session = await prisma.musicPlayerSession.create({
      data: {
        anonymousId,
        sessionId,
        deviceInfo: deviceInfo || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        location: location || null,
        latitude: latitude || null,
        longitude: longitude || null,
        startedAt: new Date(),
      }
    });

    return NextResponse.json({ session, sessionId });
  } catch (error) {
    console.error('Error creating music player session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// PATCH /api/music-analytics/session - End a music player session (public)
export async function PATCH(request: NextRequest) {
  try {
    const { sessionId, anonymousId } = await request.json();

    if (!sessionId || !anonymousId) {
      return NextResponse.json({ error: 'Session ID and Anonymous ID are required' }, { status: 400 });
    }

    // Find the session
    const session = await prisma.musicPlayerSession.findUnique({
      where: { sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify anonymous ID matches
    if (session.anonymousId !== anonymousId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate duration
    const duration = Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000);

    // Update the session
    const updatedSession = await prisma.musicPlayerSession.update({
      where: { sessionId },
      data: {
        endedAt: new Date(),
        duration
      }
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Error ending music player session:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
