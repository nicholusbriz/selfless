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
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // 1. Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
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

        // 4. Check if user has a password (OAuth users don't)
        if (!user.password) {
          throw new Error('Please sign in with your social account');
        }

        // 5. Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // 6. Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        // 7. Return user object
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
      }
      return session;
    },

    /**
     * JWT Callback
     * Persists custom user data in the JWT token
     */
    async jwt({ token, user }: JwtCallbackParams) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.techCenterId = user.techCenterId;
        token.profileImageUrl = user.profileImageUrl;
        token.status = user.status;
        token.isActive = user.isActive;
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