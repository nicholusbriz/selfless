import { getApiErrorMessage } from '@/lib/api-response';
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

export interface UnregisteredStudent {
  id: string;
  firstName: string;
  lastName: string;
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
  registrations: UserRegistration[];
  userAttendance: UserAttendance[];
  unregisteredStudents: UnregisteredStudent[];
  studentsByRegistrationCount: {
    zero: UnregisteredStudent[];
    one: UnregisteredStudent[];
    two: UnregisteredStudent[];
  };
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
  registrationCount?: number;
}

// ----------------------------------------------------------------
// Helper: build a trimmed UserRegistration from a day id
// (used by both optimistic updates so the shape matches the type)
// ----------------------------------------------------------------

const buildRegistrationFromDay = (
  old: CleaningData,
  dayId: string,
): UserRegistration | null => {
  const day = old.weeks.flatMap((w) => w.days).find((d) => d.id === dayId);
  if (!day) return null;

  const week = old.weeks.find((w) => w.days.some((d) => d.id === dayId));
  if (!week) return null;

  return {
    id: 'temp-' + Date.now(),
    cleaningDayId: dayId,
    cleaningDay: {
      id: day.id,
      dayOfWeek: day.dayOfWeek,
      cleaningDate: day.cleaningDate,
      status: day.status,
      week: { id: week.id, weekLabel: week.weekLabel },
    },
  };
};

// API Functions
const api = {
  getCleaningData: async (): Promise<CleaningData> => {
    const response = await fetch('/api/cleaning/student');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(getApiErrorMessage(error, 'Failed to fetch cleaning data'));
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
      throw new Error(getApiErrorMessage(error, 'Failed to register for cleaning'));
    }
    return response.json();
  },

  changeRegistration: async ({ newDayId, oldDayId }: { newDayId: string; oldDayId?: string }) => {
    const response = await fetch('/api/cleaning/change-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDayId, oldDayId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(getApiErrorMessage(error, 'Failed to change registration'));
    }
    return response.json();
  },

  unregisterFromCleaning: async ({ cleaningDayId }: { cleaningDayId: string }) => {
    const response = await fetch('/api/cleaning/register', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cleaningDayId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(getApiErrorMessage(error, 'Failed to unregister from cleaning day'));
    }
    return response.json();
  },

  markAttendance: async ({
    userId,
    cleaningDayId,
    status,
  }: {
    userId: string;
    cleaningDayId: string;
    status: 'ATTENDED' | 'NO_SHOW' | 'PENDING';
  }) => {
    const response = await fetch('/api/admin/cleaning/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cleaningDayId, status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(getApiErrorMessage(error, 'Failed to mark attendance'));
    }
    return response.json();
  },
};

// ----------------------------------------------------------------
// Primary query â€” everything derives from this single source
// ----------------------------------------------------------------

export const useStudentCleaningData = () => {
  return useQuery({
    queryKey: ['studentCleaningData'],
    queryFn: api.getCleaningData,
    refetchInterval: 30000,
    // Keep the previous data visible during background refetches so the UI
    // never flickers when the slow endpoint finally returns.
    placeholderData: (prev) => prev,
  });
};

// ----------------------------------------------------------------
// Status â€” derived from the same cache. NO second network call.
// ----------------------------------------------------------------

export const useStudentCleaningStatus = () => {
  const query = useStudentCleaningData();

  const data: CleaningStatus | undefined = query.data
    ? query.data.registrations && query.data.registrations.length > 0
      ? {
          hasRegistration: true,
          registration: {
            id: query.data.registrations[0].id,
            dayId: query.data.registrations[0].cleaningDayId,
            dayOfWeek: query.data.registrations[0].cleaningDay.dayOfWeek,
            cleaningDate: query.data.registrations[0].cleaningDay.cleaningDate,
            weekId: query.data.registrations[0].cleaningDay.week.id,
            weekLabel: query.data.registrations[0].cleaningDay.week.weekLabel,
            status: query.data.registrations[0].cleaningDay.status,
          },
          weekId: query.data.registrations[0].cleaningDay.week.id,
          weekLabel: query.data.registrations[0].cleaningDay.week.weekLabel,
          registrationCount: query.data.registrations.length,
        }
      : {
          hasRegistration: false,
          message: 'No registration found',
        }
    : undefined;

  return {
    data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

// ----------------------------------------------------------------
// Register for the first time â€” optimistic, non-blocking
// ----------------------------------------------------------------

export const useRegisterForCleaning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.registerForCleaning,

    onMutate: async (cleaningDayId: string) => {
      await queryClient.cancelQueries({ queryKey: ['studentCleaningData'] });

      const previousData = queryClient.getQueryData<CleaningData>([
        'studentCleaningData',
      ]);

      queryClient.setQueryData<CleaningData>(
        ['studentCleaningData'],
        (old) => {
          if (!old) return old;

          const updatedWeeks = old.weeks.map((week) => ({
            ...week,
            days: week.days.map((day) => {
              if (day.id !== cleaningDayId) return day;

              const next = day.currentRegistrations + 1;

              return {
                ...day,
                currentRegistrations: next,
                status:
                  next >= day.capacityLimit ? ('FULL' as const) : ('OPEN' as const),
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
                  },
                ],
              };
            }),
          }));

          const withWeeks: CleaningData = { ...old, weeks: updatedWeeks };

          const newRegistration = buildRegistrationFromDay(
            withWeeks,
            cleaningDayId,
          );

          return {
            ...withWeeks,
            unregisteredStudents: (old.unregisteredStudents || []).filter(
              (s) => s.id !== old.user.id,
            ),
            registrations: newRegistration
              ? [...(old.registrations || []), newRegistration]
              : old.registrations || [],
          };
        },
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['studentCleaningData'],
          context.previousData,
        );
      }
    },

    onSettled: () => {
      // Mark stale WITHOUT a blocking refetch â€” the optimistic state
      // remains visible. The next 30s tick (or window focus) will re-sync.
      queryClient.invalidateQueries({
        queryKey: ['studentCleaningData'],
        refetchType: 'none',
      });
    },
  });
};

// ----------------------------------------------------------------
// Change (switch) day â€” optimistic, non-blocking
// ----------------------------------------------------------------

export const useChangeRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.changeRegistration,

    onMutate: async ({ newDayId, oldDayId }: { newDayId: string; oldDayId?: string }) => {
      await queryClient.cancelQueries({ queryKey: ['studentCleaningData'] });

      const previousData = queryClient.getQueryData<CleaningData>([
        'studentCleaningData',
      ]);

      queryClient.setQueryData<CleaningData>(
        ['studentCleaningData'],
        (old) => {
          if (!old || !old.registrations || old.registrations.length === 0) return old;

          // If oldDayId is provided, use it; otherwise use the first registration
          const targetOldDayId = oldDayId || old.registrations[0].cleaningDayId;

          const updatedWeeks = old.weeks.map((week) => ({
            ...week,
            days: week.days.map((day) => {
              // Remove current user from the old day
              if (day.id === targetOldDayId) {
                const next = Math.max(0, day.currentRegistrations - 1);
                return {
                  ...day,
                  currentRegistrations: next,
                  status: 'OPEN' as const,
                  registrations: day.registrations.filter(
                    (r) => r.userId !== old.user.id,
                  ),
                };
              }

              // Add current user to the new day
              if (day.id === newDayId) {
                const next = day.currentRegistrations + 1;
                return {
                  ...day,
                  currentRegistrations: next,
                  status:
                    next >= day.capacityLimit
                      ? ('FULL' as const)
                      : ('OPEN' as const),
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
                    },
                  ],
                };
              }

              return day;
            }),
          }));

          const withWeeks: CleaningData = { ...old, weeks: updatedWeeks };

          const newRegistration = buildRegistrationFromDay(withWeeks, newDayId);

          // Replace the old registration with the new one
          const updatedRegistrations = (old.registrations || []).map(reg =>
            reg.cleaningDayId === targetOldDayId && newRegistration
              ? newRegistration
              : reg
          );

          return {
            ...withWeeks,
            registrations: updatedRegistrations,
          };
        },
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['studentCleaningData'],
          context.previousData,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['studentCleaningData'],
        refetchType: 'none',
      });
    },
  });
};

// ----------------------------------------------------------------
// Unregister from a specific day â€” optimistic, non-blocking
// ----------------------------------------------------------------

export const useUnregisterFromCleaning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.unregisterFromCleaning,

    onMutate: async ({ cleaningDayId }: { cleaningDayId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['studentCleaningData'] });

      const previousData = queryClient.getQueryData<CleaningData>([
        'studentCleaningData',
      ]);

      queryClient.setQueryData<CleaningData>(
        ['studentCleaningData'],
        (old) => {
          if (!old) return old;

          const updatedWeeks = old.weeks.map((week) => ({
            ...week,
            days: week.days.map((day) => {
              if (day.id !== cleaningDayId) return day;

              const next = Math.max(0, day.currentRegistrations - 1);

              return {
                ...day,
                currentRegistrations: next,
                status: 'OPEN' as const,
                registrations: day.registrations.filter(
                  (r) => r.userId !== old.user.id,
                ),
              };
            }),
          }));

          const withWeeks: CleaningData = { ...old, weeks: updatedWeeks };

          return {
            ...withWeeks,
            registrations: (old.registrations || []).filter(
              (reg) => reg.cleaningDayId !== cleaningDayId
            ),
            unregisteredStudents: old.unregisteredStudents || [],
          };
        },
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['studentCleaningData'],
          context.previousData,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['studentCleaningData'],
        refetchType: 'none',
      });
    },
  });
};

// ----------------------------------------------------------------
// Mark attendance â€” optimistic, non-blocking
// ----------------------------------------------------------------

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.markAttendance,

    onMutate: async ({
      userId,
      cleaningDayId,
      status,
    }: {
      userId: string;
      cleaningDayId: string;
      status: 'ATTENDED' | 'NO_SHOW' | 'PENDING';
    }) => {
      await queryClient.cancelQueries({ queryKey: ['studentCleaningData'] });

      const previousData = queryClient.getQueryData<CleaningData>([
        'studentCleaningData',
      ]);

      queryClient.setQueryData<CleaningData>(
        ['studentCleaningData'],
        (old) => {
          if (!old) return old;

          const updatedWeeks = old.weeks.map((week) => ({
            ...week,
            days: week.days.map((day) => {
              if (day.id !== cleaningDayId) return day;

              const existing = day.attendanceRecords?.find(
                (a) => a.userId === userId,
              );

              const updatedAttendanceRecords = existing
                ? day.attendanceRecords.map((a) =>
                    a.userId === userId ? { ...a, status } : a,
                  )
                : [
                    ...(day.attendanceRecords || []),
                    {
                      id: 'temp-' + Date.now(),
                      userId,
                      status,
                      user: {
                        id: userId,
                        firstName: '',
                        lastName: '',
                        profileImageUrl: null,
                      },
                    },
                  ];

              return { ...day, attendanceRecords: updatedAttendanceRecords };
            }),
          }));

          return { ...old, weeks: updatedWeeks };
        },
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['studentCleaningData'],
          context.previousData,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['studentCleaningData'],
        refetchType: 'none',
      });
    },
  });
};

// ----------------------------------------------------------------
// Utilities (unchanged)
// ----------------------------------------------------------------

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