// lib/jwt.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// Simple validation - throw if missing in runtime
if (!SECRET && typeof window === 'undefined') {
  console.error('❌ JWT_SECRET environment variable is not set!');
  // Don't throw during build, just log
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is not set');
  }
}

// Always use the actual secret, never a fallback
const SECRET_KEY = SECRET as string;

export function generateToken(payload: string | { userId: string; role?: string }) {
  if (!SECRET_KEY) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  if (typeof payload === 'string') {
    return jwt.sign({ userId: payload }, SECRET_KEY, { expiresIn: '7d', algorithm: 'HS256' });
  }
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d', algorithm: 'HS256' });
}

export function verifyToken(token: string) {
  if (!SECRET_KEY) {
    console.error('❌ JWT_SECRET is not configured for verification');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS256'] }) as { userId: string; role?: string };
    return decoded;
  } catch (error) {
    console.error('❌ JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}