import { NextRequest, NextResponse } from 'next/server';
import { createToken, setAuthCookie } from '@/lib/auth-utils';
import connectDB from '@/models/database';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password. If you\'re new, please register first.'
      }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password. Please check your credentials and try again.'
      }, { status: 401 });
    }

    // Create JWT token
    const token = createToken(user._id.toString(), user.email);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`
      }
    });

    setAuthCookie(response, token);
    return response;

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 });
  }
}
