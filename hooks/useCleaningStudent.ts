// hooks/useCleaningStudent.ts
// Custom hook for student cleaning page - registration, change, and status

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface CleaningDay {
  id: string;
  dayOfWeek: string;
  cleaningDate: string;
  capacityLimit: number;
  currentRegistrations: number;
  status: 'OPEN' | 'CLOSED' | 'FULL';
  registrations: {
    id: string;
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    };
  }[];
  attendanceRecords: {
    id: string;
    userId: string;
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING';
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    };
  }[];
}

export interface Week {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  isActive: boolean;
  days: CleaningDay[];
}

export interface UserRegistration {
  id: string;
  cleaningDayId: string;
  cleaningDay: {
    id: string;
    dayOfWeek: string;
    cleaningDate: string;
    status: 'OPEN' | 'CLOSED' | 'FULL';
    week: {
      id: string;
      weekLabel: string;
    };
  };
}

export interface UserAttendance {
  id: string;
  status: 'ATTENDED' | 'NO_SHOW' | 'PENDING';
  cleaningDay: {
    id: string;
    dayOfWeek: string;
    cleaningDate: string;
    week: {
      id: string;
      weekLabel: string;
    };
  };
}

export interface CleaningData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
    role: string;
    techCenterId?: string;
  };
  weeks: Week[];
  registration: UserRegistration | null;
  userAttendance: UserAttendance[];
  isAdmin: boolean;
  userId: string;
}

export interface CleaningStatus {
  hasRegistration: boolean;
  registration?: {
    id: string;
    dayId: string;
    dayOfWeek: string;
    cleaningDate: string;
    weekId: string;
    weekLabel: string;
    status: string;
  };
  message?: string;
  weekId?: string;
  weekLabel?: string;
}

// API Functions
const api = {
  getCleaningData: async (): Promise<CleaningData> => {
    const response = await fetch('/api/cleaning/student');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch cleaning data');
    }
    return response.json();
  },

  registerForCleaning: async (cleaningDayId: string) => {
    const response = await fetch('/api/cleaning/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cleaningDayId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to register for cleaning');
    }
    return response.json();
  },

  changeRegistration: async ({ newDayId }: { newDayId: string }) => {
    const response = await fetch('/api/cleaning/change-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDayId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change registration');
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

  getCleaningStatus: async (): Promise<CleaningStatus> => {
    const response = await fetch('/api/cleaning/student');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch cleaning status');
    }
    const data = await response.json();
    // Transform the data to match CleaningStatus interface
    if (data.registration) {
      return {
        hasRegistration: true,
        registration: {
          id: data.registration.id,
          dayId: data.registration.cleaningDayId,
          dayOfWeek: data.registration.cleaningDay.dayOfWeek,
          cleaningDate: data.registration.cleaningDay.cleaningDate,
          weekId: data.registration.cleaningDay.week.id,
          weekLabel: data.registration.cleaningDay.week.weekLabel,
          status: data.registration.cleaningDay.status,
        },
        weekId: data.registration.cleaningDay.week.id,
        weekLabel: data.registration.cleaningDay.week.weekLabel,
      };
    }
    return {
      hasRegistration: false,
      message: 'No registration found',
    };
  },
};

// React Query Hooks
export const useStudentCleaningData = () => {
  return useQuery({
    queryKey: ['studentCleaningData'],
    queryFn: api.getCleaningData,
    refetchInterval: 30000,
  });
};

export const useStudentCleaningStatus = () => {
  return useQuery({
    queryKey: ['studentCleaningStatus'],
    queryFn: api.getCleaningStatus,
    refetchInterval: 30000,
  });
};

export const useRegisterForCleaning = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.registerForCleaning,
    onMutate: async (cleaningDayId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['studentCleaningData'] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['studentCleaningData']) as CleaningData;
      
      // Optimistically update
      queryClient.setQueryData(['studentCleaningData'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        // Find the day in weeks and add user to registrations
        const updatedWeeks = old.weeks.map(week => ({
          ...week,
          days: week.days.map(day => {
            if (day.id === cleaningDayId) {
              return {
                ...day,
                currentRegistrations: day.currentRegistrations + 1,
                status: day.currentRegistrations + 1 >= day.capacityLimit ? 'FULL' : 'OPEN',
                registrations: [
                  ...day.registrations,
                  {
                    id: 'temp-' + Date.now(),
                    userId: old.user.id,
                    user: {
                      id: old.user.id,
                      firstName: old.user.firstName,
                      lastName: old.user.lastName,
                      profileImageUrl: old.user.profileImageUrl,
                    },
                    registeredAt: new Date().toISOString(),
                  }
                ]
              };
            }
            return day;
          })
        }));
        
        return {
          ...old,
          weeks: updatedWeeks,
          registration: {
            id: 'temp-' + Date.now(),
            userId: old.user.id,
            cleaningDayId,
            registeredAt: new Date().toISOString(),
            cleaningDay: updatedWeeks.flatMap(w => w.days).find(d => d.id === cleaningDayId)!,
          }
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['studentCleaningData'], context.previousData);
      }
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['studentCleaningData'] });
      queryClient.invalidateQueries({ queryKey: ['studentCleaningStatus'] });
    },
  });
};

export const useChangeRegistration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.changeRegistration,
    onMutate: async ({ newDayId }: { newDayId: string }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['studentCleaningData'] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['studentCleaningData']) as CleaningData;
      
      // Optimistically update
      queryClient.setQueryData(['studentCleaningData'], (old: CleaningData | undefined) => {
        if (!old || !old.registration) return old;
        
        const oldDayId = old.registration.cleaningDayId;
        
        // Find the old and new days
        const updatedWeeks = old.weeks.map(week => ({
          ...week,
          days: week.days.map(day => {
            if (day.id === oldDayId) {
              // Remove user from old day
              return {
                ...day,
                currentRegistrations: Math.max(0, day.currentRegistrations - 1),
                status: 'OPEN',
                registrations: day.registrations.filter(r => r.userId !== old.user.id)
              };
            }
            if (day.id === newDayId) {
              // Add user to new day
              return {
                ...day,
                currentRegistrations: day.currentRegistrations + 1,
                status: day.currentRegistrations + 1 >= day.capacityLimit ? 'FULL' : 'OPEN',
                registrations: [
                  ...day.registrations,
                  {
                    id: 'temp-' + Date.now(),
                    userId: old.user.id,
                    user: {
                      id: old.user.id,
                      firstName: old.user.firstName,
                      lastName: old.user.lastName,
                      profileImageUrl: old.user.profileImageUrl,
                    },
                    registeredAt: new Date().toISOString(),
                  }
                ]
              };
            }
            return day;
          })
        }));
        
        return {
          ...old,
          weeks: updatedWeeks,
          registration: {
            ...old.registration,
            cleaningDayId: newDayId,
            cleaningDay: updatedWeeks.flatMap(w => w.days).find(d => d.id === newDayId)!,
          }
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['studentCleaningData'], context.previousData);
      }
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['studentCleaningData'] });
      queryClient.invalidateQueries({ queryKey: ['studentCleaningStatus'] });
    },
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.markAttendance,
    onMutate: async ({ userId, cleaningDayId, status }: { userId: string; cleaningDayId: string; status: 'ATTENDED' | 'NO_SHOW' | 'PENDING' }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['studentCleaningData'] });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(['studentCleaningData']) as CleaningData;
      
      // Optimistically update
      queryClient.setQueryData(['studentCleaningData'], (old: CleaningData | undefined) => {
        if (!old) return old;
        
        // Update the attendance record for the user and day
        const updatedWeeks = old.weeks.map(week => ({
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
                    }
                  ];
              
              return {
                ...day,
                attendanceRecords: updatedAttendanceRecords,
              };
            }
            return day;
          })
        }));
        
        return {
          ...old,
          weeks: updatedWeeks,
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['studentCleaningData'], context.previousData);
      }
    },
    onSuccess: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['studentCleaningData'] });
    },
  });
};

// Utility functions
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const isDayPast = (dateString: string) => {
  return new Date(dateString) < new Date();
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'FULL':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'CLOSED':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

export const getAttendanceStatusColor = (status: string) => {
  switch (status) {
    case 'ATTENDED':
      return 'text-green-400 bg-green-500/20';
    case 'NO_SHOW':
      return 'text-red-400 bg-red-500/20';
    case 'PENDING':
      return 'text-yellow-400 bg-yellow-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
};