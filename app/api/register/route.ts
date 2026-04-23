import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { firstName, lastName, email, password } = await request.json();

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
      password: hashedPassword
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        fullName: `${newUser.firstName} ${newUser.lastName}`
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
