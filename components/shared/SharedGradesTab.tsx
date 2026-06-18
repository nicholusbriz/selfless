'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import WeekSelector from '@/components/ui/WeekSelector';
import StudentGradesList from '@/components/shared/StudentGradesList';
import { useSharedGradesStudents, useSharedAssignGrade } from '@/hooks/queries/shared-grades';

interface SharedGradesTabProps {
  title?: string;
  description?: string;
}

export default function SharedGradesTab({
  title = 'Manage Grades',
  description = 'Assign and manage grades for all students'
}: SharedGradesTabProps) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Use shared hooks for both teachers and admins
  const { data: studentsData, isLoading, error, refetch } = useSharedGradesStudents();
  const assignGradeMutation = useSharedAssignGrade();

  const students = studentsData?.students || [];

  // Filter students based on search term
  const filteredStudents = students.filter((s: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(search) || s.studentId.toLowerCase().includes(search);
  });

  const handleGradeAssign = async (studentId: string, courseId: string, gradeLetter: string) => {
    try {
      await assignGradeMutation.mutateAsync({ studentId, courseId, week: selectedWeek, gradeLetter });
      refetch();
    } catch (error) {
      console.error('Error assigning grade:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-white/10 rounded animate-pulse"></div>
        <div className="h-12 w-96 bg-white/10 rounded animate-pulse"></div>
        <div className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8 text-center">
        <p className="text-red-400">Failed to load grades data. Please try again.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 text-sm sm:text-base">{description}</p>
        </div>
        <motion.button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Refresh
        </motion.button>
      </motion.div>

      <motion.div 
        className="bg-white/5 rounded-xl p-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <WeekSelector selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <StudentGradesList
          students={filteredStudents}
          selectedWeek={selectedWeek}
          onGradeAssign={handleGradeAssign}
          isEditable={true}
        />
      </motion.div>
    </motion.div>
  );
}
