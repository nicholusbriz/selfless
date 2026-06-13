import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '@/lib/axios';

// Update the User interface to include profiles
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

// Import queryClient dynamically to avoid circular dependencies
let queryClient: any = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },
      clearAuth: () => {
        // Clear React Query cache if available
        if (typeof window !== 'undefined') {
          try {
            const { queryClient: qc } = require('@/lib/react-query');
            if (qc) {
              qc.clear();
              console.log('✅ Cleared React Query cache on logout');
            }
          } catch (e) {
            console.log('React Query not available yet');
          }
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      login: async (email: string) => {
        set({ isLoading: true });
        try {
          const response = await axios.post('/auth/login', { email });
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
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await axios.post('/auth/logout');
          get().clearAuth();
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear auth even if API call fails
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await axios.get('/auth/me');
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
    }),
    {
      name: 'auth-storage',
    }
  )
);