/**
 * @fileoverview Tutor Status Verification API Route
 * 
 * This API endpoint checks if the current authenticated user has tutor privileges.
 * It's used for UI permission checks and real-time status verification.
 * 
 * Key Features:
 * - Real-time tutor status verification
 * - Permission-based UI control
 * - Lightweight endpoint for frequent calls
 * - User self-service status checking
 * 
 * Use Cases:
 * - Show/hide tutor-specific UI elements
 * - Component-level permission validation
 * - Real-time permission updates
 * - Feature access control
 * 
 * Security:
 * - Requires user authentication
 * - Returns only user's own status
 * - No admin privileges required
 * - Safe for frequent UI calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth-utils';
import connectDB from '@/models/database';
import Tutor from '@/models/Tutor';

/**
 * POST /api/tutors/check - Verify current user's tutor status
 * 
 * This endpoint allows authenticated users to check if they have
 * tutor privileges and what permissions they possess.
 * 
 * Authentication:
 * - Requires user authentication (any role)
 * - Uses JWT token from HTTP-only cookies
 * - Users can only check their own status
 * 
 * Returns:
 * - 200: Tutor status with permissions (if tutor)
 * - 200: Non-tutor status (if not a tutor)
 * - 401: Authentication required
 * - 500: Server error
 * 
 * Response Format (Tutor):
 * {
 *   success: true,
 *   isTutor: true,
 *   tutor: {
 *     id: string,
 *     userId: string,
 *     email: string,
 *     fullName: string,
 *     permissions: {
 *       canViewAnnouncements: boolean,
 *       canPostAnnouncements: boolean,
 *       canManageUsers: boolean
 *     }
 *   }
 * }
 * 
 * Response Format (Non-Tutor):
 * {
 *   success: false,
 *   isTutor: false,
 *   message: 'User is not a promoted tutor'
 * }
 * 
 * Usage Example:
 * // Frontend component check
 * const response = await fetch('/api/tutors/check', { method: 'POST' });
 * const { isTutor, tutor } = await response.json();
 * if (isTutor) {
 *   // Show tutor features
 * }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify user is authenticated
    const user = await requireUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user is a promoted tutor
    const tutorRecord = await Tutor.findOne({
      userId: user._id.toString(),
      isActive: true
    });

    if (!tutorRecord) {
      return NextResponse.json({
        success: false,
        isTutor: false,
        message: 'User is not a promoted tutor'
      });
    }

    return NextResponse.json({
      success: true,
      isTutor: true,
      tutor: {
        id: tutorRecord._id.toString(),
        userId: tutorRecord.userId,
        email: tutorRecord.email,
        fullName: tutorRecord.fullName,
        permissions: tutorRecord.permissions
      }
    });

  } catch (error) {
    console.error('Error checking tutor status:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
