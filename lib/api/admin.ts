import axios from '@/lib/axios';
import { z } from 'zod';
import { CourseSchema, GradeSchema } from './student';

// Zod Schemas
const StudentSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  studentId: z.string(),
  email: z.string(),
  phoneNumber: z.string().nullable().optional(),
  roleId: z.string().nullable(),
  role: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
  currentGPA: z.number(),
  totalCredits: z.number(),
  coursesCount: z.number(),
  tuition: z.number().nullable(),
  tuitionPaid: z.boolean(),
  // ADD THESE FIELDS:
  enrolledCourses: z.array(z.any()).optional().default([]),  // ← Add this
  grades: z.array(z.any()).optional().default([]),           // ← Add this
});

const StudentDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  studentId: z.string(),
  currentGPA: z.number(),
  enrolledCourses: z.array(CourseSchema),
  grades: z.array(GradeSchema),
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phoneNumber: z.string().nullable(),
  }),
});

const GPADistributionSchema = z.object({
  excellent: z.number(),
  good: z.number(),
  satisfactory: z.number(),
  fair: z.number(),
  needsImprovement: z.number(),
  averageGPA: z.number(),
  totalStudents: z.number(),
});

const WeeklyProgressSchema = z.object({
  week: z.number(),
  graded: z.number(),
  total: z.number(),
  percentage: z.number(),
});

// Types
export type StudentSummary = z.infer<typeof StudentSummarySchema>;
export type GPADistribution = z.infer<typeof GPADistributionSchema>;
export type AdminWeeklyProgress = z.infer<typeof WeeklyProgressSchema>;

// API Functions
export const adminApi = {
  // Get all students with optional filters
  getStudents: async (params?: { gpaMin?: number; gpaMax?: number; search?: string; role?: string }) => {
    const response = await axios.get('/api/admin/students', { params });
    // Remove the zod parsing temporarily to debug
    return response.data;
  },

  // Get student details by ID
  getStudentById: async (id: string) => {
    const response = await axios.get(`/api/admin/students/${id}`);
    return response.data;
  },

  // Update student
  updateStudent: async (id: string, data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  }) => {
    const response = await axios.put(`/api/admin/students/${id}`, data);
    return response.data;
  },

  // Delete student
  deleteStudent: async (id: string) => {
    const response = await axios.delete('/api/admin/students', { params: { id } });
    return response.data;
  },

  // Get GPA distribution report
  getGPADistribution: async () => {
    const response = await axios.get('/api/admin/reports/gpa-distribution');
    return response.data;
  },

  // Get weekly progress report
  getWeeklyProgress: async () => {
    const response = await axios.get('/api/admin/reports/weekly-progress');
    return response.data;
  },

  // Update student tuition status
  updateTuitionStatus: async (studentId: string, tuitionPaid: boolean) => {
    const response = await axios.put(`/api/admin/students/${studentId}/tuition`, { tuitionPaid });
    return response.data;
  },

  // Get all roles
  getRoles: async () => {
    const response = await axios.get('/api/admin/roles');
    return response.data;
  },

  // Update user role (with automatic profile creation/deletion)
  updateUserRole: async (userId: string, roleId: string) => {
    const response = await axios.put(`/api/admin/users/${userId}/role`, { roleId });
    return response.data;
  },
};