// lib/auth/types.ts
import { DefaultSession } from 'next-auth';

export const AUTH_CONSTANTS = {
  TOKEN_NAME: 'auth_token',
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7,
  BCRYPT_SALT_ROUNDS: 10,
} as const;

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  techCenterId: string | null;
  profileImageUrl: string | null;
  status: string;
  isActive: boolean;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
      techCenterId: string | null;
      profileImageUrl: string | null;
      status: string;
      isActive: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    techCenterId: string | null;
    profileImageUrl: string | null;
    status: string;
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    techCenterId: string | null;
    profileImageUrl: string | null;
    status: string;
    isActive: boolean;
  }
}