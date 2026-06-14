'use client';

import { Award } from 'lucide-react';
import GradeBadge from '@/components/shared/GradeBadge';
import EmptyState from '@/components/shared/EmptyState';
import { CourseListItemSkeleton } from '@/components/shared/LoadingState';

interface StudentGradesTableProps {
  courses: any[];
  grades: any[];
  selectedWeek: number;
  isLoading?: boolean;
}

export default function StudentGradesTable({ courses, grades, selectedWeek, isLoading }: StudentGradesTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded h-6 w-48"></div>
        </div>
        <div className="divide-y divide-white/10">
          {[1, 2, 3, 4, 5].map(i => <CourseListItemSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState 
        icon={Award} 
        title="No courses enrolled" 
        description="Add courses first!"
      />
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Award className="w-5 h-5" />
          Week {selectedWeek} Grades
        </h2>
      </div>
      <div className="divide-y divide-white/10">
        {courses.map((course: any) => {
          const grade = grades.find(
            (g: any) => g.courseId === course.id && g.week === selectedWeek
          );
          return (
            <div
              key={course.id}
              className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{course.courseName}</p>
                <p className="text-gray-400 text-sm">{course.credits} credits</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs mb-1">Grade</p>
                <GradeBadge grade={grade?.gradeLetter} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}