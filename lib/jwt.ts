// lib/jwt.ts
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

// Skip validation during build
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuild && !SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Use fallback during build only
const SECRET_KEY = (SECRET || (isBuild ? 'build-fallback' : '')) as string;

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