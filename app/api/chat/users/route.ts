/**
 * @fileoverview Chat Users API Route
 * 
 * This API endpoint provides user data for the chat system.
 * It returns a list of users that can be contacted for messaging.
 * 
 * Key Features:
 * - Fetch users for chat functionality
 * - Exclude current user from results
 * - Provide user contact information
 * - Support for user search and discovery
 * 
 * Use Cases:
 * - Populate chat user list
 * - Enable user search in chat
 * - Display user profiles in messaging
 * - Support for starting new conversations
 * 
 * Security:
 * - Requires user authentication
 * - Excludes current user for privacy
 * - Returns only necessary user information
 * - No sensitive data exposure
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/models/database';
import User from '@/models/User';
import { requireUser } from '@/lib/auth-utils';

/**
 * GET /api/chat/users - Fetch users for chat functionality
 * 
 * This endpoint retrieves a list of users available for chat,
 * excluding the current user from the results.
 * 
 * Query Parameters:
 * - currentUserId (required): ID of the requesting user
 * 
 * Authentication:
 * - Requires user authentication
 * - Uses JWT token from HTTP-only cookies
 * - Users can only see other users (not themselves)
 * 
 * Returns:
 * - 200: List of users available for chat
 * - 400: Missing currentUserId parameter
 * - 401: Authentication required
 * - 500: Server error
 * 
 * Response Format:
 * {
 *   success: true,
 *   users: [{
 *     id: string,
 *     firstName: string,
 *     lastName: string,
 *     fullName: string,
 *     email: string
 *   }]
 * }
 * 
 * Usage Example:
 * // Fetch chat users
 * const response = await fetch('/api/chat/users?currentUserId=123');
 * const { users } = await response.json();
 * // Display users in chat sidebar
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const authUser = await requireUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('currentUserId');

    if (!currentUserId) {
      return NextResponse.json({ success: false, message: 'Current user ID required' }, { status: 400 });
    }

    // Fetch all users except current user for chat
    const users = await User.find({
      _id: { $ne: currentUserId }
    }).select('firstName lastName email').sort({ firstName: 1, lastName: 1 });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }))
    });

  } catch (error) {
    console.error('Error fetching chat users:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
