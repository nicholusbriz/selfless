import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AUTH_CONSTANTS } from '@/config/constants';
import User, { IUser } from '@/models/User';
import Admin, { IAdmin } from '@/models/Admin';
import Tutor, { ITutor } from '@/models/Tutor';
import { isSuperAdminEmail } from '@/config/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Shared authentication utilities
export interface AuthenticatedUser {
  user: IUser;
  isSuperAdmin: boolean;
  promotedAdmin?: IAdmin | null;
  isTutor?: boolean;
  tutorPermissions?: ITutor['permissions'] | null;
}

export interface TokenData {
  userId: string;
  email?: string;
}

// Main token verification function
export async function verifyToken(request: NextRequest): Promise<TokenData | null> {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc: { [key: string]: string }, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  const token = cookies[AUTH_CONSTANTS.TOKEN_NAME];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenData;
    return decoded;
  } catch {
    return null;
  }
}

// Comprehensive user authentication with role checking
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const tokenData = await verifyToken(request);
  if (!tokenData) return null;

  try {
    const user = await User.findById(tokenData.userId);
    if (!user) return null;

    // Check admin status
    const isSuperAdmin = isSuperAdminEmail(user.email);
    const promotedAdmin = await Admin.findOne({ userId: user._id.toString(), isActive: true });

    // Check tutor status
    const tutorRecord = await Tutor.findOne({ userId: user._id.toString(), isActive: true });

    return {
      user,
      isSuperAdmin,
      promotedAdmin,
      isTutor: !!tutorRecord,
      tutorPermissions: tutorRecord?.permissions
    };
  } catch {
    return null;
  }
}

// Admin-only authentication
export async function requireAdmin(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authUser = await authenticateUser(request);
  if (!authUser || (!authUser.isSuperAdmin && !authUser.promotedAdmin)) {
    return null;
  }
  return authUser;
}

// Simple user authentication (for regular users)
export async function requireUser(request: NextRequest): Promise<IUser | null> {
  const tokenData = await verifyToken(request);
  if (!tokenData) return null;

  try {
    const user = await User.findById(tokenData.userId);
    return user;
  } catch {
    return null;
  }
}

// Helper to create JWT token
export function createToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper to set auth cookie
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_CONSTANTS.TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: AUTH_CONSTANTS.COOKIE_MAX_AGE,
    path: '/'
  });
}
