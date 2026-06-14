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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', userId, 'profile'] });
    },
  });
};