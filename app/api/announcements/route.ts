import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/models/database';
import Announcement, { CreateAnnouncementData } from '@/models/Announcement';

// GET all announcements
export async function GET() {
  try {
    await connectToDatabase();

    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      announcements: announcements.map(announcement => ({
        id: announcement._id.toString(),
        title: announcement.title,
        content: announcement.content,
        adminName: announcement.adminName,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
      }))
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
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
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
