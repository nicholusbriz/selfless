# Video Storage Setup Guide

## Overview
This guide will help you set up video storage with Supabase for your dashboard. The system allows super admins to drag and drop videos that will be stored in Supabase and displayed on the regular user dashboard. Video upload is only available on the super admin overview page.

## Prerequisites
- A Supabase project (create one at https://supabase.com)
- Your Supabase project URL and anon key

## Setup Steps

### 1. Configure Environment Variables
Create a `.env.local` file in your project root (if it doesn't exist) and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

To get these values:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key

### 2. Set Up Supabase Storage

#### Option A: Using SQL Scripts (Recommended)
Run these SQL scripts in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor):

1. **Create the videos bucket:**
   - Open `supabase/03-create-videos-bucket.sql`
   - Copy and paste the contents into the SQL Editor
   - Click **Run**

2. **Set up storage policies:**
   - Open `supabase/04-videos-storage-policies.sql`
   - Copy and paste the contents into the SQL Editor
   - Click **Run**

#### Option B: Using Supabase Dashboard UI
1. Go to **Storage** → **New bucket**
2. Name: `videos`
3. Public bucket: ✅ (check the box)
4. Click **Create bucket**
5. Go to the newly created bucket
6. Click **Policies** tab
7. Add policies for public read and write access

### 3. Test the Setup

#### Start Your Development Server
```bash
npm run dev
```

#### Test Video Upload
1. Navigate to the super admin overview page (`/dashboard/super-admin`)
2. You should see a "Video Management" section
3. Click the "Upload New Video" button
4. Drag and drop a video file (MP4, WebM, or OGG, max 100MB)
5. The video should upload and will be available on the regular dashboard

#### Test Video Display
1. Navigate to the regular user dashboard (`/dashboard`)
2. You should see a "Video Hub" section
3. Videos uploaded by the super admin should automatically appear in the video player
4. If multiple videos are uploaded, they'll appear in a video gallery section
5. Videos should be playable directly in the browser

#### Test Video Management (Super Admin)
1. Navigate to the super admin overview (`/dashboard/super-admin`)
2. After uploading videos, you should see a list of current videos
3. Each video shows a preview player and the video URL
4. Click the "Delete" button to remove videos from storage
5. Videos will be removed from both the admin panel and user dashboard

## Features Implemented

### ✅ Supabase Storage Integration
- Dedicated `videos` bucket for video storage
- Public access policies for viewing videos
- Secure upload with authentication

### ✅ Video Upload Component (Admin Only)
- Drag-and-drop interface in super admin overview
- File type validation (MP4, WebM, OGG)
- File size validation (max 100MB)
- Upload progress indicator
- Success/error handling
- Only accessible to super admins

### ✅ API Routes
- `POST /api/videos/upload` - Upload videos (admin only)
- `GET /api/videos` - Fetch all videos (public)
- `DELETE /api/videos/delete` - Delete videos (admin only)

### ✅ Dashboard Integration
- Video player in the main user dashboard
- Videos uploaded by admin appear automatically
- Video gallery for multiple videos
- Automatic video fetching on page load
- No upload functionality for regular users

### ✅ Super Admin Integration
- Video upload section in super admin overview (`/dashboard/super-admin`)
- Super admin-only access to upload functionality
- Video management interface with viewing and deletion capabilities
- List of all uploaded videos with preview and delete options

## File Structure

```
my-app/
├── app/
│   ├── api/
│   │   └── videos/
│   │       ├── route.ts          # GET endpoint for fetching videos
│   │       ├── upload/
│   │       │   └── route.ts      # POST endpoint for uploading
│   │       └── delete/
│   │           └── route.ts      # DELETE endpoint for deletion
│   └── dashboard/
│       ├── page.tsx              # User dashboard with video display
│       └── super-admin/
│           └── page.tsx          # Super admin overview with video upload
├── components/
│   └── VideoUpload.tsx           # Drag-and-drop upload component
├── lib/
│   └── supabase.ts               # Updated with video functions
└── supabase/
    ├── 03-create-videos-bucket.sql
    ├── 04-videos-storage-policies.sql
    └── README.md                 # Updated documentation
```

## Troubleshooting

### Upload Fails (Admin)
- **Error**: "Upload failed"
  - Check your Supabase URL and anon key in `.env.local`
  - Ensure the `videos` bucket exists in Supabase
  - Verify storage policies are set correctly
  - Make sure you're logged in as a super admin

### Videos Not Displaying (User Dashboard)
- **Error**: Videos don't appear after admin upload
  - Check browser console for errors
  - Verify the bucket is public
  - Ensure read policies are active
  - Check that admin actually uploaded videos

### Admin Can't Access Upload
- **Error**: "Permission denied" or upload button not visible
  - Ensure you're logged in as a super admin
  - Navigate to `/dashboard/super-admin` not `/dashboard`
  - Check user role permissions
  - Verify authentication is working

### Permission Errors
- **Error**: "Permission denied"
  - Run the storage policies SQL script again
  - Check that policies are active in Supabase Dashboard
  - Verify the bucket name matches exactly (`videos`)

### File Size Issues
- **Error**: "Video file too large"
  - Current limit is 100MB
  - For larger files, modify the size limit in `app/api/videos/upload/route.ts`

### Video Deletion Issues
- **Error**: "Failed to delete video"
  - Check that the video URL is correct
  - Verify the delete API route is working
  - Ensure the video exists in Supabase storage
  - Check browser console for specific error messages

### Video Not Appearing After Upload
- **Error**: Video uploaded but not showing in list
  - Refresh the page to trigger video fetch
  - Check browser console for fetch errors
  - Verify the video was successfully uploaded to Supabase
  - Check that the storage bucket is public

## Next Steps

### Optional Enhancements
1. **Video Metadata Storage**: Consider creating a database table to store video metadata (title, description, upload date, etc.)
2. **Video Thumbnails**: Generate thumbnails for better gallery display
3. **Video Categories**: Add categories/labels for better organization
4. **Role-Based Access**: Further refine permissions for different admin roles
5. **Video Compression**: Add client-side compression before upload
6. **Video Scheduling**: Allow admins to schedule when videos appear on the dashboard
7. **Bulk Operations**: Add ability to upload multiple videos at once
8. **Video Analytics**: Track views and engagement with videos

### Additional Storage
The same pattern can be used for other file types:
- Documents (PDF, DOCX)
- Audio files (MP3, WAV)
- Images (beyond profile pictures)

## Support
If you encounter issues:
1. Check the Supabase dashboard for bucket status
2. Review browser console for JavaScript errors
3. Verify environment variables are set correctly
4. Ensure SQL scripts were executed successfully
5. Make sure you're accessing the correct page: `/dashboard/super-admin` for uploads
