'use client';

import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users } from 'lucide-react';

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
  // Transform course departments for pie chart
  const departmentData = Object.entries(statistics.courseDepartments).map(([dept, count]) => ({
    name: dept,
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
