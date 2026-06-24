import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE = '/api/cleaning';

// Types
export interface Week {
  id: string;
  startDate: string;
  endDate: string;
  weekLabel?: string;
  isActive: boolean;
  registrationEnabled: boolean;
  registrationDeadline: string;
  days: CleaningDay[];
}

export interface CleaningDay {
  id: string;
  weekId: string;
  dayOfWeek: string;
  cleaningDate: string;
  capacityLimit: number;
  currentRegistrations: number;
  isOpen: boolean;
  isFull: boolean;
  week?: Week;
  registrations?: CleaningRegistration[];
  attendanceRecords?: AttendanceRecord[];
}

export interface CleaningRegistration {
  id: string;
  userId: string;
  cleaningDayId: string;
  registeredAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  cleaningDay?: CleaningDay;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  cleaningDayId: string;
  status: 'PENDING' | 'ATTENDED' | 'NO_SHOW';
  markedBy?: string;
  markedAt: string;
  notes?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  cleaningDay?: CleaningDay;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentProfile?: {
    studentId: string;
  };
}

// Student hooks
export function useStudentCleaning() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['cleaning', 'student', user?.id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/student`);
      return response.data;
    },
    enabled: !!user?.id,
  });
}

// Admin hooks
export function useAdminCleaning() {
  return useQuery({
    queryKey: ['cleaning', 'admin'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/admin`);
      return response.data;
    },
  });
}

// Teacher hooks
export function useTeacherCleaning() {
  return useQuery({
    queryKey: ['cleaning', 'teacher'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/teacher`);
      return response.data;
    },
  });
}

// Weeks hooks
export function useWeeks() {
  return useQuery({
    queryKey: ['cleaning', 'weeks'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/weeks`);
      return response.data as Week[];
    },
  });
}

export function useCreateWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      startDate: string;
      weekLabel?: string;
      capacityLimit: number;
      registrationDeadline: string;
    }) => {
      const response = await axios.post(`${API_BASE}/weeks`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

export function useUpdateWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      weekId,
      data,
    }: {
      weekId: string;
      data: {
        weekLabel?: string;
        registrationEnabled?: boolean;
        registrationDeadline?: string;
      };
    }) => {
      const response = await axios.put(`${API_BASE}/weeks/${weekId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

export function useDeleteWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weekId: string) => {
      const response = await axios.delete(`${API_BASE}/weeks/${weekId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

// Days hooks
export function useUpdateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dayId,
      data,
    }: {
      dayId: string;
      data: {
        capacityLimit?: number;
        isOpen?: boolean;
      };
    }) => {
      const response = await axios.put(`${API_BASE}/days/${dayId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

export function useDeleteDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dayId: string) => {
      const response = await axios.delete(`${API_BASE}/days/${dayId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

// Registration hooks
export function useRegisterDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cleaningDayId: string) => {
      const response = await axios.post(`${API_BASE}/register`, { cleaningDayId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

export function useUnregisterDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`${API_BASE}/register`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

export function useSwitchDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cleaningDayId: string) => {
      // First unregister
      await axios.delete(`${API_BASE}/register`);
      // Then register for new day
      const response = await axios.post(`${API_BASE}/register`, { cleaningDayId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

// Manual assignment hook
export function useManualAssign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentUserId,
      cleaningDayId,
    }: {
      studentUserId: string;
      cleaningDayId: string;
    }) => {
      const response = await axios.post(`${API_BASE}/manual-assign`, {
        studentUserId,
        cleaningDayId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

// Attendance hooks
export function useAttendance(cleaningDayId?: string) {
  return useQuery({
    queryKey: ['cleaning', 'attendance', cleaningDayId],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/attendance`, {
        params: { cleaningDayId },
      });
      return response.data as AttendanceRecord[];
    },
    enabled: !!cleaningDayId,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      cleaningDayId: string;
      status: 'ATTENDED' | 'NO_SHOW' | 'PENDING';
      notes?: string;
    }) => {
      const response = await axios.post(`${API_BASE}/attendance`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'weeks'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'teacher'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'student'] });
    },
  });
}

// Remove student from day hook (for admins/teachers)
export function useRemoveStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentUserId: string) => {
      const response = await axios.delete(`${API_BASE}/remove-student`, {
        data: { studentUserId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'weeks'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'teacher'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning', 'student'] });
    },
  });
}
