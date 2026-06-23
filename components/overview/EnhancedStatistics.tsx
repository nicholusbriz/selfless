'use client';

import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, BookOpen, DollarSign, Calendar, UserCheck, TrendingUp } from 'lucide-react';

interface StatisticsProps {
  statistics: {
    totalStudents: number;
    studentsWithTutor: number;
    studentsWithoutTutor: number;
    tuitionPaidCount: number;
    tuitionUnpaidCount: number;
    gpaDistribution: { [key: string]: number };
    courseDepartments: { [key: string]: number };
    averageGPA: string;
    attendanceRate: string;
  };
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function EnhancedStatistics({ statistics }: StatisticsProps) {
  // Transform GPA distribution for chart
  const gpaData = Object.entries(statistics.gpaDistribution).map(([range, count]) => ({
    range,
    count
  }));

  // Transform course departments for pie chart
  const departmentData = Object.entries(statistics.courseDepartments).map(([dept, count]) => ({
    name: dept,
    value: count
  }));

  // Calculate percentages
  const tutorCoverage = statistics.totalStudents > 0
    ? ((statistics.studentsWithTutor / statistics.totalStudents) * 100).toFixed(1)
    : '0.0';

  const tuitionPaymentRate = statistics.totalStudents > 0
    ? ((statistics.tuitionPaidCount / statistics.totalStudents) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="w-8 h-8 text-purple-400" />
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{tutorCoverage}%</p>
              <p className="text-gray-400 text-sm">Tutor Coverage</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">{statistics.studentsWithTutor} with tutor</span>
            <span className="text-red-400">{statistics.studentsWithoutTutor} without</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{tuitionPaymentRate}%</p>
              <p className="text-gray-400 text-sm">Tuition Paid</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">{statistics.tuitionPaidCount} paid</span>
            <span className="text-red-400">{statistics.tuitionUnpaidCount} unpaid</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{statistics.averageGPA}</p>
              <p className="text-gray-400 text-sm">Average GPA</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">Across all students</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-orange-400" />
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{statistics.attendanceRate}%</p>
              <p className="text-gray-400 text-sm">Attendance Rate</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">Cleaning schedule</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPA Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            GPA Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gpaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="range" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course Enrollment by Department */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Course Enrollment by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
