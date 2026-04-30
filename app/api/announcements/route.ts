import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/models/database';
import Announcement, { CreateAnnouncementData } from '@/models/Announcement';

// Recursive function to fetch nested replies
async function fetchNestedReplies(parentCommentId: string, db: { collection: (name: string) => { find: (query: any) => { sort: (sort: any) => { toArray: () => Promise<any[]> } } } }, depth = 0): Promise<any[]> {
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
    const body: CreateAnnouncementData = await request.json();

    if (!body.title || !body.content || !body.adminId || !body.adminName || !body.adminEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

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
