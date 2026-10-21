// hooks/useDevCleaning.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types (reusing from useCleaning.ts)
export interface TechCenter {
  id: string;
  name: string;
  code: string;
}

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
    profileImageUrl: string | null;
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
    profileImageUrl: string | null;
  };
}

export interface CleaningStats {
  totalWeeks: number;
  totalDays: number;
  totalRegistrations: number;
  totalUnregistered: number;
  totalAttended: number;
  totalNoShow: number;
  totalPending: number;
}

export interface StudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  techCenterId?: string;
}

export interface DevCleaningData {
  weeks: CleaningWeek[];
  /** Assignable students: active users with fewer than 2 registrations */
  students: StudentSummary[];
  /** All active students in the tech center (for internal lookups) */
  allStudents: StudentSummary[];
  /** Students with 0 registrations */
  unregisteredStudents: { id: string; firstName: string; lastName: string }[];
  stats: CleaningStats;
}

// API Functions (pointing to dev endpoints)
const api = {
  getDevCleaningData: async (techCenterId: string): Promise<DevCleaningData> => {
    const url = `/api/dev/cleaning?techCenterId=${techCenterId}`;
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch cleaning data');
    }
    return response.json();
  },

  createWeek: async (data: any) => {
    const response = await fetch('/api/dev/cleaning', {
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
    const response = await fetch(`/api/dev/cleaning/weeks/${weekId}`, {
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
    const response = await fetch(`/api/dev/cleaning/weeks/${weekId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete week');
    }
    return response.json();
  },

  updateDay: async ({ dayId, data }: { dayId: string; data: any }) => {
    const response = await fetch(`/api/dev/cleaning/days/${dayId}`, {
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
    const response = await fetch(`/api/dev/cleaning/days/${dayId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete day');
    }
    return response.json();
  },

  assignStudent: async ({ studentUserId, cleaningDayId }: { studentUserId: string; cleaningDayId: string }) => {
    const response = await fetch('/api/dev/cleaning/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentUserId, cleaningDayId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || error.message || 'Failed to assign student',
      );
    }
    return response.json();
  },

  markAttendance: async ({ userId, cleaningDayId, status }: { userId: string; cleaningDayId: string; status: 'ATTENDED' | 'NO_SHOW' | 'PENDING' }) => {
    const response = await fetch('/api/dev/cleaning/attendance', {
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

  removeStudent: async ({ studentUserId, cleaningDayId }: { studentUserId: string; cleaningDayId: string }) => {
    const response = await fetch('/api/dev/cleaning/remove-student', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentUserId, cleaningDayId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove student');
    }
    return response.json();
  },
};

// React Query Hooks
export const useDevCleaning = (techCenterId: string) => {
  return useQuery({
    queryKey: ['devCleaning', techCenterId],
    queryFn: () => api.getDevCleaningData(techCenterId),
    enabled: !!techCenterId, // Only run query when techCenterId is provided
  });
};

export const useDevCreateWeek = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createWeek,
    onMutate: async (data: any) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
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
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};

export const useDevUpdateWeek = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateWeek,
    onMutate: async ({ weekId, data }: { weekId: string; data: any }) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
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
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};

export const useDevDeleteWeek = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteWeek,
    onMutate: async (weekId: string) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
        if (!old) return old;

        const weekToDelete = old.weeks.find(w => w.id === weekId);
        let daysToRemove = 0;
        let registrationsToRemove = 0;

        if (weekToDelete) {
          daysToRemove = weekToDelete.days.length;
          registrationsToRemove = weekToDelete.days.reduce((sum, day) => sum + day.registrations.length, 0);
        }

        return {
          ...old,
          weeks: old.weeks.filter(week => week.id !== weekId),
          stats: {
            ...old.stats,
            totalWeeks: Math.max(0, old.stats.totalWeeks - 1),
            totalDays: Math.max(0, old.stats.totalDays - daysToRemove),
            totalRegistrations: Math.max(0, old.stats.totalRegistrations - registrationsToRemove),
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};

export const useDevUpdateDay = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateDay,
    onMutate: async ({ dayId, data }: { dayId: string; data: any }) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
        if (!old) return old;

        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.map(day => {
              if (day.id === dayId) {
                // Calculate new status if capacity is being changed
                let newStatus = day.status;
                if (data.capacityLimit !== undefined) {
                  if (day.currentRegistrations >= data.capacityLimit) {
                    newStatus = 'FULL';
                  } else {
                    newStatus = 'OPEN';
                  }
                }
                return { ...day, ...data, status: newStatus };
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
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};

export const useDevDeleteDay = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteDay,
    onMutate: async (dayId: string) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
        if (!old) return old;

        let registrationsToRemove = 0;

        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.filter(day => {
              if (day.id === dayId) {
                registrationsToRemove = day.registrations.length;
                return false;
              }
              return true;
            }),
          })),
          stats: {
            ...old.stats,
            totalDays: Math.max(0, old.stats.totalDays - 1),
            totalRegistrations: Math.max(0, old.stats.totalRegistrations - registrationsToRemove),
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};

export const useDevManualAssign = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.assignStudent,
    onMutate: async ({ studentUserId, cleaningDayId }: { studentUserId: string; cleaningDayId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
        if (!old) return old;

        // Look up from allStudents so we always have the full profile for the optimistic row
        const student = (old.allStudents ?? old.students).find(s => s.id === studentUserId);
        if (!student) return old;

        // Count existing registrations for this student across all days
        let existingRegCount = 0;
        old.weeks.forEach(week =>
          week.days.forEach(day =>
            day.registrations.forEach(r => {
              if (r.userId === studentUserId) existingRegCount++;
            })
          )
        );
        const newRegCount = existingRegCount + 1;

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
              return day;
            }),
          })),
          // Remove student from assignable list if they now have 2 registrations
          students: newRegCount >= 2
            ? old.students.filter(s => s.id !== studentUserId)
            : old.students,
          unregisteredStudents: old.unregisteredStudents.filter(s => s.id !== studentUserId),
          stats: {
            ...old.stats,
            totalRegistrations: old.stats.totalRegistrations + 1,
            totalUnregistered: Math.max(0, old.stats.totalUnregistered - 1),
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};

export const useDevMarkAttendance = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markAttendance,
    onMutate: async ({ userId, cleaningDayId, status }: { userId: string; cleaningDayId: string; status: 'ATTENDED' | 'NO_SHOW' | 'PENDING' }) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
        if (!old) return old;

        let attendedChange = 0;
        let noShowChange = 0;
        let pendingChange = 0;

        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.map(day => {
              if (day.id === cleaningDayId) {
                const existingAttendance = day.attendanceRecords?.find(a => a.userId === userId);

                // Calculate stat changes
                if (existingAttendance) {
                  if (existingAttendance.status === 'ATTENDED') attendedChange--;
                  else if (existingAttendance.status === 'NO_SHOW') noShowChange--;
                  else if (existingAttendance.status === 'PENDING') pendingChange--;
                }
                if (status === 'ATTENDED') attendedChange++;
                else if (status === 'NO_SHOW') noShowChange++;
                else if (status === 'PENDING') pendingChange++;

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
                      user: day.registrations.find(r => r.userId === userId)?.user || { id: userId, firstName: '', lastName: '', email: '', profileImageUrl: null },
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
          stats: {
            ...old.stats,
            totalAttended: Math.max(0, old.stats.totalAttended + attendedChange),
            totalNoShow: Math.max(0, old.stats.totalNoShow + noShowChange),
            totalPending: Math.max(0, old.stats.totalPending + pendingChange),
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};

export const useDevRemoveStudent = (techCenterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.removeStudent,
    onMutate: async (params: { studentUserId: string; cleaningDayId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['devCleaning', techCenterId] });
      const previousData = queryClient.getQueryData(['devCleaning', techCenterId]) as DevCleaningData;

      queryClient.setQueryData(['devCleaning', techCenterId], (old: DevCleaningData | undefined) => {
        if (!old) return old;

        const student = (old.allStudents ?? old.students).find(s => s.id === params.studentUserId);
        let registrationCountChange = 0;

        // Count remaining registrations after removal
        let remainingRegs = 0;
        old.weeks.forEach(week =>
          week.days.forEach(day => {
            if (day.id !== params.cleaningDayId) {
              day.registrations.forEach(r => {
                if (r.userId === params.studentUserId) remainingRegs++;
              });
            }
          })
        );

        return {
          ...old,
          weeks: old.weeks.map(week => ({
            ...week,
            days: week.days.map(day => {
              if (day.id === params.cleaningDayId) {
                const hadRegistration = day.registrations.some(r => r.userId === params.studentUserId);
                if (hadRegistration) {
                  registrationCountChange++;
                  return {
                    ...day,
                    currentRegistrations: Math.max(0, day.currentRegistrations - 1),
                    status: 'OPEN',
                    registrations: day.registrations.filter(r => r.userId !== params.studentUserId),
                  };
                }
              }
              return day;
            }),
          })),
          // Re-add student to assignable list if they now have < 2 registrations
          students: student && !old.students.some(s => s.id === student.id)
            ? [...old.students, student]
            : old.students,
          unregisteredStudents: student && remainingRegs === 0
            ? [...old.unregisteredStudents, { id: student.id, firstName: student.firstName, lastName: student.lastName }]
            : old.unregisteredStudents,
          stats: {
            ...old.stats,
            totalRegistrations: Math.max(0, old.stats.totalRegistrations - registrationCountChange),
            totalUnregistered: student && remainingRegs === 0 ? old.stats.totalUnregistered + 1 : old.stats.totalUnregistered,
          },
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['devCleaning', techCenterId], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devCleaning', techCenterId] });
    },
  });
};
