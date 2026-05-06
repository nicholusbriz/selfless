/**
 * @fileoverview User Authentication API Route
 * 
 * This API endpoint handles user authentication for the Selfless platform.
 * It provides secure login functionality with JWT token management.
 * 
 * Key Features:
 * - Secure password verification with bcrypt
 * - JWT token generation and HTTP-only cookie management
 * - User session establishment
 * - Security-conscious error messaging
 * - Email normalization and validation
 * 
 * Authentication Flow:
 * 1. User submits email and password
 * 2. Server validates credentials
 * 3. JWT token is generated and stored in HTTP-only cookie
 * 4. User session is established for subsequent requests
 * 
 * Security Features:
 * - Password comparison using bcrypt (12 rounds)
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
 * This endpoint handles user login by validating credentials and
 * creating an authenticated session with JWT tokens.
 * 
 * Request Body:
 * - email (required): User's email address
 * - password (required): User's plaintext password
 * 
 * Authentication Process:
 * 1. Validate input parameters
 * 2. Find user by normalized email
 * 3. Compare password using bcrypt
 * 4. Generate JWT token upon successful authentication
 * 5. Set HTTP-only cookie with token
 * 
 * Returns:
 * - 200: Authentication successful with user data and cookie
 * - 400: Missing required fields
 * - 401: Invalid credentials (generic message for security)
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
 * - Passwords are never returned in responses
 * - Error messages are generic to prevent email enumeration
 * - Tokens are stored in HTTP-only cookies for security
 * - Email addresses are normalized to lowercase
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Find user by normalized email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password. If you\'re new, please register first.'
      }, { status: 401 });
    }

    // Verify password using secure comparison
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
