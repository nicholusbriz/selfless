# Supabase Storage Setup

## Overview
This directory contains SQL scripts for setting up Supabase Storage to handle user profile images and videos. The application uses a hybrid architecture:
|- **MongoDB**: Stores all structured data (users, announcements, cleaning schedules, etc.) including image/video URLs
|- **Supabase Storage**: Stores the actual image and video files with CDN and optimization

## Architecture Benefits
- Supabase Storage is optimized for media files with built-in CDN and transformations
- MongoDB remains the primary database for all application data
- No database conflicts - they serve different purposes
- Easy to migrate or scale storage independently

## Setup Instructions

### Profile Images Setup
Execute these scripts in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor):

```bash
# 1. Create the storage bucket
supabase/01-create-bucket.sql

# 2. Set up security policies
supabase/02-storage-policies.sql
```

### Videos Setup
Execute these scripts in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor):

```bash
# 1. Create the videos storage bucket
supabase/03-create-videos-bucket.sql

# 2. Set up security policies
supabase/04-videos-storage-policies.sql
```

### Alternative: Use Supabase Dashboard UI
If you prefer the UI approach:

**For Profile Images:**
1. Go to **Storage** → **New bucket**
2. Name: `profile-images`
3. Public bucket: ✅
4. Go to bucket **Policies** tab
5. Add **Public read access** policy
6. Add **Authenticated write access** policy

**For Videos:**
1. Go to **Storage** → **New bucket**
2. Name: `videos`
3. Public bucket: ✅
4. Go to bucket **Policies** tab
5. Add **Public read access** policy
6. Add **Authenticated write access** policy

### Configure Environment Variables
Add these to your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Security Policies

### Profile Images
- **Public Read Access**: Allows anyone to view profile images
- **Authenticated Write Access**: Only logged-in users can upload images
- **Authenticated Delete Access**: Only image owners can delete their images

### Videos
- **Public Read Access**: Allows anyone to view videos
- **Public Write Access**: Application-level authentication via MongoDB/NextAuth
- **Public Update Access**: Application-level authentication via MongoDB/NextAuth
- **Public Delete Access**: Application-level authentication via MongoDB/NextAuth

## File Organization

### Profile Images
Images are stored with this naming pattern:
```
profile-images/{userId}-{timestamp}.{extension}
```
Example: `profile-images/user123-1719504000000.jpg`

### Videos
Videos are stored with this naming pattern:
```
videos/{userId}-{timestamp}.{extension}
```
Example: `videos/user123-1719504000000.mp4`

## Integration with MongoDB
The MongoDB User model stores only the image/video URL:
```prisma
model User {
  // ... other fields
  profileImageUrl String?  // Stores Supabase public URL for images
}
```

For videos, you would create a separate model to store video metadata:
```prisma
model Video {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  description String?
  videoUrl    String   // Stores Supabase public URL
  userId      String   @db.ObjectId
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Usage in Application
See `lib/supabase.ts` for utility functions:

### Profile Images
- `uploadProfileImage(file, userId)` - Upload image and return URL
- `deleteProfileImage(imageUrl)` - Delete image from storage

### Videos
- `uploadVideo(file, userId)` - Upload video and return URL (super admin only)
- `deleteVideo(videoUrl)` - Delete video from storage
- `getVideos()` - List all videos from storage (public access)

## Troubleshooting
- **Bucket not found**: Run the appropriate create-bucket.sql script
- **Permission denied**: Check policies in the storage-policies.sql scripts
- **Upload fails**: Verify bucket is public and policies are active
- **Media not displaying**: Check public read policy is enabled

## Future Developers
When adding new media storage features:
1. Follow the same bucket/policy pattern
2. Document new SQL scripts in this directory
3. Update this README with new features
4. Add corresponding utility functions to `lib/supabase.ts`
