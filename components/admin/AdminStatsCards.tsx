'use client';

import { Users, TrendingUp, UserPlus, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminStatsCardsProps {
  totalStudents: number;
  totalTeachers: number;
  totalAssignments: number;
  totalRevenue: number;
}

export default function AdminStatsCards({
  totalStudents,
  totalTeachers,
  totalAssignments,
  totalRevenue
}: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <motion.div
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-2xl font-bold text-white">{totalStudents}</p>
          </div>
          <Users className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>

      <motion.div
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Teachers</p>
            <p className="text-2xl font-bold text-white">{totalTeachers}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-400" />
        </div>
      </motion.div>

      <motion.div
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Assignments</p>
            <p className="text-2xl font-bold text-white">{totalAssignments}</p>
          </div>
          <UserPlus className="w-8 h-8 text-green-400" />
        </div>
      </motion.div>

      <motion.div
        className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
        whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-yellow-400" />
        </div>
      </motion.div>
    </div>
  );
}
