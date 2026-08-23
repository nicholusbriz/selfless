// lib/auth/server.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import { prisma } from '@/lib/prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logRegistration } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// ============================================
// JWT FUNCTIONS
// ============================================

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}

// ============================================
// PASSWORD FUNCTIONS
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// ============================================
// USER LOOKUP FUNCTIONS
// ============================================

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, techCenter: true }
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true, techCenter: true }
  });
}

// ============================================
// REGISTER USER
// ============================================

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  techCenterId: string;
  gender?: string;
  preferredTeamType?: string;
  preferredTeamRole?: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: 'Email already registered' };
    }

    // Get student role
    const studentRole = await prisma.role.findUnique({
      where: { name: 'student' },
    });

    if (!studentRole) {
      return { error: 'Student role not found' };
    }

    // Fetch tech center to get country
    const techCenter = await prisma.techCenter.findUnique({
      where: { id: data.techCenterId },
      include: { country: true }
    });

    if (!techCenter) {
      return { error: 'Tech center not found' };
    }

    if (!techCenter.country) {
      return { error: 'Tech center has no country assigned' };
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user with all fields set to defaults/null
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        phoneNumber: data.phoneNumber,
        country: techCenter.country.name,
        city: null,
        town: null,
        street: null,
        generalCourse: null,
        linkedinUrl: null,
        githubUrl: null,
        projectUrls: [],
        profileImageUrl: null,
        techCenterId: data.techCenterId,
        roleId: studentRole.id,
        status: 'ACTIVE',
        isActive: true,
        emailVerified: null,
        resetToken: null,
        resetTokenExpiry: null,
        teacherId: null,
        createdTechCenterIds: [],
        updatedTechCenterIds: [],
        gender: data.gender || null,
        preferredTeamType: (data.preferredTeamType as any) || null,
        preferredTeamRole: (data.preferredTeamRole as any) || null,
        takesReligion: false, // Default to false
        tuitionAmount: null, // Default to null
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    // Log the registration activity
    await logRegistration(user.id, user.techCenterId || undefined, { email: user.email });

    return { user };
  } catch (error) {
    console.error('Register error:', error);
    return { error: 'Registration failed' };
  }
}

// ============================================
// LOGIN USER
// ============================================

export async function loginUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    if (!user.password) {
      return { error: 'Please sign in with your social account' };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return { user };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Login failed' };
  }
}

// ============================================
// SERVER-SIDE AUTH
// ============================================

export async function getServerAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return getUserById(session.user.id);
}

export async function requireAuth() {
  const user = await getServerAuthUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export function hasRole(user: any, roleName: string) {
  return user?.role?.name === roleName;
}

export function hasPermission(user: any, permission: string) {
  if (!user) return false;
  if (user.role?.name === 'super_admin') return true;
  return user.role?.permissions?.includes(permission) || false;
}

// ============================================
// PASSWORD RESET FUNCTIONS
// ============================================

// Generate a 6-digit reset token
export function generateResetToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create password reset request
export async function createPasswordResetRequest(email: string) {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return { error: 'User not found' };
    }

    // Generate 6-digit token
    const token = generateResetToken();
    
    // Set expiry to 24 hours from now
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    return { 
      success: true, 
      token,
      expiry,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        techCenter: user.techCenter,
      }
    };
  } catch (error) {
    console.error('Create password reset error:', error);
    return { error: 'Failed to create password reset request' };
  }
}

// Verify reset token
export async function verifyResetToken(email: string, token: string) {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return { error: 'User not found' };
    }

    if (!user.resetToken || !user.resetTokenExpiry) {
      return { error: 'No active reset request found' };
    }

    // Check if token matches
    if (user.resetToken !== token) {
      return { error: 'Invalid token' };
    }

    // Check if token has expired
    const now = new Date();
    if (now > user.resetTokenExpiry) {
      return { error: 'Token has expired' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Verify reset token error:', error);
    return { error: 'Failed to verify reset token' };
  }
}

// Reset user password
export async function resetUserPassword(email: string, token: string, newPassword: string) {
  try {
    // First verify the token
    const verification = await verifyResetToken(email, token);
    
    if (verification.error || !verification.user) {
      return { error: verification.error || 'User not found' };
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: verification.user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Failed to reset password' };
  }
}

// Get users with active reset tokens (for admin)
export async function getUsersWithActiveResetTokens() {
  try {
    const now = new Date();
    
    const users = await prisma.user.findMany({
      where: {
        resetToken: { not: null },
        resetTokenExpiry: { gt: now },
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        techCenter: {
          include: {
            country: true,
          },
        },
      },
      orderBy: {
        resetTokenExpiry: 'desc',
      },
    });

    return { users };
  } catch (error) {
    console.error('Get users with reset tokens error:', error);
    return { error: 'Failed to fetch users with reset tokens' };
  }
}

// Revoke reset token
export async function revokeResetToken(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Revoke reset token error:', error);
    return { error: 'Failed to revoke reset token' };
  }
}