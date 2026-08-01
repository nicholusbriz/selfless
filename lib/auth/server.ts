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