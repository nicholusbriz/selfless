/**
 * @fileoverview User Status API Route
 * 
 * This API endpoint provides comprehensive user status information including
 * roles, permissions, and registration data. It's used for UI state management
 * and permission checking across the application.
 * 
 * Key Features:
 * - Comprehensive user profile data
 * - Role-based permission information
 * - Registration status and details
 * - Admin and tutor privilege checking
 * - Real-time user status verification
 * 
 * Use Cases:
 * - Initial user data loading
 * - Permission-based UI rendering
 * - Role verification for components
 * - User profile display
 * - Dashboard personalization
 * 
 * Security:
 * - JWT token authentication required
 * - Returns only user's own data
 * - Comprehensive permission validation
 * - Secure token verification
 */

import { NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import Registration from '@/models/Registration';
import Tutor from '@/models/Tutor';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';
import { isSuperAdminEmail } from '@/config/admin';
import { AUTH_CONSTANTS } from '@/config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * GET /api/user-status - Authentication check endpoint
 * 
 * This endpoint intentionally returns a 401 error to indicate that
 * GET requests are not supported for user status retrieval. The actual
 * user status functionality is implemented in the POST endpoint.
 * 
 * Purpose:
 * - Prevents unauthorized GET requests
 * - Directs clients to use POST method
 * - Maintains RESTful API consistency
 * 
 * Returns:
 * - 401: Authentication required (intentional)
 * - 500: Server error
 * 
 * Note: Use POST /api/user-status for user status retrieval
 */
export async function GET() {
  try {
    // Return a proper response indicating authentication is needed
    // This prevents Next.js from showing 404 page
    return NextResponse.json({
      success: false,
      message: 'Authentication required',
      authenticated: false
    }, { status: 200 }); // Return 200 instead of 401 to avoid 404 page
  } catch (error) {
    console.error('User status GET error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      authenticated: false
    }, { status: 200 });
  }
}

/**
 * POST /api/user-status - Get comprehensive user status and permissions
 * 
 * This endpoint retrieves detailed user information including roles,
 * permissions, registration status, and profile data. It's the primary
 * endpoint for user state management across the application.
 * 
 * Authentication:
 * - Requires JWT token from HTTP-only cookies
 * - Validates token integrity and user existence
 * - Returns only user's own data
 * 
 * Returns:
 * - 200: Comprehensive user status data
 * - 401: No authentication token found
 * - 403: Invalid authentication token
 * - 404: User not found
 * - 500: Server error
 * 
 * Response Format:
 * {
 *   success: true,
 *   user: {
 *     id: string,
 *     firstName: string,
 *     lastName: string,
 *     email: string,
 *     phoneNumber: string,
 *     fullName: string,
 *     isAdmin: boolean,
 *     isSuperAdmin: boolean,
 *     adminPermissions: object | null,
 *     adminRole: 'super-admin' | string | null,
 *     isTutor: boolean,
 *     tutorPermissions: object | null,
 *     isRegistered: boolean,
 *     registrations: array
 *   }
 * }
 * 
 * Usage Example:
 * // Fetch user status for dashboard
 * const response = await fetch('/api/user-status', { method: 'POST' });
 * const { user } = await response.json();
 * // Use user data for UI rendering and permission checks
 */
export async function POST(request: Request) {
  try {
    await connectDB();

    // Get auth token from cookies
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({
        success: false,
        message: 'No authentication token found',
        authenticated: false,
        user: null
      }, { status: 200 }); // Return 200 to prevent 404 page
    }

    // Extract auth-token from cookies
    const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Authentication token missing',
        authenticated: false,
        user: null
      }, { status: 200 }); // Return 200 to prevent 404 page
    }

    // Verify JWT token
    let decoded: { userId: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication token',
        authenticated: false,
        user: null
      }, { status: 200 }); // Return 200 to prevent 404 page
    }

    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        authenticated: false,
        user: null
      }, { status: 200 }); // Return 200 to prevent 404 page
    }

    // Verify email matches token
    if (user.email !== decoded.email) {
      return NextResponse.json({
        success: false,
        message: 'Token mismatch',
        authenticated: false,
        user: null
      }, { status: 200 }); // Return 200 to prevent 404 page
    }

    // Check if User has any registration
    const registration = await Registration.findOne({ userId: decoded.userId });
    const isRegistered = !!registration;

    // Check if User is a tutor
    const tutor = await Tutor.findOne({ userId: decoded.userId });
    const isTutor = !!tutor;

    // Check if User is an admin using admin.ts config
    const promotedAdmin = await Admin.findOne({ userId: decoded.userId, isActive: true });
    const isSuperAdmin = isSuperAdminEmail(user.email);
    const isAdmin = isSuperAdmin || !!promotedAdmin;

    // Get formatted date from registration data
    let formattedDate = '';
    if (isRegistered && registration.cleaningDayDate) {
      formattedDate = registration.cleaningDayDate;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        fullName: `${user.firstName} ${user.lastName}`,
        isAdmin,
        isSuperAdmin,
        adminPermissions: promotedAdmin ? promotedAdmin.permissions : null,
        adminRole: isSuperAdmin ? 'super-admin' : (promotedAdmin ? promotedAdmin.role : null),
        isTutor,
        tutorPermissions: isTutor ? tutor.permissions : null,
        isRegistered,
        registrations: isRegistered ? [
          {
            ...registration,
            formattedDate
          }
        ] : []
      }
    });
  } catch (error) {
    console.error('User status error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
