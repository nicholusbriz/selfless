import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi, StudentWithCourses, WeeklyProgress } from '@/lib/api/teacher';

// Query Keys
const teacherKeys = {
  all: ['teacher'] as const,
  students: () => [...teacherKeys.all, 'students'] as const,
};

// Queries
export const useTeacherStudents = () => {
  return useQuery({
    queryKey: teacherKeys.students(),
    queryFn: teacherApi.getStudents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useAssignGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherApi.assignGrade,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: teacherKeys.students() });

      // Snapshot previous value
      const previousStudents = queryClient.getQueryData(teacherKeys.students());

      // Optimistically update the student's grade
      queryClient.setQueryData(teacherKeys.students(), (old: any) => {
        const data = old || { students: [] };
        return {
          ...data,
          students: data.students.map((student: any) => {
            if (student.id === variables.studentId) {
              const updatedGrades = student.existingGrades ? [...student.existingGrades] : [];
              const existingGradeIndex = updatedGrades.findIndex(
                (g: any) => g.courseId === variables.courseId && g.week === variables.week
              );
              
              if (existingGradeIndex >= 0) {
                updatedGrades[existingGradeIndex] = {
                  ...updatedGrades[existingGradeIndex],
                  gradeLetter: variables.gradeLetter,
                };
              } else {
                updatedGrades.push({
                  id: `temp-${Date.now()}`,
                  studentId: variables.studentId,
                  courseId: variables.courseId,
                  week: variables.week,
                  gradeLetter: variables.gradeLetter,
                });
              }
              
              return { ...student, existingGrades: updatedGrades };
            }
            return student;
          }),
        };
      });

      return { previousStudents };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousStudents) {
        queryClient.setQueryData(teacherKeys.students(), context.previousStudents);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate teacher queries
      queryClient.invalidateQueries({ queryKey: teacherKeys.students() });
      
      // Invalidate the affected student's grades query so their dashboard updates
      queryClient.invalidateQueries({
        queryKey: ['student', variables.studentId, 'grades']
      });
    },
  });
};
