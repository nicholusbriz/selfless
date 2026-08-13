// hooks/useCleaning.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface CleaningWeek {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  isActive: boolean;
  days: CleaningDay[];
}

export interface CleaningDay {
  id: string;
  weekId: string;
  dayOfWeek: string;
  cleaningDate: string;
  capacityLimit: number;
  currentRegistrations: number;
  status: 'OPEN' | 'CLOSED' | 'FULL';
  registrations: CleaningRegistration[];
  attendanceRecords: AttendanceRecord[];
}

export interface CleaningRegistration {
  id: string;
  userId: string;
  cleaningDayId: string;
  registeredAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  cleaningDayId: string;
  status: 'ATTENDED' | 'NO_SHOW' | 'PENDING';
  markedBy?: string;
  markedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CleaningStats {
  totalRegistrations: number;
  totalAttended: number;
  totalNoShow: number;
  totalPending: number;
}

export interface CleaningData {
  weeks: CleaningWeek[];
  students: { id: string; firstName: string; lastName: string; email: string }[];
  stats: CleaningStats;
}

// API Functions
const api = {
  getCleaningData: async (): Promise<CleaningData> => {
    const response = await fetch('/api/admin/cleaning');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch cleaning data');
    }
    return response.json();
  },

  createWeek: async (data: any) => {
    const response = await fetch('/api/admin/cleaning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create week');
    }
    return response.json();
  },

  updateWeek: async ({ weekId, data }: { weekId: string; data: any }) => {
    const response = await fetch(`/api/admin/cleaning/weeks/${weekId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update week');
    }
    return response.json();
  },

  deleteWeek: async (weekId: string) => {
    const response = await fetch(`/api/admin/cleaning/weeks/${weekId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete week');
    }
    return response.json();
  },

  updateDay: async ({ dayId, data }: { dayId: string; data: any }) => {
    const response = await fetch(`/api/admin/cleaning/days/${dayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update day');
    }
    return response.json();
  },

  deleteDay: async (dayId: string) => {
    const response = await fetch(`/api/admin/cleaning/days/${dayId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete day');
    }
    return response.json();
  },

  assignStudent: async ({ studentUserId, cleaningDayId }: { studentUserId: string; cleaningDayId: string }) => {
    const response = await fetch('/api/admin/cleaning/manual-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentUserId, cleaningDayId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign student');
    }
    return response.json();
  },

  markAttendance: async ({ userId, cleaningDayId, status }: { userId: string; cleaningDayId: string; status: 'ATTENDED' | 'NO_SHOW' | 'PENDING' }) => {
    const response = await fetch('/api/admin/cleaning/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cleaningDayId, status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark attendance');
    }
    return response.json();
  },

  removeStudent: async (studentUserId: string) => {
    const response = await fetch('/api/admin/cleaning/remove-student', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentUserId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove student');
    }
    return response.json();
  },
};

// React Query Hooks
export const useAdminCleaning = () => {
  return useQuery({
    queryKey: ['adminCleaning'],
    queryFn: api.getCleaningData,
  });
};

export const useCreateWeek = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createWeek,
    onMutate: async (data: any) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        const newWeek = {
          id: 'temp-' + Date.now(),
          weekLabel: data.weekLabel || `Week of ${new Date(data.startDate).toLocaleDateString()}`,
          startDate: data.startDate,
          endDate: new Date(new Date(data.startDate).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          registrationDeadline: data.deadline,
          isActive: true,
          days: [],
        };
        
        return {
          ...old,
          weeks: [...old.weeks, newWeek],
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};

export const useUpdateWeek = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateWeek,
    onMutate: async ({ weekId, data }: { weekId: string; data: any }) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          weeks: old.weeks.map(week => 
            week.id === weekId 
              ? { ...week, ...data }
              : week
          ),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};

export const useDeleteWeek = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteWeek,
    onMutate: async (weekId: string) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          weeks: old.weeks.filter(week => week.id !== weekId),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};

export const useUpdateDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateDay,
    onMutate: async ({ dayId, data }: { dayId: string; data: any }) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.map(day => 
              day.id === dayId 
                ? { ...day, ...data }
                : day
            ),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};

export const useDeleteDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDay,
    onMutate: async (dayId: string) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.filter(day => day.id !== dayId),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};

export const useManualAssign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.assignStudent,
    onMutate: async ({ studentUserId, cleaningDayId }: { studentUserId: string; cleaningDayId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        const student = old.students.find(s => s.id === studentUserId);
        if (!student) return old;
        
        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.map(day => {
              if (day.id === cleaningDayId) {
                return {
                  ...day,
                  currentRegistrations: day.currentRegistrations + 1,
                  status: day.currentRegistrations + 1 >= day.capacityLimit ? 'FULL' : 'OPEN',
                  registrations: [
                    ...day.registrations.filter(r => r.userId !== studentUserId),
                    {
                      id: 'temp-' + Date.now(),
                      userId: studentUserId,
                      cleaningDayId,
                      registeredAt: new Date().toISOString(),
                      user: student,
                    }
                  ]
                };
              }
              // Remove from other days
              return {
                ...day,
                registrations: day.registrations.filter(r => r.userId !== studentUserId),
                currentRegistrations: day.registrations.filter(r => r.userId !== studentUserId).length,
              };
            }),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markAttendance,
    onMutate: async ({ userId, cleaningDayId, status }: { userId: string; cleaningDayId: string; status: 'ATTENDED' | 'NO_SHOW' | 'PENDING' }) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.map(day => {
              if (day.id === cleaningDayId) {
                const existingAttendance = day.attendanceRecords?.find(a => a.userId === userId);
                const updatedAttendanceRecords = existingAttendance
                  ? day.attendanceRecords?.map(a => 
                      a.userId === userId 
                        ? { ...a, status, markedAt: new Date().toISOString() }
                        : a
                    )
                  : [
                      ...(day.attendanceRecords || []),
                      {
                        id: 'temp-' + Date.now(),
                        userId,
                        cleaningDayId,
                        status,
                        markedAt: new Date().toISOString(),
                        user: day.registrations.find(r => r.userId === userId)?.user || { id: userId, firstName: '', lastName: '', email: '' },
                      }
                    ];
                
                return {
                  ...day,
                  attendanceRecords: updatedAttendanceRecords,
                };
              }
              return day;
            }),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};

export const useRemoveStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.removeStudent,
    onMutate: async (studentUserId: string) => {
      await queryClient.cancelQueries({ queryKey: ['adminCleaning'] });
      const previousData = queryClient.getQueryData(['adminCleaning']) as CleaningData;
      
      queryClient.setQueryData(['adminCleaning'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.map(day => {
              const hadRegistration = day.registrations.some(r => r.userId === studentUserId);
              if (hadRegistration) {
                return {
                  ...day,
                  currentRegistrations: Math.max(0, day.currentRegistrations - 1),
                  status: 'OPEN',
                  registrations: day.registrations.filter(r => r.userId !== studentUserId),
                };
              }
              return day;
            }),
          })),
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['adminCleaning'], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaning'] });
    },
  });
};