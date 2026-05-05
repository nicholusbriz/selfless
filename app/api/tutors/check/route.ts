import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-utils';
import connectDB from '@/models/database';
import Tutor from '@/models/Tutor';

// POST - Check if current User is a promoted tutor
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify User is authenticated
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Check if User is a promoted tutor
    const tutorRecord = await Tutor.findOne({
      userId: user._id.toString(),
      isActive: true
    });

    if (!tutorRecord) {
      return NextResponse.json({
        success: false,
        isTutor: false,
        message: 'User is not a promoted tutor'
      });
    }

    return NextResponse.json({
      success: true,
      isTutor: true,
      tutor: {
        id: tutorRecord._id.toString(),
        userId: tutorRecord.userId,
        email: tutorRecord.email,
        fullName: tutorRecord.fullName,
        permissions: tutorRecord.permissions
      }
    });

  } catch (error) {
    console.error('Error checking tutor status:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
