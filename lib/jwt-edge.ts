// lib/jwt-edge.ts
import { SignJWT, jwtVerify } from 'jose';

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// Convert secret to Uint8Array for jose
const secretKey = new TextEncoder().encode(SECRET);

export async function generateTokenEdge(payload: { userId: string; role?: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
  
  return token;
}

export async function verifyTokenEdge(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as { userId: string; role?: string };
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    return null;
  }
}
