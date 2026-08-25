-- =====================================================
-- Supabase Storage Policies for Videos
-- =====================================================
-- Purpose: Control access to videos bucket
-- Security: Public read, public write (app-level auth via MongoDB/NextAuth)
-- Created: 2025-08-25
-- =====================================================

-- DROP existing policies if they exist
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Public write access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for videos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for videos" ON storage.objects;

-- Policy 1: Public read access
-- Allows anyone (including anonymous users) to view videos
-- This is necessary for displaying videos on the dashboard
CREATE POLICY "Public read access for videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Policy 2: Public insert access
-- Allows anyone to upload videos (app uses MongoDB for authentication)
-- File naming includes user ID for organization
-- Security is enforced at the application level (NextAuth session)
CREATE POLICY "Public write access for videos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'videos');

-- Policy 3: Public update access
-- Allows anyone to update videos (app uses MongoDB for authentication)
CREATE POLICY "Public update access for videos"
ON storage.objects FOR UPDATE
TO public
WITH CHECK (bucket_id = 'videos');

-- Policy 4: Public delete access
-- Allows anyone to delete videos (app uses MongoDB for authentication)
CREATE POLICY "Public delete access for videos"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'videos');

-- =====================================================
-- Usage Notes:
-- =====================================================
-- - Videos are stored with path: videos/{userId}-{timestamp}.{ext}
-- - Public URLs are generated automatically by Supabase
-- - MongoDB stores only the URL string, not the actual video
-- - Authentication is handled by NextAuth/MongoDB at the application level
-- - Security is enforced in the API routes (requireAuth middleware)
-- =====================================================
