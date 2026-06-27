import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
