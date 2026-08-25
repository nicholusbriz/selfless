// app/api/videos/upload/route.ts
/**
 * VIDEO UPLOAD API ROUTE
 * 
 * Uploads video files to Supabase Storage.
 * Requires authentication via NextAuth session.
 * 
 * Endpoint: POST /api/videos/upload
 * Request Body: FormData with 'video' file
 * Response: { videoUrl: string, message: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { uploadVideo } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();

    // Parse form data with better error handling
    let formData;
    try {
      formData = await req.formData();
    } catch (parseError) {
      console.error('FormData parsing error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse form data. Please ensure you are sending a valid FormData request.' },
        { status: 400 }
      );
    }

    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Upload video to Supabase
    const videoUrl = await uploadVideo(videoFile, user.id);

    return NextResponse.json({
      videoUrl,
      message: 'Video uploaded successfully',
    });
  } catch (error: any) {
    console.error('Video upload API error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}
