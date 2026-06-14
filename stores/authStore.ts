import { create } from 'zustand';
import axios from '@/lib/axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: {
    id: string;
    name: string;
  };
  studentProfile?: {
    id: string;
    studentId: string;
    enrollmentDate?: string;
    status?: string;
    tuition?: number | null;
    tuitionPaid?: boolean;
  } | null;
  teacherProfile?: {
    id: string;
    employeeId?: string;
    department?: string;
  } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setAuth: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },
  
  clearAuth: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  login: async (email: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/api/auth/login', { email });
      const data = response.data;
      
      if (data.success) {
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      throw error;
    }
  },
  
  logout: async () => {
    set({ isLoading: true });
    try {
      await axios.post('/api/auth/logout');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchUser: async () => {
    // Don't fetch if already have user
    if (get().user) {
      return;
    }
    
    set({ isLoading: true });
    try {
      const response = await axios.get('/api/auth/me');
      const data = response.data;
      
      if (data.success && data.user) {
        set({ 
          user: data.user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },
}));