-- =====================================================
-- Supabase Storage Setup for Videos
-- =====================================================
-- Purpose: Store video files for dashboard playback
-- Architecture: MongoDB stores video metadata + URLs, Supabase stores actual video files
-- Created: 2025-08-25
-- =====================================================

-- Create the videos storage bucket
-- Note: This can also be created via Supabase Dashboard → Storage → New bucket
-- Bucket name: videos
-- Public bucket: true (allows public access to videos)

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;
