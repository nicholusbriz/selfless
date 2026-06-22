'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  tuition: number | null;
  tuitionPaid: boolean;
}

interface AdminTuitionListProps {
  students: Student[];
  onTogglePayment: (studentId: string, currentStatus: boolean) => void;
}

export default function AdminTuitionList({
  students,
  onTogglePayment
}: AdminTuitionListProps) {
  // Calculate total tuition (handling null values)
  const totalTuition = students.reduce((sum, student) => sum + (student.tuition || 0), 0);
  const paidCount = students.filter(s => s.tuitionPaid && s.tuition).length;
  const pendingCount = students.filter(s => s.tuition && !s.tuitionPaid).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
          <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">${totalTuition.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Total Tuition</p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{paidCount}</p>
          <p className="text-gray-400 text-sm">Paid Students</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/20">
          <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{pendingCount}</p>
          <p className="text-gray-400 text-sm">Pending Payment</p>
        </div>
      </div>

      {/* Tuition Table */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-gray-400 font-medium">Student ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Name</th>
                <th className="text-left p-4 text-gray-400 font-medium">Email</th>
                <th className="text-left p-4 text-gray-400 font-medium">Tuition</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
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
                  <td className="p-4 text-white font-semibold">
                    {student.tuition ? (
                      `$${student.tuition.toLocaleString()}`
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                  </td>
                  <td className="p-4">
                    {!student.tuition ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-500/20 text-gray-400">
                        Not Submitted
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        student.tuitionPaid
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {student.tuitionPaid ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Paid
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {student.tuition ? (
                      <motion.button
                        onClick={() => onTogglePayment(student.id, student.tuitionPaid)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          student.tuitionPaid
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {student.tuitionPaid ? 'Mark Unpaid' : 'Mark Paid'}
                      </motion.button>
                    ) : (
                      <span className="text-gray-500 text-sm">No tuition set</span>
                    )}
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
    </div>
  );
}