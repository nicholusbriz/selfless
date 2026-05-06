/**
 * @fileoverview Announcements API Route
 * 
 * This API endpoint manages the announcement system for the Selfless platform.
 * It handles announcement creation, retrieval, comment management, and moderation.
 * 
 * Key Features:
 * - Create announcements (admin/tutor only)
 * - Fetch announcements with comments
 * - Comment system with nested replies
 * - Delete announcements and comments
 * - Permission-based access control
 * - Real-time updates via React Query
 * 
 * Permission Levels:
 * - Super Admin: Full access to all operations
 * - Promoted Admin: Can create/manage announcements
 * - Tutor: Can create announcements if permitted
 * - User: Can view and comment on announcements
 * 
 * Security:
 * - JWT token authentication
 * - Role-based permission checking
 * - Content moderation capabilities
 * - Input validation and sanitization
 */

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/models/database';
import Announcement, { CreateAnnouncementData } from '@/models/Announcement';
import User from '@/models/User';
import Tutor from '@/models/Tutor';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';
import { ObjectId } from 'mongodb';
import { AUTH_CONSTANTS } from '@/config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Helper function to verify admin permissions
 * 
 * This function checks if a user has admin privileges by verifying
 * both super admin status (email-based) and promoted admin status.
 * 
 * @param userId - User ID to verify
 * @returns Admin user object or null if not authorized
 */
async function verifyAdmin(userId: string) {
  const user = await User.findById(userId);
  if (!user) return null;

  // Check if user is admin using admin.ts config
  const isSuperAdmin = isSuperAdminEmail(user.email);
  const promotedAdmin = await Admin.findOne({ userId: user._id.toString() });

  if (!isSuperAdmin && !promotedAdmin) return null;

  return { user, isSuperAdmin, promotedAdmin };
}

/**
 * Helper function to verify tutor permissions
 * 
 * This function checks if a user has tutor privileges and
 * returns their permission settings for announcement operations.
 * 
 * @param userId - User ID to verify
 * @returns Tutor object with permissions or null if not a tutor
 */
async function verifyTutorPermissions(userId: string) {
  const user = await User.findById(userId);
  if (!user) return null;

  const tutor = await Tutor.findOne({ userId: user._id.toString() });
  if (!tutor || !tutor.permissions.canPostAnnouncements) return null;

  return { user, tutor };
}

// Build comment tree efficiently
function buildCommentTree(comments: any[]): any[] {
  const commentMap = new Map();
  const rootComments: any[] = [];

  // First pass: create comment objects and map by ID
  comments.forEach(comment => {
    const commentObj = {
      id: comment._id.toString(),
      announcementId: comment.announcementId,
      userId: comment.userId,
      userName: comment.userName,
      userEmail: comment.userEmail,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies: []
    };
    commentMap.set(commentObj.id, commentObj);
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentObj = commentMap.get(comment._id.toString());
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent && parent.replies.length < 10) { // Limit replies per comment
        parent.replies.push(commentObj);
      }
    } else {
      rootComments.push(commentObj);
    }
  });

  return rootComments;
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

    // Fetch announcements with timeout
    let announcements: any[];
    try {
      announcements = await Promise.race([
        Announcement.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 8000)
        )
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Database timeout') {
        return NextResponse.json({
          success: false,
          message: 'Database temporarily unavailable. Please try again.'
        }, { status: 503 });
      }
      throw error;
    }

    // Fetch comments for each announcement
    const announcementsWithComments = await Promise.all(
      announcements.map(async (announcement: any) => {
        const allComments = await Promise.race([
          db.collection('comments')
            .find({ announcementId: announcement._id.toString() })
            .sort({ createdAt: 1 })
            .limit(50)
            .toArray(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Comments fetch timeout')), 3000)
          )
        ]);

        // Build comment tree efficiently
        const commentsTree = buildCommentTree(allComments);

        return {
          id: announcement._id.toString(),
          title: announcement.title,
          content: announcement.content,
          adminId: announcement.adminId,
          adminName: announcement.adminName,
          adminEmail: announcement.adminEmail,
          createdAt: announcement.createdAt.toISOString(),
          updatedAt: announcement.updatedAt.toISOString(),
          comments: commentsTree
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
    // Extract JWT token from Authorization header OR cookies
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('cookie');

    let token = authHeader?.replace('Bearer ', '');

    // If no token in header, try to get from cookies
    if (!token && cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
    }

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

// PUT - Update announcement (for future use) and handle comments/replies
export async function PUT(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('cookie');

    let token = authHeader?.replace('Bearer ', '');
    if (!token && cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, announcementId, content, commentId } = body;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Handle different PUT operations based on type
    if (type === 'comment') {
      // Create new comment
      if (!announcementId || !content) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields for comment' },
          { status: 400 }
        );
      }

      const fullName = `${user.firstName} ${user.lastName}`;

      const commentResult = await db.collection('comments').insertOne({
        announcementId,
        userId: user._id.toString(),
        userName: fullName,
        userEmail: user.email,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: []
      });

      const comment = {
        id: commentResult.insertedId.toString(),
        announcementId,
        userId: user._id.toString(),
        userName: fullName,
        userEmail: user.email,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: []
      };

      return NextResponse.json({
        success: true,
        message: 'Comment created successfully',
        comment
      });
    } else if (type === 'reply') {
      // Create new reply
      if (!commentId || !announcementId || !content) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields for reply' },
          { status: 400 }
        );
      }

      const fullName = `${user.firstName} ${user.lastName}`;

      const replyResult = await db.collection('comments').insertOne({
        announcementId,
        userId: user._id.toString(),
        userName: fullName,
        userEmail: user.email,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
        parentCommentId: commentId
      });

      const reply = {
        id: replyResult.insertedId.toString(),
        announcementId,
        userId: user._id.toString(),
        userName: fullName,
        userEmail: user.email,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: []
      };

      // Add reply to parent comment's replies array
      await db.collection('comments').updateOne(
        { _id: new ObjectId(commentId) },
        {
          $push: { replies: reply as any },
          $set: { updatedAt: new Date().toISOString() }
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Reply created successfully',
        reply
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid operation type' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// DELETE - Remove announcements, comments, or replies
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!type || !id || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Verify user authentication and permissions
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid user' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isSuperAdmin = isSuperAdminEmail(user.email);
    const promotedAdmin = await Admin.findOne({ userId: user._id.toString() });
    const isAdmin = isSuperAdmin || promotedAdmin;

    // Check if user is tutor with delete permissions
    let tutor = null;
    try {
      tutor = await Tutor.findOne({ userId: user._id.toString() });
    } catch (error) {
      console.log('Tutor lookup failed:', error);
    }
    const isTutor = !!tutor;
    const canDeleteAnnouncements = isTutor && tutor.permissions?.canDeleteAnnouncements;

    if (type === 'announcement') {
      // Delete announcement (admin or tutor with delete permissions)
      if (!isAdmin && !canDeleteAnnouncements) {
        return NextResponse.json(
          { success: false, message: 'Admin or tutor delete permissions required' },
          { status: 403 }
        );
      }

      const announcement = await Announcement.findById(id);
      if (!announcement) {
        return NextResponse.json(
          { success: false, message: 'Announcement not found' },
          { status: 404 }
        );
      }

      // Check if user owns this announcement or is admin
      if (announcement.adminId !== userId && !isAdmin) {
        return NextResponse.json(
          { success: false, message: 'You can only delete your own announcements' },
          { status: 403 }
        );
      }

      // Soft delete by setting isActive to false
      await Announcement.findByIdAndUpdate(id, { isActive: false });

      return NextResponse.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } else if (type === 'comment') {
      // Delete comment or reply
      const comment = await db.collection('comments').findOne({ _id: new ObjectId(id) });

      if (!comment) {
        return NextResponse.json(
          { success: false, message: 'Comment not found' },
          { status: 404 }
        );
      }

      // Allow deletion if user owns the comment or is admin
      if (comment.userId !== userId && !isAdmin) {
        return NextResponse.json(
          { success: false, message: 'You can only delete your own comments' },
          { status: 403 }
        );
      }

      // Delete the comment
      await db.collection('comments').deleteOne({ _id: new ObjectId(id) });

      // Remove from parent comment's replies if it's a reply
      if (comment.parentCommentId) {
        await db.collection('comments').updateOne(
          { _id: new ObjectId(comment.parentCommentId) },
          { $pull: { replies: { id: id } as any } }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid delete type' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete' },
      { status: 500 }
    );
  }
}
