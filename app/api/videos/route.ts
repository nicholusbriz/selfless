// app/api/videos/route.ts
/**
 * VIDEOS FETCH API ROUTE
 * 
 * Fetches all videos from Supabase Storage.
 * Requires authentication via NextAuth session.
 * 
 * Endpoint: GET /api/videos
 * Response: { videos: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { getVideos } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Fetch videos from Supabase
    const videos = await getVideos();

    return NextResponse.json({
      videos,
    });
  } catch (error: any) {
    console.error('Videos fetch API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
