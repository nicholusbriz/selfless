'use client';

import { motion } from 'framer-motion';
import { Trash2, Shield } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  roleId: string;
  role: { name: string };
  currentGPA: number;
  totalCredits: number;
  coursesCount: number;
  tuition: number;
  tuitionPaid: boolean;
}

interface Role {
  id: string;
  name: string;
}

interface AdminStudentTableProps {
  students: Student[];
  onDelete: (studentId: string) => void;
  onRoleChange: (userId: string, roleId: string) => void;
  roles?: Role[];
}

export default function AdminStudentTable({
  students,
  onDelete,
  onRoleChange,
  roles
}: AdminStudentTableProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-gray-400 font-medium">Student ID</th>
              <th className="text-left p-4 text-gray-400 font-medium">Name</th>
              <th className="text-left p-4 text-gray-400 font-medium">Email</th>
              <th className="text-left p-4 text-gray-400 font-medium">Role</th>
              <th className="text-left p-4 text-gray-400 font-medium">GPA</th>
              <th className="text-left p-4 text-gray-400 font-medium">Credits</th>
              <th className="text-left p-4 text-gray-400 font-medium">Tuition</th>
              <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <motion.tr
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="p-4 text-white">{student.studentId}</td>
                <td className="p-4 text-white">{student.name}</td>
                <td className="p-4 text-gray-400">{student.email}</td>
                <td className="p-4">
                  {roles && (
                    <select
                      value={student.roleId}
                      onChange={(e) => onRoleChange(student.id, e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id} className="bg-gray-900">
                          {role.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    student.currentGPA >= 3.5 ? 'bg-green-500/20 text-green-400' :
                    student.currentGPA >= 3.0 ? 'bg-blue-500/20 text-blue-400' :
                    student.currentGPA >= 2.5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {student.currentGPA.toFixed(2)}
                  </span>
                </td>
                <td className="p-4 text-white">{student.totalCredits}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-white">${student.tuition}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      student.tuitionPaid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {student.tuitionPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <motion.button
                    onClick={() => onDelete(student.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {students.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No students found
        </div>
      )}
    </div>
  );
}
