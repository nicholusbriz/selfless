'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, CheckCircle, Clock, X } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
}

interface Assignment {
  id: string;
  teacherId: string;
  studentId: string;
  status: string;
  teacher?: Teacher;
  student?: Student;
}

interface AdminAssignmentManagerProps {
  assignments: Assignment[];
  teachers: Teacher[];
  students: Student[];
  onAssign: (teacherId: string, studentIds: string[]) => void;
  onRemove: (assignmentIds: string[]) => void;
}

export default function AdminAssignmentManager({
  assignments,
  teachers,
  students,
  onAssign,
  onRemove
}: AdminAssignmentManagerProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = () => {
    if (selectedTeacher && selectedStudents.length > 0) {
      onAssign(selectedTeacher, selectedStudents);
      setSelectedTeacher('');
      setSelectedStudents([]);
      setShowAssignModal(false);
    }
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    onRemove([assignmentId]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/20 text-green-400';
      case 'not_verified':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'not_verified':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Assignment Management</h2>
          <p className="text-gray-400 text-sm">Manage teacher-student assignments</p>
        </div>
        <motion.button
          onClick={() => setShowAssignModal(true)}
          className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          New Assignment
        </motion.button>
      </div>

      {/* Assignments Table */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Teacher</th>
                <th className="text-left p-4 text-gray-400 font-medium">Student</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment, index) => (
                <motion.tr
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-4 text-white">
                    {assignment.teacher?.name || 'Unknown Teacher'}
                  </td>
                  <td className="p-4 text-white">
                    {assignment.student?.name || 'Unknown Student'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      <span className="ml-1 capitalize">{assignment.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <motion.button
                      onClick={() => handleRemoveAssignment(assignment.id)}
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
        {assignments.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No assignments found
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create Assignment</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Teacher
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} className="bg-gray-900">
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Students
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2 bg-white/5 rounded-lg p-4">
                  {students.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center p-2 hover:bg-white/10 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="mr-3 w-4 h-4 accent-purple-500"
                      />
                      <div>
                        <div className="text-white">{student.name}</div>
                        <div className="text-gray-400 text-sm">{student.studentId}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleAssign}
                  disabled={!selectedTeacher || selectedStudents.length === 0}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Assign Students
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
