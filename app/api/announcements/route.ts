import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { broadcastToAll } from '@/lib/websocket-server';



// GET /api/announcements - Get all announcements

export async function GET(request: NextRequest) {

  try {

    const userId = request.headers.get('x-user-id');

    

    if (!userId) {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    }



    const announcements = await prisma.announcement.findMany({

      include: {

        author: {

          select: {

            id: true,

            firstName: true,

            lastName: true,

            email: true,

            profileImageUrl: true

          }

        }

      },

      orderBy: {

        createdAt: 'desc'

      }

    });



    // Filter out announcements with null/undefined authors to prevent split errors

    const validAnnouncements = announcements

      .filter(ann => ann.author !== null && ann.author !== undefined)

      .map(ann => {

        // Log each announcement for debugging

        console.log('Processing announcement:', {

          id: ann.id,

          author: ann.author,

          title: ann.title

        });

        

        return {

          ...ann,

          author: {

            id: ann.author.id || '',

            firstName: ann.author.firstName || '',

            lastName: ann.author.lastName || '',

            email: ann.author.email || '',

            profileImageUrl: ann.author.profileImageUrl || null

          }

        };

      });



    console.log('Returning announcements:', validAnnouncements.length);

    return NextResponse.json({ announcements: validAnnouncements });

  } catch (error) {

    console.error('Error fetching announcements:', error);

    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });

  }

}



// POST /api/announcements - Create new announcement

export async function POST(request: NextRequest) {

  try {

    const userId = request.headers.get('x-user-id');

    

    if (!userId) {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    }



    const body = await request.json();

    const { title, content } = body;



    if (!title || !content) {

      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });

    }



    const announcement = await prisma.announcement.create({

      data: {

        title,

        content,

        authorId: userId

      },

      include: {

        author: {

          select: {

            id: true,

            firstName: true,

            lastName: true,

            email: true,

            profileImageUrl: true

          }

        }

      }

    });



    // Broadcast new announcement to all connected clients

    broadcastToAll('announcement:created', announcement);



    return NextResponse.json({ announcement }, { status: 201 });

  } catch (error) {

    console.error('Error creating announcement:', error);

    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });

  }

}

