import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/models/database';
import User from '@/models/User';
import Admin from '@/models/Admin';
import { isSuperAdminEmail } from '@/config/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface DecodedToken {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface RegularUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

/**
 * Verify JWT token from request and return user data
 */
export async function verifyUserToken(request: NextRequest): Promise<RegularUser | null> {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded || !decoded.userId) {
      return null;
    }

    // Connect to database and fetch user with timeout
    try {
      await connectDB();
      const user = await User.findById(decoded.userId).maxTimeMS(5000); // 5 second timeout

      if (!user) {
        return null;
      }

      return {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`
      };
    } catch (error) {
      console.error('Database timeout or error:', error instanceof Error ? error.message : String(error));
      return null;
    }
  } catch (error) {
    console.error('Error verifying user token:', error);
    return null;
  }
}

/**
 * Verify JWT token and check if user is admin
 */
export async function verifyAdminToken(request: NextRequest): Promise<AdminUser | null> {
  try {
    // First verify as regular user
    const user = await verifyUserToken(request);

    if (!user) {
      return null;
    }

    // Connect to database and fetch full user data to check admin status
    await connectDB();
    const fullUser = await User.findById(user.id).maxTimeMS(5000); // 5 second timeout

    if (!fullUser) {
      return null;
    }

    // Check if user is admin or super admin using same logic as user-status API
    const isSuperAdmin = isSuperAdminEmail(fullUser.email);
    const promotedAdmin = await Admin.findOne({ userId: user.id }).maxTimeMS(3000);
    const isAdmin = isSuperAdmin || !!promotedAdmin;

    if (!isAdmin) {
      return null;
    }

    return {
      id: fullUser._id.toString(),
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      fullName: `${fullUser.firstName} ${fullUser.lastName}`,
      isAdmin: isAdmin,
      isSuperAdmin: isSuperAdmin
    };
  } catch (error) {
    console.error('Error verifying admin token:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * Extract token from request (for general use)
 */
export function extractToken(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

/**
 * Verify JWT token without database lookup
 */
export function verifyTokenOnly(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}
