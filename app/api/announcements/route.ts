import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/models/database';
import Announcement, { CreateAnnouncementData } from '@/models/Announcement';
import User from '@/models/User';
import Tutor from '@/models/Tutor';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify admin (super admin or promoted admin)
async function verifyAdmin(userId: string) {
  const user = await User.findById(userId);
  if (!user) return null;

  // Check if user is admin using admin.ts config
  const isSuperAdmin = isSuperAdminEmail(user.email);
  const promotedAdmin = await Admin.findOne({ userId: user._id.toString() });

  if (!isSuperAdmin && !promotedAdmin) return null;

  return { user, isSuperAdmin, promotedAdmin };
}

// Helper function to verify tutor permissions
async function verifyTutorPermissions(userId: string) {
  const user = await User.findById(userId);
  if (!user) return null;

  const tutor = await Tutor.findOne({ userId: user._id.toString() });
  if (!tutor || !tutor.permissions.canPostAnnouncements) return null;

  return { user, tutor };
}

// Recursive function to fetch nested replies
async function fetchNestedReplies(parentCommentId: string, db: any, depth = 0): Promise<any[]> {
  if (depth > 3) return []; // Limit nesting depth to prevent infinite recursion

  const replies = await db.collection('comments')
    .find({ parentCommentId })
    .sort({ createdAt: 1 })
    .toArray();

  const repliesWithNested = await Promise.all(
    replies.map(async (reply: { _id: { toString: () => string }; announcementId: string; userId: string; userName: string; userEmail: string; content: string; createdAt: string; updatedAt: string }) => ({
      id: reply._id.toString(),
      announcementId: reply.announcementId,
      userId: reply.userId,
      userName: reply.userName,
      userEmail: reply.userEmail,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      replies: await fetchNestedReplies(reply._id.toString(), db, depth + 1)
    }))
  );

  return repliesWithNested;
}

// GET all announcements
export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      );
    }

    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch comments for each announcement
    const announcementsWithComments = await Promise.all(
      announcements.map(async (announcement) => {
        const comments = await db.collection('comments')
          .find({
            announcementId: announcement._id.toString(),
            parentCommentId: { $exists: false }
          })
          .sort({ createdAt: 1 })
          .toArray();

        // Fetch nested replies for each comment
        const commentsWithReplies = await Promise.all(
          comments.map(async (comment: any) => {
            const replies = await fetchNestedReplies(comment._id.toString(), db);

            return {
              id: comment._id.toString(),
              announcementId: comment.announcementId,
              userId: comment.userId,
              userName: comment.userName,
              userEmail: comment.userEmail,
              content: comment.content,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              replies
            };
          })
        );

        return {
          id: announcement._id.toString(),
          title: announcement.title,
          content: announcement.content,
          adminName: announcement.adminName,
          createdAt: announcement.createdAt.toISOString(),
          updatedAt: announcement.updatedAt.toISOString(),
          comments: commentsWithReplies
        };
      })
    );

    return NextResponse.json({
      success: true,
      announcements: announcementsWithComments
    });
  } catch (error) {

    return NextResponse.json(
      { success: false, message: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST new announcement
export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token payload' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if user is admin (super admin or promoted admin)
    const adminData = await verifyAdmin(decoded.userId);

    // Check if user is tutor with posting permissions
    const tutorData = await verifyTutorPermissions(decoded.userId);

    // User must be either admin or authorized tutor
    if (!adminData && !tutorData) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Only admins and authorized tutors can post announcements' },
        { status: 403 }
      );
    }

    const body: CreateAnnouncementData = await request.json();

    if (!body.title || !body.content || !body.adminId || !body.adminName || !body.adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Additional security: Ensure user can only post as themselves
    const currentUser = adminData?.user || tutorData?.user;
    if (body.adminId !== decoded.userId ||
      body.adminEmail !== currentUser.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only post announcements as yourself' },
        { status: 403 }
      );
    }

    const newAnnouncement = new Announcement({
      title: body.title.trim(),
      content: body.content.trim(),
      adminId: body.adminId,
      adminName: body.adminName,
      adminEmail: body.adminEmail,
    });

    const savedAnnouncement = await newAnnouncement.save();

    return NextResponse.json({
      success: true,
      message: 'Announcement created successfully',
      announcement: {
        id: savedAnnouncement._id.toString(),
        title: savedAnnouncement.title,
        content: savedAnnouncement.content,
        adminName: savedAnnouncement.adminName,
        adminId: savedAnnouncement.adminId,
        adminEmail: savedAnnouncement.adminEmail,
        createdAt: savedAnnouncement.createdAt.toISOString(),
        updatedAt: savedAnnouncement.updatedAt.toISOString(),
        isActive: savedAnnouncement.isActive,
      }
    });
  } catch (error) {

    return NextResponse.json(
      { success: false, message: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
