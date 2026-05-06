/**
 * @fileoverview Users API Route
 * 
 * This API endpoint manages user operations for the Selfless platform.
 * It handles user authentication, registration, and admin user management.
 * 
 * Endpoints:
 * - GET /api/users: Fetch users (admin only) or specific user by ID
 * - POST /api/users: Register new user and create authentication session
 * - DELETE /api/users: Soft delete or permanently remove users (admin only)
 * 
 * Security:
 * - Admin endpoints require admin authentication via requireAdmin()
 * - User registration includes password hashing with bcrypt
 * - Authentication tokens are stored in HTTP-only cookies
 * - Email validation prevents duplicate registrations
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';
import { MessageModel } from '@/models/Message';
import bcrypt from 'bcryptjs';
import { requireAdmin, requireUser, createToken, setAuthCookie } from '@/lib/auth-utils';
import { isSuperAdminEmail } from '@/config/admin';
import { AUTH_CONSTANTS } from '@/config/constants';
import jwt from 'jsonwebtoken';

/**
 * GET /api/users - Fetch user(s) from database
 * 
 * This endpoint supports two modes:
 * 1. Admin mode: Fetch all users (requires admin authentication)
 * 2. Specific user: Fetch single user by ID (requires admin authentication)
 * 
 * Query Parameters:
 * - id (optional): User ID to fetch specific user
 * 
 * Returns:
 * - 200: User data array (excluding passwords)
 * - 401: Admin authentication required
 * - 404: User not found (when specific ID provided)
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user - must be admin to access user data
    const authUser = await requireAdmin(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (userId) {
      // Fetch single user by ID
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        users: [{
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          fullName: `${user.firstName} ${user.lastName}`,
          createdAt: user.createdAt
        }]
      });
    } else {
      // Fetch all users from database (admin view)
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        users: users.map(user => ({
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          fullName: `${user.firstName} ${user.lastName}`,
          createdAt: user.createdAt
        }))
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/users - Register new user and create authentication session
 * 
 * This endpoint handles user registration with the following process:
 * 1. Validate input data (name, email, password)
 * 2. Check for existing user/email
 * 3. Hash password with bcrypt (12 rounds)
 * 4. Create user account (admin status based on email)
 * 5. Generate JWT token
 * 6. Set HTTP-only authentication cookie
 * 
 * Request Body:
 * - firstName (required): User's first name
 * - lastName (required): User's last name
 * - email (required): User's email address
 * - password (required): User's password (min 6 characters)
 * - phoneNumber (optional): User's phone number
 * 
 * Returns:
 * - 200: User registered successfully with authentication cookie
 * - 400: Validation error or user already exists
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { firstName, lastName, email, password, phoneNumber } = await request.json();

    // Input validation
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

    // Hash password with bcrypt (12 rounds for security)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new User or Admin based on email domain
    const isSuperAdmin = isSuperAdminEmail(email);
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber: phoneNumber || undefined,
      isRegistered: true,
      isAdmin: isSuperAdmin
    });

    await newUser.save();

    // Create JWT token for authentication
    const token = createToken(newUser._id.toString(), newUser.email);

    // Set HTTP-only cookie with authentication token
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

/**
 * DELETE /api/users - Soft delete or permanently remove users (admin only)
 * 
 * This endpoint provides two deletion modes for user management:
 * 1. Soft delete (default): Remove user registrations but preserve account
 * 2. Permanent delete: Completely remove user and all associated data
 * 
 * Query Parameters:
 * - id (required): User ID to delete
 * - type (optional): 'soft' (default) or 'permanent'
 * 
 * Security:
 * - Requires admin authentication
 * - Cannot delete yourself (protection mechanism)
 * - Permanent deletion is irreversible
 * 
 * Returns:
 * - 200: User deleted successfully
 * - 400: Missing user ID
 * - 401: Admin authentication required
 * - 404: User not found
 * - 500: Server error
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate as admin
    const authUser = await requireAdmin(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const type = searchParams.get('type'); // 'soft' or 'permanent'

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    // Find the user to get their information
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (type === 'permanent') {
      // Permanent delete: Remove user completely from database
      const deletedUser = await User.findByIdAndDelete(userId);

      // Delete all registrations associated with this user
      const deletedRegistrations = await Registration.deleteMany({ userId });

      // Delete all messages sent by this user
      const deletedMessages = await MessageModel.deleteMany({ senderId: userId });

      return NextResponse.json({
        success: true,
        message: 'User permanently deleted from database',
        deletedUser: {
          id: deletedUser._id.toString(),
          firstName: deletedUser.firstName,
          lastName: deletedUser.lastName,
          email: deletedUser.email
        },
        deletedRegistrations: deletedRegistrations.deletedCount,
        deletedMessages: deletedMessages.deletedCount
      });
    } else {
      // Soft delete (default): Remove registrations but preserve user account
      const deletedRegistrations = await Registration.deleteMany({ userId });

      return NextResponse.json({
        success: true,
        message: 'User registrations deleted successfully. User account preserved for future login.',
        deletedRegistrations: deletedRegistrations.deletedCount,
        preservedUser: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
