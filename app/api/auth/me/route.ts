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
      include: {
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

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}