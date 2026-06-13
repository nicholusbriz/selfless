import axios from '@/lib/axios';

interface Teacher {
  id: string;
  name: string;
  email: string;
  teacherId: string | null;
  profileId: string | null;
  totalStudents: number;
  verifiedCount: number;
  notVerifiedCount: number;
}

interface Assignment {
  id: string;
  teacherId: string;
  studentId: string;
  status: string;
  notes?: string;
  assignedAt: string;
  updatedAt: string;
}

export const assignmentsApi = {
  // Get all assignments
  getAssignments: async (params?: { teacherId?: string; studentId?: string; status?: string }) => {
    const response = await axios.get('/admin/assignments', { params });
    return response.data;
  },

  // Get all teachers
  getTeachers: async () => {
    const response = await axios.get('/admin/teachers');
    return response.data;
  },

  // Bulk create assignments
  createBulkAssignments: async (data: {
    teacherId: string;
    studentIds: string[];
    status?: string;
    notes?: string;
  }) => {
    const response = await axios.post('/admin/assignments/bulk', data);
    return response.data;
  },

  // Single create (for backward compatibility)
  createAssignment: async (data: {
    teacherId: string;
    studentId: string;
    notes?: string;
  }) => {
    const response = await axios.post('/admin/assignments', data);
    return response.data;
  },

  // Bulk delete assignments
  deleteBulkAssignments: async (assignmentIds: string[]) => {
    const response = await axios.delete('/admin/assignments/bulk', { data: { assignmentIds } });
    return response.data;
  },

  // Single delete (for backward compatibility)
  deleteAssignment: async (id: string) => {
    const response = await axios.delete(`/admin/assignments/${id}`);
    return response.data;
  },

  // Update assignment
  updateAssignment: async (id: string, data: { status?: string; notes?: string }) => {
    const response = await axios.patch(`/admin/assignments/${id}`, data);
    return response.data;
  },
};