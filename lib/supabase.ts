import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('profile-images')).join('/');

    const { error } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function uploadVideo(file: File, userId: string): Promise<string> {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase is not properly configured. Please check your environment variables.');
    }

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validVideoTypes.includes(file.type)) {
      throw new Error('Invalid video file type. Please upload MP4, WebM, or OGG files.');
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    console.log('Uploading video to Supabase:', { filePath, fileSize: file.size, fileType: file.type });

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

export async function deleteVideo(videoUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(videoUrl);
    const pathParts = url.pathname.split('/');
    // Find the index of 'videos' bucket and get everything after it
    const videosIndex = pathParts.indexOf('videos');
    const filePath = pathParts.slice(videosIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('videos')
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

export async function getVideos(): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('videos')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }

    // Generate public URLs for all videos at root level only (no subdirectories)
    const videoUrls = data
      .filter(file => 
        file.name !== '.emptyFolderPlaceholder' && // Filter out placeholder
        !file.name.includes('/') // Filter out files in subdirectories
      )
      .map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(file.name);
        return publicUrl;
      });

    return videoUrls;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}
