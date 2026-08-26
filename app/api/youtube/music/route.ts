import { NextRequest, NextResponse } from 'next/server';
import { YouTubeService } from '@/lib/services/youtube-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || 'trending music videos';
    const maxResults = parseInt(searchParams.get('maxResults') || '12');
    const pageToken = searchParams.get('pageToken') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const withLyrics = searchParams.get('withLyrics') === 'true';
    const category = searchParams.get('category') || undefined;

    let result;

    // Handle different music search types
    if (category === 'trending') {
      result = await YouTubeService.getTrendingMusic(maxResults, pageToken);
    } 
    else if (category === 'popular') {
      result = await YouTubeService.getPopularMusic(maxResults, pageToken);
    }
    else if (category === 'new') {
      result = await YouTubeService.getNewMusicReleases(maxResults, pageToken);
    }
    else if (genre) {
      // Search by specific genre
      result = await YouTubeService.getMusicByGenre(genre, maxResults, pageToken);
    } 
    else if (withLyrics) {
      // Search with lyrics
      result = await YouTubeService.getMusicWithLyrics(query, maxResults, pageToken);
    } 
    else {
      // General music search
      result = await YouTubeService.searchMusicVideos(
        query,
        maxResults,
        pageToken,
        '10' // YouTube Music category ID
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in YouTube music API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch music videos' },
      { status: 500 }
    );
  }
}