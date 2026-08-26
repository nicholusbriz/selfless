import { NextRequest, NextResponse } from 'next/server';
import { YouTubeService } from '@/lib/services/youtube-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || 'English language learning';
    const maxResults = parseInt(searchParams.get('maxResults') || '12');
    const pageToken = searchParams.get('pageToken') || undefined;
    const videoCategoryId = searchParams.get('videoCategoryId') || undefined;

    let result;

    // If videoCategoryId is provided, use music search, otherwise use English learning
    if (videoCategoryId === '10') {
      // Music category
      result = await YouTubeService.searchMusicVideos(
        query,
        maxResults,
        pageToken,
        videoCategoryId
      );
    } else {
      // English learning (default)
      result = await YouTubeService.searchEnglishLearning(
        query,
        maxResults,
        pageToken
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in YouTube search API:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube videos' },
      { status: 500 }
    );
  }
}