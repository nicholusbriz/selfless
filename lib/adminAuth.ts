import { isSuperAdminEmail } from '@/config/admin';

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: 'super-admin' | 'admin';
  permissions?: {
    canManageUsers: boolean;
    canManageCourses: boolean;
    canManageAnnouncements: boolean;
    canManageTutors: boolean;
    canManageAdmins: boolean;
    canDeleteData: boolean;
  };
  isActive: boolean;
}

/**
 * Check if a user is an admin (either super admin or promoted admin)
 * This function should be called from the server side or API route
 */
export async function checkAdminStatus(userEmail: string, userId: string): Promise<AdminUser | null> {
  try {
    // First check if super admin
    if (isSuperAdminEmail(userEmail)) {
      return {
        id: userId,
        email: userEmail,
        role: 'super-admin',
        isActive: true,
        permissions: {
          canManageUsers: true,
          canManageCourses: true,
          canManageAnnouncements: true,
          canManageTutors: true,
          canManageAdmins: true,
          canDeleteData: true
        }
      };
    }

    // Check if promoted admin in database
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admins/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail, userId }),
    });

    if (!response.ok) {
      return null;
    }

    const adminData = await response.json();
    return adminData.success ? adminData.admin : null;

  } catch (error) {
    
    return null;
  }
}

/**
 * Client-side admin check (only for super admin)
 * For promoted admins, this should be validated server-side
 */
export function isSuperAdmin(userEmail: string): boolean {
  return isSuperAdminEmail(userEmail);
}
