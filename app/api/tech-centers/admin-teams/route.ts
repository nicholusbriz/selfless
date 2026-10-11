import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

// GET - Fetch all tech centers with their admin and teacher users
export async function GET(request: NextRequest) {
  try {
    const techCenters = await prisma.techCenter.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
        country: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const techCentersWithTeams = await Promise.all(
      techCenters.map(async (techCenter) => {
        // Fetch admins (managers)
        const admins = await prisma.user.findMany({
          where: {
            techCenterId: techCenter.id,
            role: { name: 'admin' },
            status: 'ACTIVE',
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
          orderBy: { lastName: 'asc' },
        });

        // Fetch teachers (tutors)
        const teachers = await prisma.user.findMany({
          where: {
            techCenterId: techCenter.id,
            role: { name: 'teacher' },
            status: 'ACTIVE',
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
          orderBy: { lastName: 'asc' },
        });

        return {
          ...techCenter,
          admins,
          teachers,
        };
      })
    );

    return NextResponse.json({
      success: true,
      techCenters: techCentersWithTeams,
    });
  } catch (error) {
    console.error('Error fetching tech center admin teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tech center admin teams' },
      { status: 500 }
    );
  }
}
