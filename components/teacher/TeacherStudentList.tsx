'use client';

import { Users } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import GradeAssignmentCard from '@/components/ui/GradeAssignmentCard';

interface TeacherStudentListProps {
  students: any[];
  selectedWeek: number;
  isLoading?: boolean;
  onGradeAssign: (studentId: string, courseId: string, gradeLetter: string) => void;
}

export default function TeacherStudentList({
  students,
  selectedWeek,
  isLoading,
  onGradeAssign
}: TeacherStudentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No students assigned"
        description="No students have been assigned to you yet"
      />
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {students.map((student) => (
        <GradeAssignmentCard
          key={student.id}
          student={student}
          weekNumber={selectedWeek}
          onGradeAssign={(courseId, gradeLetter) => onGradeAssign(student.id, courseId, gradeLetter)}
          isEditable={true}
        />
      ))}
    </div>
  );
}