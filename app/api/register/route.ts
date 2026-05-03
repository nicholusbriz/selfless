import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from '@/config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { firstName, lastName, email, password, phoneNumber } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, message: 'Please fill in all fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber: phoneNumber || undefined,
      isRegistered: true // Mark as registered student
    });

    await newUser.save();

    // Create JWT token (same as login)
    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Set HTTP-only cookie (same as login)
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        fullName: `${newUser.firstName} ${newUser.lastName}`
      }
    });

    response.cookies.set(AUTH_CONSTANTS.TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AUTH_CONSTANTS.COOKIE_MAX_AGE, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
