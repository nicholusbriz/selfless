# Supabase Storage Setup for Profile Images

## Overview
This directory contains SQL scripts for setting up Supabase Storage to handle user profile images. The application uses a hybrid architecture:
- **MongoDB**: Stores all structured data (users, announcements, cleaning schedules, etc.) including image URLs
- **Supabase Storage**: Stores the actual image files with CDN and optimization

## Architecture Benefits
- Supabase Storage is optimized for images with built-in CDN and transformations
- MongoDB remains the primary database for all application data
- No database conflicts - they serve different purposes
- Easy to migrate or scale storage independently

## Setup Instructions

### 1. Run SQL Scripts in Order
Execute these scripts in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor):

```bash
# 1. Create the storage bucket
supabase/01-create-bucket.sql

# 2. Set up security policies
supabase/02-storage-policies.sql
```

### 2. Alternative: Use Supabase Dashboard UI
If you prefer the UI approach:
1. Go to **Storage** → **New bucket**
2. Name: `profile-images`
3. Public bucket: ✅
4. Go to bucket **Policies** tab
5. Add **Public read access** policy
6. Add **Authenticated write access** policy

### 3. Configure Environment Variables
Add these to your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Connection
Run the test script to verify setup:
```bash
node test-supabase.js
```

## Security Policies

### Public Read Access
- Allows anyone to view profile images
- Necessary for displaying user avatars publicly
- No authentication required for viewing

### Authenticated Write Access
- Only logged-in users can upload images
- Users can only upload to their own folder (organized by user ID)
- Prevents unauthorized image uploads

### Authenticated Delete Access
- Only image owners can delete their images
- Prevents accidental or malicious deletion

## File Organization
Images are stored with this naming pattern:
```
profile-images/{userId}-{timestamp}.{extension}
```

Example: `profile-images/user123-1719504000000.jpg`

## Integration with MongoDB
The MongoDB User model stores only the image URL:
```prisma
model User {
  // ... other fields
  profileImageUrl String?  // Stores Supabase public URL
}
```

## Usage in Application
See `lib/supabase.ts` for utility functions:
- `uploadProfileImage(file, userId)` - Upload image and return URL
- `deleteProfileImage(imageUrl)` - Delete image from storage

## Testing
Run the test script to verify:
```bash
node test-supabase.js
```

This will check:
- Supabase connection
- Bucket existence
- Policy permissions
- File access

## Troubleshooting
- **Bucket not found**: Run `01-create-bucket.sql`
- **Permission denied**: Check policies in `02-storage-policies.sql`
- **Upload fails**: Verify bucket is public and policies are active
- **Images not displaying**: Check public read policy is enabled

## Future Developers
When adding new image storage features:
1. Follow the same bucket/policy pattern
2. Document new SQL scripts in this directory
3. Update this README with new features
4. Add corresponding utility functions to `lib/supabase.ts`
