/**
 * @fileoverview User Signout API Route
 * 
 * This API endpoint handles user logout by clearing authentication cookies.
 * It provides a secure way to terminate user sessions.
 * 
 * Key Features:
 * - Secure session termination
 * - HTTP-only cookie clearing
 * - Environment-aware security settings
 * - Simple and reliable logout process
 * 
 * Security Features:
 * - Immediate cookie expiration
 * - Secure cookie settings in production
 * - SameSite strict policy
 * - HTTP-only cookie enforcement
 * 
 * Use Cases:
 * - User-initiated logout
 * - Session timeout handling
 * - Security logout on suspicious activity
 * - Multi-device session management
 */

import { NextResponse } from 'next/server';
import { AUTH_CONSTANTS } from '@/config/constants';

/**
 * POST /api/signout - Terminate user session and clear authentication
 * 
 * This endpoint handles user logout by clearing the authentication
 * cookie that contains the JWT token. This effectively terminates
 * the user's session across the application.
 * 
 * Authentication:
 * - No authentication required (can be called from any state)
 * - Works even if token is expired
 * - Clears existing authentication cookies
 * 
 * Returns:
 * - 200: Signout successful with cookie cleared
 * - 500: Server error during signout
 * 
 * Response Format (Success):
 * {
 *   success: true,
 *   message: 'Signed out successfully'
 * }
 * 
 * Response Format (Error):
 * {
 *   success: false,
 *   message: 'Error during signout'
 * }
 * 
 * Security Notes:
 * - Cookie expiration set to 0 (immediate)
 * - Secure flag enabled in production
 * - SameSite strict policy prevents CSRF
 * - HTTP-only prevents XSS access
 * 
 * Usage Example:
 * // Handle user logout
 * const response = await fetch('/api/signout', { method: 'POST' });
 * const result = await response.json();
 * // Redirect to login page
 * if (result.success) {
 *   window.location.href = '/login';
 * }
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    });

    // Clear the auth cookie with secure settings
    response.cookies.set(AUTH_CONSTANTS.TOKEN_NAME, '', {
      httpOnly: true,  // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      sameSite: 'strict',  // Prevent CSRF attacks
      maxAge: 0,  // Expire immediately
      path: '/'  // Apply to entire domain
    });

    return response;

  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error during signout'
    }, { status: 500 });
  }
}
