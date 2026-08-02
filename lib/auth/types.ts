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
  phoneNumber?: string | null;
  country?: string | null;
  city?: string | null;
  town?: string | null;
  street?: string | null;
  generalCourse?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  projectUrls?: string[];
  gender?: string | null;
  preferredTeamType?: string | null;
  preferredTeamRole?: string | null;
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
      phoneNumber?: string | null;
      country?: string | null;
      city?: string | null;
      town?: string | null;
      street?: string | null;
      generalCourse?: string | null;
      linkedinUrl?: string | null;
      githubUrl?: string | null;
      projectUrls?: string[];
      gender?: string | null;
      preferredTeamType?: string | null;
      preferredTeamRole?: string | null;
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
    phoneNumber?: string | null;
    country?: string | null;
    city?: string | null;
    town?: string | null;
    street?: string | null;
    generalCourse?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    projectUrls?: string[];
    gender?: string | null;
    preferredTeamType?: string | null;
    preferredTeamRole?: string | null;
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
    phoneNumber?: string | null;
    country?: string | null;
    city?: string | null;
    town?: string | null;
    street?: string | null;
    generalCourse?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    projectUrls?: string[];
    gender?: string | null;
    preferredTeamType?: string | null;
    preferredTeamRole?: string | null;
  }
}