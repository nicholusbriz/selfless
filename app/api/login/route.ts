import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';

export async function POST(request: Request) {
  console.log('🔐 Login API called');

  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    const { email } = await request.json();
    console.log('📧 Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, message: 'Email not found. Please register first.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`
      }
    });

  } catch (error) {
    console.error('❌ Login API error:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 });
  }
}
