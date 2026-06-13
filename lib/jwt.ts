// lib/jwt.ts
import jwt from 'jsonwebtoken';

// Validate JWT_SECRET exists on server startup
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please set it in .env.local');
}

if (SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long for security');
}

const SECRET_KEY = SECRET as string;

// Updated to accept either string (userId) or object with userId and role
export function generateToken(payload: string | { userId: string; role?: string }) {
  if (typeof payload === 'string') {
    // Old format - just userId
    return jwt.sign({ userId: payload }, SECRET_KEY, { expiresIn: '7d' });
  }
  // New format - with role
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; role?: string } | null;
    return decoded;
  } catch {
    return null;
  }
}