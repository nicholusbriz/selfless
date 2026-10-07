// lib/auth/nextauth.ts
import NextAuth, { Account, AuthOptions, Session, User as NextAuthUser } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma/client';
import bcrypt from 'bcryptjs';
import { logLogin } from '@/lib/logger';

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
// ADAPTER
// ============================================

// ============================================
// AUTH OPTIONS
// ============================================

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as AuthOptions['adapter'],

  providers: [
    // ============================================
    // GITHUB PROVIDER
    // ============================================
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error('INVALID_CREDENTIALS');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            role: true,
            techCenter: {
              select: { id: true, name: true }
            },
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImageUrl: true,
              }
            }
          }
        });

        if (!user?.password) {
          throw new Error('INVALID_CREDENTIALS');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('INVALID_CREDENTIALS');
        }

        if (!user.isVerified || user.verificationStatus !== 'APPROVED') {
          throw new Error('ACCOUNT_PENDING_APPROVAL');
        }

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
          techCenter: user.techCenter,
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
          projectUrls: user.projectUrls,
          gender: user.gender,
          preferredTeamType: user.preferredTeamType,
          preferredTeamRole: user.preferredTeamRole,
          teacherId: user.teacherId || null,
          roleUpdatedAt: user.roleUpdatedAt,
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
        session.user.techCenter = token.techCenter as { id: string; name: string } | null;
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
        session.user.gender = token.gender as string | null;
        session.user.preferredTeamType = token.preferredTeamType as string | null;
        session.user.preferredTeamRole = token.preferredTeamRole as string | null;
        // Add teacherId to session user
        session.user.teacherId = token.teacherId as string | null;
      }
      return session;
    },

    /**
     * JWT Callback
     * Persists custom user data in the JWT token
     * Re-fetches user data from database on session update to ensure fresh data
     * Automatically refreshes token when role has been changed (roleUpdatedAt check)
     */
    async jwt({ token, user, trigger }: JwtCallbackParams & { trigger?: string }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.techCenterId = user.techCenterId;
        token.techCenter = user.techCenter;
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
        token.gender = user.gender;
        token.preferredTeamType = user.preferredTeamType;
        token.preferredTeamRole = user.preferredTeamRole;
        // Use type assertion for teacherId
        token.teacherId = user.teacherId || null;

        token.roleUpdatedAt = user.roleUpdatedAt instanceof Date
          ? user.roleUpdatedAt.toISOString()
          : user.roleUpdatedAt || undefined;
      }

      // Re-fetch user data from database on session update
      if (trigger === 'update' && token.sub) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          include: {
            role: true,
            techCenter: {
              select: { id: true, name: true }
            },
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImageUrl: true,
              }
            }
          }
        });

        if (freshUser) {
          token.role = freshUser.role?.name || 'student';
          token.firstName = freshUser.firstName;
          token.lastName = freshUser.lastName;
          token.techCenterId = freshUser.techCenterId;
          token.techCenter = freshUser.techCenter;
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
          token.gender = freshUser.gender;
          token.preferredTeamType = freshUser.preferredTeamType;
          token.preferredTeamRole = freshUser.preferredTeamRole;
          token.teacherId = freshUser.teacherId || null;
          token.roleUpdatedAt = freshUser.roleUpdatedAt instanceof Date
            ? freshUser.roleUpdatedAt.toISOString()
            : freshUser.roleUpdatedAt || undefined;
        }
      }

      // Auto-refresh token if role has been changed (check roleUpdatedAt).
      // Also serves as the deleted-user guard: if the user no longer exists
      // in the database we return null, which tells NextAuth to invalidate
      // the JWT and sign the client out on their very next request.
      if (token.sub && !trigger && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: {
            roleUpdatedAt: true,
            role: { select: { name: true } },
            teacherId: true,
            techCenter: {
              select: { id: true, name: true }
            }
          }
        });

        // User no longer exists in the database (e.g. deleted by an admin).
        // Returning null forces NextAuth to clear the session cookie and
        // redirect the client to the sign-in page immediately.
        if (!dbUser) {
          return null as unknown as JWT;
        }

        if (!token.techCenter && dbUser.techCenter) {
          token.techCenter = dbUser.techCenter;
        }

        const tokenRoleUpdatedAt = token.roleUpdatedAt;
        const dbRoleUpdatedAt = dbUser.roleUpdatedAt instanceof Date
          ? dbUser.roleUpdatedAt.toISOString()
          : dbUser.roleUpdatedAt || undefined;

        // If database roleUpdatedAt is newer than token's, refresh all user data
        if (dbRoleUpdatedAt && (!tokenRoleUpdatedAt || new Date(dbRoleUpdatedAt) > new Date(tokenRoleUpdatedAt))) {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            include: {
              role: true,
              techCenter: {
                select: { id: true, name: true }
              },
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profileImageUrl: true,
                }
              }
            }
          });

          if (freshUser) {
            token.role = freshUser.role?.name || 'student';
            token.firstName = freshUser.firstName;
            token.lastName = freshUser.lastName;
            token.techCenterId = freshUser.techCenterId;
            token.techCenter = freshUser.techCenter;
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
            token.gender = freshUser.gender;
            token.preferredTeamType = freshUser.preferredTeamType;
            token.preferredTeamRole = freshUser.preferredTeamRole;
            token.teacherId = freshUser.teacherId || null;
            token.roleUpdatedAt = freshUser.roleUpdatedAt instanceof Date
              ? freshUser.roleUpdatedAt.toISOString()
              : freshUser.roleUpdatedAt || undefined;
          }
        }
      }

      return token;
    },

    /**
     * Sign In Callback
     * Controls what happens when a user signs in
     */
    async signIn({ account, user, profile }: { account: Account | null; user: NextAuthUser; profile?: any }) {
      // Handle OAuth providers (GitHub)
      if (account?.provider === 'github') {
        // Check if user exists in database by email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
          include: {
            role: true,
            techCenter: {
              select: { id: true, name: true }
            },
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImageUrl: true,
              }
            }
          }
        });

        // If user doesn't exist, deny access
        if (!existingUser) {
          return false;
        }

        // Check if user is verified and approved
        if (!existingUser.isVerified || existingUser.verificationStatus !== 'APPROVED') {
          return false;
        }

        // Update user with OAuth account info and profile image
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            lastLoginAt: new Date(),
            // Update profile image from OAuth provider if available
            ...(profile?.avatar_url && { profileImageUrl: profile.avatar_url }),
          }
        });

        // Log the login
        await logLogin(existingUser.id, existingUser.techCenterId || undefined);

        // Attach additional user data to the user object
        user.id = existingUser.id;
        user.firstName = existingUser.firstName;
        user.lastName = existingUser.lastName;
        user.role = existingUser.role?.name || 'student';
        user.techCenterId = existingUser.techCenterId;
        user.techCenter = existingUser.techCenter;
        user.profileImageUrl = existingUser.profileImageUrl;
        user.status = existingUser.status;
        user.isActive = existingUser.isActive;
        user.phoneNumber = existingUser.phoneNumber;
        user.country = existingUser.country;
        user.city = existingUser.city;
        user.town = existingUser.town;
        user.street = existingUser.street;
        user.generalCourse = existingUser.generalCourse;
        user.linkedinUrl = existingUser.linkedinUrl;
        user.githubUrl = existingUser.githubUrl;
        user.projectUrls = existingUser.projectUrls;
        user.gender = existingUser.gender;
        user.preferredTeamType = existingUser.preferredTeamType;
        user.preferredTeamRole = existingUser.preferredTeamRole;
        user.teacherId = existingUser.teacherId || null;
        user.roleUpdatedAt = existingUser.roleUpdatedAt;

        return true;
      }

      // Allow credentials provider
      if (account?.provider === 'credentials' && user.id) {
        await logLogin(user.id, user.techCenterId || undefined);
      }

      return true;
    },

    /**
     * Redirect Callback
     * Controls where users are redirected after sign in
     */
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      const dashboardUrl = new URL('/dashboard', baseUrl).toString();
      if (url === baseUrl || url === `${baseUrl}/`) return dashboardUrl;

      if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString();
      }

      try {
        const redirectUrl = new URL(url);
        if (redirectUrl.origin === new URL(baseUrl).origin) {
          return redirectUrl.toString();
        }
      } catch {
        return dashboardUrl;
      }

      return dashboardUrl;
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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // ============================================
  // SECRET
  // ============================================

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);