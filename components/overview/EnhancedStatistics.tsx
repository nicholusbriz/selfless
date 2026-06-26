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
  return (
    <div className="space-y-6">
      {/* Statistics component - Course Enrollment by Department removed */}
    </div>
  );
}
