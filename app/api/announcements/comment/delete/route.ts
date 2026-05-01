import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { ObjectId } from 'mongodb';
import User from '@/models/User';
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!commentId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing comment ID or user ID' },
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

    // Check if user owns the comment or is admin
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const adminData = await verifyAdmin(userId);

    // Allow deletion if user owns the comment or is admin
    if (comment.userId !== userId && !adminData) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Delete the comment
    await db.collection('comments').deleteOne({ _id: new ObjectId(commentId) });

    // Remove from parent comment's replies if it's a reply
    if (comment.parentCommentId) {
      await db.collection('comments').updateOne(
        { _id: new ObjectId(comment.parentCommentId) },
        { $pull: { replies: { id: commentId } } } as any
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {

    return NextResponse.json(
      { success: false, message: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
