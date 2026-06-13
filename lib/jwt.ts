// lib/jwt.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// Warning instead of error
if (!SECRET && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ JWT_SECRET not set - using fallback for development');
}

// Use fallback if secret is missing (for build/development)
const SECRET_KEY = (SECRET || 'development-fallback-secret-32-chars-long!!') as string;

export function generateToken(payload: string | { userId: string; role?: string }) {
  if (typeof payload === 'string') {
    return jwt.sign({ userId: payload }, SECRET_KEY, { expiresIn: '7d' });
  }
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