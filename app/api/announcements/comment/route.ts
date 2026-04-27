import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { announcementId, userId, userName, userEmail, content } = await request.json();

    if (!announcementId || !userId || !userName || !userEmail || !content) {
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

    // Create comment
    const commentResult = await db.collection('comments').insertOne({
      announcementId,
      userId,
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
      userId,
      userName: fullName,
      userEmail: user.email,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: []
    };

    return NextResponse.json({
      success: true,
      comment
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
