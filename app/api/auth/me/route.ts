import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Try to get user ID from middleware headers first
    let userId = request.headers.get('x-user-id');
    
    // If no headers, fall back to cookie verification
    if (!userId) {
      const token = request.cookies.get('token')?.value;
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Not authenticated' },
          { status: 401 }
        );
      }
      
      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        return NextResponse.json(
          { success: false, message: 'Invalid token' },
          { status: 401 }
        );
      }
      
      userId = decoded.userId;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        profileImageUrl: true,
        country: true,
        city: true,
        town: true,
        street: true,
        generalCourse: true,
        techCenter: true,
        linkedinUrl: true,
        githubUrl: true,
        projectUrls: true,
        roleId: true,
        role: true,
        studentProfile: true,
        teacherProfile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}