/**
 * @fileoverview User Authentication API Route
 * 
 * This API endpoint handles user authentication for the Selfless platform.
 * It provides secure login functionality with JWT token management.
 * 
 * Key Features:
 * - Email-based authentication
 * - JWT token generation and HTTP-only cookie management
 * - User session establishment
 * - Security-conscious error messaging
 * - Email normalization and validation
 * 
 * Authentication Flow:
 * 1. User submits email
 * 2. Server validates email exists in database
 * 3. JWT token is generated and stored in HTTP-only cookie
 * 4. User session is established for subsequent requests
 * 
 * Security Features:
 * - HTTP-only cookies prevent XSS attacks
 * - Generic error messages prevent email enumeration
 * - Email normalization for consistent authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createToken, setAuthCookie } from '@/lib/auth-utils';
import connectDB from '@/models/database';
import User from '@/models/User';

/**
 * POST /api/login - Authenticate user and establish session
 * 
 * This endpoint handles user login by validating email and
 * creating an authenticated session with JWT tokens.
 * 
 * Request Body:
 * - email (required): User's email address
 * 
 * Authentication Process:
 * 1. Validate input parameters
 * 2. Find user by normalized email
 * 3. Generate JWT token upon successful authentication
 * 4. Set HTTP-only cookie with token
 * 
 * Returns:
 * - 200: Authentication successful with user data and cookie
 * - 400: Missing required fields
 * - 401: Invalid email (generic message for security)
 * - 500: Server error
 * 
 * Response Format (Success):
 * {
 *   success: true,
 *   user: {
 *     id: string,
 *     firstName: string,
 *     lastName: string,
 *     email: string,
 *     fullName: string,
 *     isAdmin: boolean,
 *     isTutor: boolean
 *   }
 * }
 * 
 * Security Notes:
 * - Error messages are generic to prevent email enumeration
 * - Tokens are stored in HTTP-only cookies for security
 * - Email addresses are normalized to lowercase
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Input validation
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Find user by normalized email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Email not found. If you\'re new, please register first.'
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
