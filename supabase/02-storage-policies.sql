-- =====================================================
-- Supabase Storage Policies for Profile Images
-- =====================================================
-- Purpose: Control access to profile-images bucket
-- Security: Public read, public write (app-level auth via MongoDB/NextAuth)
-- Created: 2025-06-27
-- Updated: 2025-07-29 - Updated for MongoDB/NextAuth authentication
-- =====================================================

-- DROP existing policies if they exist
DROP POLICY IF EXISTS "Public read access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public write access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update for profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete for profile images" ON storage.objects;

-- Policy 1: Public read access
-- Allows anyone (including anonymous users) to view profile images
-- This is necessary for displaying user avatars on the site
CREATE POLICY "Public read access for profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Policy 2: Public insert access
-- Allows anyone to upload images (app uses MongoDB for authentication)
-- File naming includes user ID for organization
-- Security is enforced at the application level (NextAuth session)
CREATE POLICY "Public write access for profile images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile-images');

-- Policy 3: Public update access
-- Allows anyone to update images (app uses MongoDB for authentication)
CREATE POLICY "Public update access for profile images"
ON storage.objects FOR UPDATE
TO public
WITH CHECK (bucket_id = 'profile-images');

-- Policy 4: Public delete access
-- Allows anyone to delete images (app uses MongoDB for authentication)
CREATE POLICY "Public delete access for profile images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'profile-images');

-- =====================================================
-- Usage Notes:
-- =====================================================
-- - Images are stored with path: profile-images/{userId}-{timestamp}.{ext}
-- - Public URLs are generated automatically by Supabase
-- - MongoDB stores only the URL string, not the actual image
-- - Authentication is handled by NextAuth/MongoDB at the application level
-- - Security is enforced in the API routes (requireAuth middleware)
-- =====================================================
