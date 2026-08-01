// lib/logger.ts
/**
 * ACTIVITY LOGGER
 * 
 * Centralized logging utility for tracking user activities across the application.
 * Logs login, logout, and other important actions for audit and security purposes.
 */

import { prisma } from '@/lib/prisma/client';

export interface LogData {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  techCenterId?: string;
}

/**
 * Create an activity log entry
 */
export async function createActivityLog(data: LogData) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details as any,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        location: data.location,
        techCenterId: data.techCenterId,
      },
    });
  } catch (error) {
    console.error('Failed to create activity log:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Log user login
 */
export async function logLogin(userId: string, techCenterId?: string, ipAddress?: string, userAgent?: string) {
  await createActivityLog({
    userId,
    action: 'login',
    entityType: 'user',
    entityId: userId,
    details: { timestamp: new Date().toISOString() },
    ipAddress,
    userAgent,
    techCenterId,
  });
}

/**
 * Log user logout
 */
export async function logLogout(userId: string, techCenterId?: string, ipAddress?: string, userAgent?: string) {
  await createActivityLog({
    userId,
    action: 'logout',
    entityType: 'user',
    entityId: userId,
    details: { timestamp: new Date().toISOString() },
    ipAddress,
    userAgent,
    techCenterId,
  });
}

/**
 * Log user registration
 */
export async function logRegistration(userId: string, techCenterId?: string, details?: Record<string, any>) {
  await createActivityLog({
    userId,
    action: 'register',
    entityType: 'user',
    entityId: userId,
    details: { ...details, timestamp: new Date().toISOString() },
    techCenterId,
  });
}

/**
 * Log user action (generic)
 */
export async function logUserAction(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>,
  techCenterId?: string
) {
  await createActivityLog({
    userId,
    action,
    entityType,
    entityId,
    details: { ...details, timestamp: new Date().toISOString() },
    techCenterId,
  });
}

/**
 * Extract IP address from request
 */
export function extractIpAddress(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Extract user agent from request
 */
export function extractUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}
