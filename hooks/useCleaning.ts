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
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'weeks'] });

      // Snapshot previous value
      const previousWeeks = queryClient.getQueryData(['cleaning', 'weeks']);

      // Optimistically add the new week
      queryClient.setQueryData(['cleaning', 'weeks'], (old: any) => {
        const weeks = old || [];
        const newWeek = {
          id: `temp-${Date.now()}`,
          ...data,
          isActive: true,
          registrationEnabled: true,
          days: [],
        };
        return [...weeks, newWeek];
      });

      return { previousWeeks };
    },
    onError: (error, data, context) => {
      // Rollback to previous value on error
      if (context?.previousWeeks) {
        queryClient.setQueryData(['cleaning', 'weeks'], context.previousWeeks);
      }
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
    onMutate: async ({ weekId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'weeks'] });

      // Snapshot previous value
      const previousWeeks = queryClient.getQueryData(['cleaning', 'weeks']);

      // Optimistically update the week
      queryClient.setQueryData(['cleaning', 'weeks'], (old: any) => {
        const weeks = old || [];
        return weeks.map((week: any) =>
          week.id === weekId ? { ...week, ...data } : week
        );
      });

      return { previousWeeks };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousWeeks) {
        queryClient.setQueryData(['cleaning', 'weeks'], context.previousWeeks);
      }
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
    onMutate: async (weekId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'weeks'] });

      // Snapshot previous value
      const previousWeeks = queryClient.getQueryData(['cleaning', 'weeks']);

      // Optimistically remove the week
      queryClient.setQueryData(['cleaning', 'weeks'], (old: any) => {
        const weeks = old || [];
        return weeks.filter((week: any) => week.id !== weekId);
      });

      return { previousWeeks };
    },
    onError: (error, weekId, context) => {
      // Rollback to previous value on error
      if (context?.previousWeeks) {
        queryClient.setQueryData(['cleaning', 'weeks'], context.previousWeeks);
      }
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
    onMutate: async ({ dayId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'weeks'] });

      // Snapshot previous value
      const previousWeeks = queryClient.getQueryData(['cleaning', 'weeks']);

      // Optimistically update the day
      queryClient.setQueryData(['cleaning', 'weeks'], (old: any) => {
        const weeks = old || [];
        return weeks.map((week: any) => ({
          ...week,
          days: week.days.map((day: any) =>
            day.id === dayId ? { ...day, ...data } : day
          ),
        }));
      });

      return { previousWeeks };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousWeeks) {
        queryClient.setQueryData(['cleaning', 'weeks'], context.previousWeeks);
      }
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
    onMutate: async (dayId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'weeks'] });

      // Snapshot previous value
      const previousWeeks = queryClient.getQueryData(['cleaning', 'weeks']);

      // Optimistically remove the day
      queryClient.setQueryData(['cleaning', 'weeks'], (old: any) => {
        const weeks = old || [];
        return weeks.map((week: any) => ({
          ...week,
          days: week.days.filter((day: any) => day.id !== dayId),
        }));
      });

      return { previousWeeks };
    },
    onError: (error, dayId, context) => {
      // Rollback to previous value on error
      if (context?.previousWeeks) {
        queryClient.setQueryData(['cleaning', 'weeks'], context.previousWeeks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

// Registration hooks
export function useRegisterDay() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (cleaningDayId: string) => {
      const response = await axios.post(`${API_BASE}/register`, { cleaningDayId });
      return response.data;
    },
    onMutate: async (cleaningDayId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'student', user?.id] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['cleaning', 'student', user?.id]);

      // Optimistically add registration
      queryClient.setQueryData(['cleaning', 'student', user?.id], (old: any) => {
        const registrations = old?.registrations || [];
        const newRegistration = {
          id: `temp-${Date.now()}`,
          userId: user?.id,
          cleaningDayId,
          registeredAt: new Date().toISOString(),
          user: {
            id: user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
          },
        };
        return {
          ...old,
          registrations: [...registrations, newRegistration],
        };
      });

      return { previousData };
    },
    onError: (err, cleaningDayId, context) => {
      // Rollback to previous value on error
      if (context?.previousData) {
        queryClient.setQueryData(['cleaning', 'student', user?.id], context.previousData);
      }
    },
    onSuccess: () => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

export function useUnregisterDay() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`${API_BASE}/register`);
      return response.data;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'student', user?.id] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['cleaning', 'student', user?.id]);

      // Optimistically remove registration
      queryClient.setQueryData(['cleaning', 'student', user?.id], (old: any) => {
        return {
          ...old,
          registrations: [],
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousData) {
        queryClient.setQueryData(['cleaning', 'student', user?.id], context.previousData);
      }
    },
    onSuccess: () => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: ['cleaning'] });
    },
  });
}

export function useSwitchDay() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (cleaningDayId: string) => {
      // First unregister
      await axios.delete(`${API_BASE}/register`);
      // Then register for new day
      const response = await axios.post(`${API_BASE}/register`, { cleaningDayId });
      return response.data;
    },
    onMutate: async (cleaningDayId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'student', user?.id] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['cleaning', 'student', user?.id]);

      // Optimistically update registration
      queryClient.setQueryData(['cleaning', 'student', user?.id], (old: any) => {
        const newRegistration = {
          id: `temp-${Date.now()}`,
          userId: user?.id,
          cleaningDayId,
          registeredAt: new Date().toISOString(),
          user: {
            id: user?.id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
          },
        };
        return {
          ...old,
          registrations: [newRegistration],
        };
      });

      return { previousData };
    },
    onError: (err, cleaningDayId, context) => {
      // Rollback to previous value on error
      if (context?.previousData) {
        queryClient.setQueryData(['cleaning', 'student', user?.id], context.previousData);
      }
    },
    onSuccess: () => {
      // Refetch to ensure server state is correct
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
    onMutate: async ({ studentUserId, cleaningDayId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'weeks'] });

      // Snapshot previous value
      const previousWeeks = queryClient.getQueryData(['cleaning', 'weeks']);

      // Optimistically add the registration to the day
      queryClient.setQueryData(['cleaning', 'weeks'], (old: any) => {
        const weeks = old || [];
        return weeks.map((week: any) => ({
          ...week,
          days: week.days.map((day: any) => {
            if (day.id === cleaningDayId) {
              const newRegistration = {
                id: `temp-${Date.now()}`,
                userId: studentUserId,
                cleaningDayId,
                registeredAt: new Date().toISOString(),
              };
              return {
                ...day,
                registrations: [...(day.registrations || []), newRegistration],
                currentRegistrations: (day.currentRegistrations || 0) + 1,
              };
            }
            return day;
          }),
        }));
      });

      return { previousWeeks };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousWeeks) {
        queryClient.setQueryData(['cleaning', 'weeks'], context.previousWeeks);
      }
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
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'attendance', data.cleaningDayId] });

      // Snapshot previous value
      const previousAttendance = queryClient.getQueryData(['cleaning', 'attendance', data.cleaningDayId]);

      // Optimistically update the attendance record
      queryClient.setQueryData(['cleaning', 'attendance', data.cleaningDayId], (old: any) => {
        const attendanceRecords = old || [];
        const existingIndex = attendanceRecords.findIndex(
          (record: any) => record.userId === data.userId && record.cleaningDayId === data.cleaningDayId
        );
        
        if (existingIndex >= 0) {
          attendanceRecords[existingIndex] = {
            ...attendanceRecords[existingIndex],
            status: data.status,
            notes: data.notes,
          };
        } else {
          attendanceRecords.push({
            id: `temp-${Date.now()}`,
            userId: data.userId,
            cleaningDayId: data.cleaningDayId,
            status: data.status,
            notes: data.notes,
            markedAt: new Date().toISOString(),
          });
        }
        
        return attendanceRecords;
      });

      return { previousAttendance };
    },
    onError: (error, data, context) => {
      // Rollback to previous value on error
      if (context?.previousAttendance) {
        queryClient.setQueryData(['cleaning', 'attendance', data.cleaningDayId], context.previousAttendance);
      }
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
    onMutate: async (studentUserId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cleaning', 'weeks'] });

      // Snapshot previous value
      const previousWeeks = queryClient.getQueryData(['cleaning', 'weeks']);

      // Optimistically remove the student from all days
      queryClient.setQueryData(['cleaning', 'weeks'], (old: any) => {
        const weeks = old || [];
        return weeks.map((week: any) => ({
          ...week,
          days: week.days.map((day: any) => ({
            ...day,
            registrations: day.registrations?.filter((reg: any) => reg.userId !== studentUserId) || [],
            attendanceRecords: day.attendanceRecords?.filter((record: any) => record.userId !== studentUserId) || [],
            currentRegistrations: day.registrations?.filter((reg: any) => reg.userId !== studentUserId).length || 0,
          })),
        }));
      });

      return { previousWeeks };
    },
    onError: (error, studentUserId, context) => {
      // Rollback to previous value on error
      if (context?.previousWeeks) {
        queryClient.setQueryData(['cleaning', 'weeks'], context.previousWeeks);
      }
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
