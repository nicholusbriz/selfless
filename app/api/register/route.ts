import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { requireUser, createToken, setAuthCookie } from '@/lib/auth-utils';
import { AUTH_CONSTANTS } from '@/config/constants';

export async function POST(request: NextRequest) {
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

    // Check if User already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new User
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber: phoneNumber || undefined,
      isRegistered: true // Mark as registered student
    });

    await newUser.save();

    // Create JWT token
    const token = createToken(newUser._id.toString(), newUser.email);

    // Set HTTP-only cookie
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

    setAuthCookie(response, token);
    return response;
  } catch (error) {

    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
