-- =====================================================
-- Supabase Storage Setup for Profile Images
-- =====================================================
-- Purpose: Store user profile images separately from MongoDB
-- Architecture: MongoDB stores data + image URLs, Supabase stores actual image files
-- Created: 2025-06-27
-- =====================================================

-- Create the profile-images storage bucket
-- Note: This can also be created via Supabase Dashboard → Storage → New bucket
-- Bucket name: profile-images
-- Public bucket: true (allows public access to images)

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;
