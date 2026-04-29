// Admin configuration - only for super admin
// Regular admins are managed through database (Admin collection)

export const SUPER_ADMIN_EMAIL = 'atbriz256@gmail.com';

export const isSuperAdminEmail = (email: string): boolean => {
  return email === SUPER_ADMIN_EMAIL;
};

export const getAdminRole = (email: string): 'SUPER_ADMIN' | null => {
  return email === SUPER_ADMIN_EMAIL ? 'SUPER_ADMIN' : null;
};
