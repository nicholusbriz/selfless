import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

// PUT - Update announcement (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { announcementId } = await params;
    const body = await request.json();
    const { title, content, deadline, isGlobal } = body;

    // Get the announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: {
        id: true,
        title: true,
        content: true,
        deadline: true,
        isGlobal: true,
        authorId: true,
        author: {
          select: {
            id: true,
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Check if user is owner
    if (announcement.authorId !== session.user.id) {
      return NextResponse.json({ error: 'You can only edit your own announcements' }, { status: 403 });
    }

    // Update announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: title || announcement.title,
        content: content || announcement.content,
        deadline: deadline ? new Date(deadline) : (announcement.deadline || null),
        isGlobal: isGlobal !== undefined ? isGlobal : announcement.isGlobal
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: {
              select: {
                name: true,
                displayName: true
              }
            }
          }
        },
        techCenter: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Announcement updated successfully',
      announcement: {
        ...updatedAnnouncement,
        author: {
          ...updatedAnnouncement.author,
          role: updatedAnnouncement.author.role as any
        }
      }
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete announcement (owner or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { announcementId } = await params;

    // Get the announcement with author
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        author: {
          select: {
            id: true,
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const isOwner = announcement.authorId === session.user.id;
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    });
    const isCurrentUserAdmin = currentUser?.role?.name === 'admin' || currentUser?.role?.name === 'super_admin';

    if (!isOwner && !isCurrentUserAdmin) {
      return NextResponse.json({ error: 'You can only delete your own announcements' }, { status: 403 });
    }

    // Delete announcement
    await prisma.announcement.delete({
      where: { id: announcementId }
    });

    return NextResponse.json({
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}