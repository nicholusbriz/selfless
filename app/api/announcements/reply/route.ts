import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/models/database';
import { ObjectId } from 'mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify user token
async function verifyUserToken(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies['auth-token'];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) return null;

    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const authenticatedUser = await verifyUserToken(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { commentId, announcementId, userId, userName, userEmail, content } = await request.json();

    if (!commentId || !announcementId || !userId || !userName || !userEmail || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Security: Ensure user can only post as themselves
    if (userId !== authenticatedUser._id.toString() ||
      userEmail !== authenticatedUser.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You can only post replies as yourself' },
        { status: 403 }
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

    // Use authenticated user data (override provided data for security)
    const fullName = `${authenticatedUser.firstName} ${authenticatedUser.lastName}`;

    // Create reply
    const replyResult = await db.collection('comments').insertOne({
      announcementId,
      userId: authenticatedUser._id.toString(),
      userName: fullName,
      userEmail: authenticatedUser.email,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      parentCommentId: commentId
    });

    const reply = {
      id: replyResult.insertedId.toString(),
      announcementId,
      userId: authenticatedUser._id.toString(),
      userName: fullName,
      userEmail: authenticatedUser.email,
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
      } as { $push: { replies: any }; $set: { updatedAt: string } }
    );

    return NextResponse.json({
      success: true,
      reply
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create reply' },
      { status: 500 }
    );
  }
}
