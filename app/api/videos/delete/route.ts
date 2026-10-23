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
import {
  invalidJsonBodyResponse,
  isString,
  parseJsonBody,
} from '@/app/api/_lib/request-validation';

export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user
    await requireAuth();

    // Parse request body
    const body = await parseJsonBody(req, { videoUrl: isString });
    if (!body) return invalidJsonBodyResponse();
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
  } catch (error) {
    console.error('Video delete API error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete video' },
      { status: 500 }
    );
  }
}
