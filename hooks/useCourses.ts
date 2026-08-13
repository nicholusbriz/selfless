import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Course {
  id: string;
  name: string;
  code: string;
  courseUnit: string;
  credits: number;
  studentId: string;
  techCenterId: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
}

export interface CoursesData {
  courses: Course[];
  totalCredits: number;
}

// Hook to fetch student's courses
export function useCourses() {
  return useQuery({
    queryKey: ['student-courses'],
    queryFn: async () => {
      const response = await fetch('/api/student-courses');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch courses');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook to submit courses
export function useSubmitCourses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { courses: any[]; tuitionAmount: string }) => {
      const response = await fetch('/api/student-courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit courses');
      }
      return response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['student-courses'] });
      const previousData = queryClient.getQueryData(['student-courses']);
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['student-courses'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
}

// Hook to update a course
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: any }) => {
      const response = await fetch(`/api/student-courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update course');
      }
      return response.json();
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['student-courses'] });
      const previousData = queryClient.getQueryData(['student-courses']);
      
      queryClient.setQueryData(['student-courses'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          courses: old.courses.map((course: Course) =>
            course.id === variables.courseId
              ? { ...course, ...variables.data }
              : course
          )
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['student-courses'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
}

// Hook to delete a course
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetch(`/api/student-courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete course');
      }
      return response.json();
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['student-courses'] });
      const previousData = queryClient.getQueryData(['student-courses']);
      
      queryClient.setQueryData(['student-courses'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          courses: old.courses.filter((course: Course) => course.id !== variables),
          totalCredits: old.totalCredits - (old.courses.find((c: Course) => c.id === variables)?.credits || 0)
        };
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['student-courses'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
    },
  });
}
