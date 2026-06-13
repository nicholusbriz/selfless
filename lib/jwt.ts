import jwt from 'jsonwebtoken';

// Validate JWT_SECRET exists on server startup
const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please set it in .env.local');
}

if (SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long for security');
}

// Type assertion since we've validated SECRET exists and is at least 32 chars
const SECRET_KEY = SECRET as string;

export function generateToken(userId: string) {
  // ✅ Only put user ID in token - NOT role!
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string } | null;
    return decoded;
  } catch {
    return null;
  }
}
