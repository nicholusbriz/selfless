import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi, Course, Grade } from '@/lib/api/student';
import { useAuthStore } from '@/stores/authStore';

// Query Keys
const studentKeys = {
  all: (userId: string) => ['student', userId] as const,
  courses: (userId: string) => [...studentKeys.all(userId), 'courses'] as const,
  grades: (userId: string) => [...studentKeys.all(userId), 'grades'] as const,
};

// Queries
export const useStudentCourses = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';
  
  return useQuery({
    queryKey: studentKeys.courses(userId),
    queryFn: studentApi.getCourses,
    staleTime: 5 * 60 * 1000,
    enabled: !!user?.id, // Only fetch when user is authenticated
    select: (data) => {
      return { courses: data?.courses || [] };
    },
  });
};

export const useStudentGrades = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';
  
  return useQuery({
    queryKey: studentKeys.grades(userId),
    queryFn: studentApi.getGrades,
    staleTime: 5 * 60 * 1000,
    enabled: !!user?.id, // Only fetch when user is authenticated
    select: (data) => {
      return { grades: data?.grades || [] };
    },
  });
};

// Mutations
export const useSubmitCourses = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';

  return useMutation({
    mutationFn: studentApi.submitCourses,
    onMutate: async (newCourses) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: studentKeys.courses(userId) });

      // Snapshot previous value
      const previousCourses = queryClient.getQueryData(studentKeys.courses(userId));

      // Optimistically update to the new value
      queryClient.setQueryData(studentKeys.courses(userId), (old: any) => {
        const existingCourses = old?.courses || [];
        const coursesWithIds = newCourses.map((course: any) => ({
          ...course,
          id: `temp-${Date.now()}-${Math.random()}`,
          status: 'active'
        }));
        return { courses: [...existingCourses, ...coursesWithIds] };
      });

      // Return context with previous value for rollback
      return { previousCourses };
    },
    onError: (err, newCourses, context) => {
      // Rollback to previous value on error
      if (context?.previousCourses) {
        queryClient.setQueryData(studentKeys.courses(userId), context.previousCourses);
      }
    },
    onSuccess: () => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: studentKeys.courses(userId) });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      studentApi.updateCourse(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: studentKeys.courses(userId) });

      // Snapshot previous value
      const previousCourses = queryClient.getQueryData(studentKeys.courses(userId));

      // Optimistically update the specific course
      queryClient.setQueryData(studentKeys.courses(userId), (old: any) => {
        const courses = old?.courses || [];
        return {
          courses: courses.map((course: any) =>
            course.id === id ? { ...course, ...data } : course
          ),
        };
      });

      return { previousCourses };
    },
    onError: (err, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousCourses) {
        queryClient.setQueryData(studentKeys.courses(userId), context.previousCourses);
      }
    },
    onSuccess: () => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: studentKeys.courses(userId) });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';

  return useMutation({
    mutationFn: studentApi.deleteCourse,
    onMutate: async (courseId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: studentKeys.courses(userId) });

      // Snapshot previous value
      const previousCourses = queryClient.getQueryData(studentKeys.courses(userId));

      // Optimistically remove the course
      queryClient.setQueryData(studentKeys.courses(userId), (old: any) => {
        const courses = old?.courses || [];
        return {
          courses: courses.filter((course: any) => course.id !== courseId),
        };
      });

      return { previousCourses };
    },
    onError: (err, courseId, context) => {
      // Rollback to previous value on error
      if (context?.previousCourses) {
        queryClient.setQueryData(studentKeys.courses(userId), context.previousCourses);
      }
    },
    onSuccess: () => {
      // Refetch to ensure server state is correct
      queryClient.invalidateQueries({ queryKey: studentKeys.courses(userId) });
    },
  });
};

export const useStudentProfile = () => {
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';

  return useQuery({
    queryKey: ['student', userId, 'profile'],
    queryFn: studentApi.getProfile,
    staleTime: 5 * 60 * 1000,
    enabled: !!user?.id,
  });
};

export const useUpdateReligion = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';

  return useMutation({
    mutationFn: studentApi.updateReligion,
    onMutate: async (takesReligion) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['student', userId, 'profile'] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(['student', userId, 'profile']);

      // Optimistically update the religion preference
      queryClient.setQueryData(['student', userId, 'profile'], (old: any) => {
        return {
          ...old,
          profile: {
            ...old?.profile,
            takesReligion,
          },
        };
      });

      return { previousProfile };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['student', userId, 'profile'], context.previousProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', userId, 'profile'] });
    },
  });
};

export const useUpdateTuition = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id || 'anonymous';

  return useMutation({
    mutationFn: studentApi.updateTuition,
    onMutate: async (tuition) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['student', userId, 'profile'] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(['student', userId, 'profile']);

      // Optimistically update the tuition amount
      queryClient.setQueryData(['student', userId, 'profile'], (old: any) => {
        return {
          ...old,
          profile: {
            ...old?.profile,
            tuition,
          },
        };
      });

      return { previousProfile };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['student', userId, 'profile'], context.previousProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', userId, 'profile'] });
    },
  });
};