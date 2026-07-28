// lib/api/admin-tech-center.ts
export interface TechCenter {
  id: string;
  name: string;
  code: string;
  description?: string;
  countryId?: string;
  country?: {
    id: string;
    name: string;
    code: string;
  };
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdById?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
  users?: { id: string }[];
  studentCourses?: { id: string }[];
  weeks?: { id: string }[];
  cleaningDays?: { id: string }[];
  announcements?: { id: string }[];
  _count?: {
    users: number;
    studentCourses: number;
    weeks: number;
    cleaningDays: number;
    announcements: number;
  };
}

export interface TechCenterStats {
  totalStudents: number;
  totalCourses: number;
  totalWeeks: number;
  totalCleaningDays: number;
  totalAnnouncements: number;
  activeStudents: number;
  completedCourses: number;
  openCleaningDays: number;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    details: any;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export interface UpdateTechCenterData {
  name?: string;
  description?: string;
  countryId?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const adminTechCenterApi = {
  // Get admin's tech center
  getTechCenter: async (): Promise<TechCenter> => {
    const response = await fetch('/api/admin/tech-centers/me');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tech center');
    }
    return response.json();
  },

  // Get tech center stats
  getTechCenterStats: async (): Promise<TechCenterStats> => {
    const response = await fetch('/api/admin/tech-centers/me/stats');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tech center stats');
    }
    return response.json();
  },

  // Update tech center
  updateTechCenter: async (data: UpdateTechCenterData): Promise<{ message: string; techCenter: TechCenter }> => {
    const response = await fetch('/api/admin/tech-centers/me/edit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update tech center');
    }
    return response.json();
  },
};