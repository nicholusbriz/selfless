// app/api/videos/delete/route.ts
/**
 * VIDEO DELETE API ROUTE
 * 
 * Deletes video files from Supabase Storage.
 * Requires authentication via NextAuth session.
 * 
 * Endpoint: DELETE /api/videos/delete
 * Request Body: { videoUrl: string }
 * Response: { message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { deleteVideo } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Parse request body
    const body = await req.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'No video URL provided' },
        { status: 400 }
      );
    }

    // Delete video from Supabase
    await deleteVideo(videoUrl);

    return NextResponse.json({
      message: 'Video deleted successfully',
    });
  } catch (error: any) {
    console.error('Video delete API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    );
  }
}
