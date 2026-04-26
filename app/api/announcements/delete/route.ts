import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/models/database';
import Announcement from '@/models/Announcement';

// DELETE announcement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('id');
    const adminId = searchParams.get('adminId');

    if (!announcementId || !adminId) {
      return NextResponse.json(
        { success: false, message: 'Missing announcement ID or admin ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // First verify the announcement exists and belongs to this admin
    const announcement = await Announcement.findOne({
      _id: announcementId,
      adminId: adminId
    });

    if (!announcement) {
      return NextResponse.json(
        { success: false, message: 'Announcement not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the announcement
    await Announcement.deleteOne({
      _id: announcementId
    });

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
