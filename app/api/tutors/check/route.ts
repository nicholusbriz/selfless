import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Tutor from '@/models/Tutor';
import jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from '@/config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to verify user token (for tutor checking)
async function verifyUserToken(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) return null;

    return { user };
  } catch {
    return null;
  }
}

// POST - Check if current user is a promoted tutor
export async function POST(request: Request) {
  try {
    await connectDB();

    // Verify user is authenticated
    const userData = await verifyUserToken(request);
    if (!userData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    const { user } = userData;

    // Check if user is a promoted tutor
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
