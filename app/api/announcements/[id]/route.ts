import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }  // 👈 Changed to Promise
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;
    const { id } = await params;  // 👈 Await the params

    // Check if announcement exists and user is the author
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }  // 👈 Use the unwrapped id
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    if (existingAnnouncement.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const announcement = await prisma.announcement.update({
      where: { id },  // 👈 Use the unwrapped id
      data: {
        title: title || existingAnnouncement.title,
        content: content || existingAnnouncement.content
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }  // 👈 Changed to Promise
) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;  // 👈 Await the params

    // Check if announcement exists and user is the author
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }  // 👈 Use the unwrapped id
    });

    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    if (existingAnnouncement.authorId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.announcement.delete({
      where: { id }  // 👈 Use the unwrapped id
    });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}