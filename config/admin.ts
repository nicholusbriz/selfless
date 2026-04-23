// Admin configuration - easily manage admin emails
export const ADMIN_CONFIG = {
  emails: [
    'atbriz256@gmail.com',
    'kiwanukatonny@gmail.com',
    // Add more admin emails here
  ],
  
  // Admin access levels (for future expansion)
  roles: {
    SUPER_ADMIN: ['atbriz256@gmail.com'],
    ADMIN: ['kiwanukatonny@gmail.com'],
  }
};

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_CONFIG.emails.includes(email);
};

export const getAdminRole = (email: string): string | null => {
  for (const [role, emails] of Object.entries(ADMIN_CONFIG.roles)) {
    if (emails.includes(email)) {
      return role;
    }
  }
  return null;
};
