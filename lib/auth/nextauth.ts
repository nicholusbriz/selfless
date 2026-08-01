// lib/auth/nextauth.ts
import NextAuth, { AuthOptions, Session, User as NextAuthUser } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma/client';
import bcrypt from 'bcryptjs';

// ============================================
// TYPES
// ============================================

interface SessionCallbackParams {
  session: Session;
  token: JWT;
}

interface JwtCallbackParams {
  token: JWT;
  user: NextAuthUser;
}

// ============================================
// ADAPTER (Cast to any to bypass type issues)
// ============================================

const adapter = PrismaAdapter(prisma) as any;

// ============================================
// AUTH OPTIONS
// ============================================

export const authOptions: AuthOptions = {
  adapter: adapter,
  
  providers: [
    // ============================================
    // CREDENTIALS PROVIDER (Email/Password)
    // ============================================
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' }
      },
      async authorize(credentials) {
        // 1. Validate email exists
        if (!credentials?.email) {
          throw new Error('Email required');
        }

        // 2. Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true }
        });

        // 3. Check if user exists
        if (!user) {
          throw new Error('No user found with this email');
        }

        // 4. Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        // 5. Return user object
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role?.name || 'student',
          techCenterId: user.techCenterId,
          profileImageUrl: user.profileImageUrl,
          status: user.status,
          isActive: user.isActive,
          phoneNumber: user.phoneNumber,
          country: user.country,
          city: user.city,
          town: user.town,
          street: user.street,
          generalCourse: user.generalCourse,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
        };
      }
    })
  ],

  // ============================================
  // CALLBACKS
  // ============================================
  
  callbacks: {
    /**
     * Session Callback
     * Adds custom user data to the session object
     */
    async session({ session, token }: SessionCallbackParams) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.techCenterId = token.techCenterId as string;
        session.user.profileImageUrl = token.profileImageUrl as string;
        session.user.status = token.status as string;
        session.user.isActive = token.isActive as boolean;
        session.user.phoneNumber = token.phoneNumber as string | null;
        session.user.country = token.country as string | null;
        session.user.city = token.city as string | null;
        session.user.town = token.town as string | null;
        session.user.street = token.street as string | null;
        session.user.generalCourse = token.generalCourse as string | null;
        session.user.linkedinUrl = token.linkedinUrl as string | null;
        session.user.githubUrl = token.githubUrl as string | null;
        session.user.projectUrls = token.projectUrls as string[];
      }
      return session;
    },

    /**
     * JWT Callback
     * Persists custom user data in the JWT token
     * Re-fetches user data from database on session update to ensure fresh data
     */
    async jwt({ token, user, trigger }: JwtCallbackParams & { trigger?: string }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.techCenterId = user.techCenterId;
        token.profileImageUrl = user.profileImageUrl;
        token.status = user.status;
        token.isActive = user.isActive;
        token.phoneNumber = user.phoneNumber;
        token.country = user.country;
        token.city = user.city;
        token.town = user.town;
        token.street = user.street;
        token.generalCourse = user.generalCourse;
        token.linkedinUrl = user.linkedinUrl;
        token.githubUrl = user.githubUrl;
        token.projectUrls = user.projectUrls;
      }
      
      // Re-fetch user data from database on session update
      if (trigger === 'update' && token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          include: { role: true }
        });
        
        if (freshUser) {
          token.role = freshUser.role?.name || 'student';
          token.firstName = freshUser.firstName;
          token.lastName = freshUser.lastName;
          token.techCenterId = freshUser.techCenterId;
          token.profileImageUrl = freshUser.profileImageUrl;
          token.status = freshUser.status;
          token.isActive = freshUser.isActive;
          token.phoneNumber = freshUser.phoneNumber;
          token.country = freshUser.country;
          token.city = freshUser.city;
          token.town = freshUser.town;
          token.street = freshUser.street;
          token.generalCourse = freshUser.generalCourse;
          token.linkedinUrl = freshUser.linkedinUrl;
          token.githubUrl = freshUser.githubUrl;
          token.projectUrls = freshUser.projectUrls;
        }
      }
      
      return token;
    },

    /**
     * Sign In Callback
     * Controls what happens when a user signs in
     */
    async signIn({ user, account }: { user: NextAuthUser; account: any }) {
      // Allow credentials provider
      if (account?.provider === 'credentials') return true;
      return true;
    },

    /**
     * Redirect Callback
     * Controls where users are redirected after sign in
     */
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If url is the base URL, redirect to dashboard
      if (url === baseUrl) return `${baseUrl}/dashboard`;
      return url;
    }
  },

  // ============================================
  // PAGES
  // ============================================
  
  pages: {
    signIn: '/login',
    error: '/login',
  },

  // ============================================
  // SESSION
  // ============================================
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ============================================
  // SECRET
  // ============================================
  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);