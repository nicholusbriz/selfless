import axios from '@/lib/axios';
import { z } from 'zod';

// Zod Schemas
export const CourseSchema = z.object({
  id: z.string(),
  courseName: z.string(),
  credits: z.number(),
  status: z.string(),
  studentId: z.string(),
});

export const GradeSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  week: z.number(),
  gradeLetter: z.string(),
  gradePoints: z.number(),
  studentProfileId: z.string(),
  course: CourseSchema.optional(),
});

// Types
export type Course = z.infer<typeof CourseSchema>;
export type Grade = z.infer<typeof GradeSchema>;

// API Functions
export const studentApi = {
  // Get enrolled courses
  getCourses: async () => {
    const response = await axios.get('/api/student/courses');
    return response.data;
  },

  // Submit multiple courses
  submitCourses: async (courses: Omit<Course, 'id' | 'studentId' | 'status'>[]) => {
    const response = await axios.post('/api/student/courses', { courses });
    return response.data;
  },

  // Update a single course (using dynamic route)
  updateCourse: async (id: string, data: Partial<Course>) => {
    const response = await axios.put(`/api/student/courses/${id}`, data);
    return response.data;
  },

  // Delete a course (using dynamic route)
  deleteCourse: async (id: string) => {
    const response = await axios.delete(`/api/student/courses/${id}`);
    return response.data;
  },

  // Get all grades
  getGrades: async () => {
    const response = await axios.get('/api/student/grades');
    return response.data;
  },

  // Update student religion (boolean)
  updateReligion: async (takesReligion: boolean) => {
    const response = await axios.put('/api/student/profile', { takesReligion });
    return response.data;
  },

  // Update student tuition
  updateTuition: async (tuition: number) => {
    const response = await axios.put('/api/student/profile', { tuition });
    return response.data;
  },

  // Get student profile
  getProfile: async () => {
    const response = await axios.get('/api/student/profile');
    return response.data;
  },
};