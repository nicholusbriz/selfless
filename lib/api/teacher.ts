import axios from '@/lib/axios';
import { z } from 'zod';
import { CourseSchema, GradeSchema } from './student';

// Zod Schemas
const StudentWithCoursesSchema = z.object({
  id: z.string(),
  name: z.string(),
  studentId: z.string(),
  currentGPA: z.number(),
  enrolledCourses: z.array(CourseSchema),
  existingGrades: z.array(GradeSchema),
});

const WeeklyProgressSchema = z.object({
  week: z.number(),
  graded: z.number(),
  total: z.number(),
  percentage: z.number(),
});

// Types
export type StudentWithCourses = z.infer<typeof StudentWithCoursesSchema>;
export type WeeklyProgress = z.infer<typeof WeeklyProgressSchema>;

// API Functions
export const teacherApi = {
  // Get all students with their courses and grades
  getStudents: async () => {
    const response = await axios.get('/teacher/students');
    return z.object({ students: z.array(StudentWithCoursesSchema) }).parse(response.data);
  },

  // Assign/update a grade
  assignGrade: async (data: {
    studentId: string;
    courseId: string;
    week: number;
    gradeLetter: string;
  }) => {
    const response = await axios.post('/teacher/grades', data);
    return response.data;
  },

  // Get grading progress by week
  getGradingProgress: async (week?: number) => {
    const params = week ? { week } : {};
    const response = await axios.get('/teacher/grades', { params });
    return z.object({ weeklyProgress: z.array(WeeklyProgressSchema) }).parse(response.data);
  },
};
