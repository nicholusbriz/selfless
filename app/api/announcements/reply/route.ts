import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { ObjectId } from 'mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { commentId, announcementId, userId, userName, userEmail, content } = await request.json();

    if (!commentId || !announcementId || !userId || !userName || !userEmail || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    // Fetch user's full name from database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    // Create reply
    const replyResult = await db.collection('comments').insertOne({
      announcementId,
      userId,
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
      userId,
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
        $push: { replies: reply },
        $set: { updatedAt: new Date().toISOString() }
      } as any
    );

    return NextResponse.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create reply' },
      { status: 500 }
    );
  }
}
