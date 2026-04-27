import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { ObjectId } from 'mongodb';

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

    // Check if user owns the comment
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(commentId) });

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.userId !== userId) {
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
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
