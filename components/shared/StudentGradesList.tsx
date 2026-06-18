'use client';

import React from 'react';
import { motion } from 'framer-motion';
import GradeAssignmentCard from '@/components/ui/GradeAssignmentCard';

interface StudentGradesListProps {
  students: any[];
  selectedWeek: number;
  onGradeAssign: (studentId: string, courseId: string, gradeLetter: string) => void;
  isEditable?: boolean;
}

export default function StudentGradesList({
  students,
  selectedWeek,
  onGradeAssign,
  isEditable = true
}: StudentGradesListProps) {
  if (!students || students.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center">
        <p className="text-gray-400">No students found</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4 max-h-[600px] overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {students.map((student: any, index: number) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
          <GradeAssignmentCard
            student={student}
            weekNumber={selectedWeek}
            onGradeAssign={(courseId, grade) => onGradeAssign(student.studentProfileId || student.id, courseId, grade)}
            isEditable={isEditable}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
