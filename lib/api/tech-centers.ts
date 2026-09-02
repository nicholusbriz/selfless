// lib/api/tech-centers.ts
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
  users?: { id: string }[];
  _count?: {
    users: number;
    studentCourses: number;
    weeks: number;
    cleaningDays: number;
    announcements: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export const techCentersApi = {
  // Fetch all tech centers
  getTechCenters: async (): Promise<TechCenter[]> => {
    const response = await fetch('/api/admin/tech-centers');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tech centers');
    }
    return response.json();
  },

  // Fetch a single tech center by ID
  getTechCenterById: async (id: string): Promise<TechCenter> => {
    const response = await fetch(`/api/admin/tech-centers/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch tech center');
    }
    return response.json();
  },

  // Fetch countries
  getCountries: async (): Promise<Country[]> => {
    const response = await fetch('/api/admin/countries');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch countries');
    }
    return response.json();
  },

  // Create tech center
  createTechCenter: async (data: any): Promise<TechCenter> => {
    const response = await fetch('/api/admin/tech-centers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create tech center');
    }
    return response.json();
  },

  // Update tech center status
  updateTechCenterStatus: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<TechCenter> => {
    const response = await fetch(`/api/admin/tech-centers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update tech center');
    }
    return response.json();
  },

  // Delete tech center
  deleteTechCenter: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`/api/admin/tech-centers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete tech center');
    }
    return response.json();
  },
};