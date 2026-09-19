import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { takesReligion, tuitionAmount } = body;

    const updateData: any = {};

    if (typeof takesReligion === 'boolean') {
      updateData.takesReligion = takesReligion;
    }

    // Allow 0 as a valid value
    if (tuitionAmount !== undefined && tuitionAmount !== null && tuitionAmount !== '') {
      const parsed = parseFloat(tuitionAmount);
      if (!isNaN(parsed)) {
        updateData.tuitionAmount = parsed;
      }
    } else if (tuitionAmount === '') {
      // Explicit clear — set to null so the DB reflects no tuition
      updateData.tuitionAmount = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        takesReligion: true,
        tuitionAmount: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating academic settings:', error);
    return NextResponse.json({ error: 'Failed to update academic settings' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        takesReligion: true,
        tuitionAmount: true
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching academic settings:', error);
    return NextResponse.json({ error: 'Failed to fetch academic settings' }, { status: 500 });
  }
}
