'use client';

import { BookOpen } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import { CourseListItemSkeleton } from '@/components/shared/LoadingState';

interface StudentCourseListProps {
  courses: any[];
  isLoading?: boolean;
}

export default function StudentCourseList({ courses, isLoading }: StudentCourseListProps) {
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
        icon={BookOpen} 
        title="No courses enrolled" 
        description='Click "My Courses" to add some!'
      />
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Enrolled Courses ({courses.length})
        </h2>
      </div>
      <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
        {courses.map((course: any, idx: number) => (
          <div key={course.id || idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div>
              <p className="text-white font-medium">{course.courseName}</p>
              <p className="text-gray-400 text-sm">{course.credits} credit(s)</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Status</p>
              <p className="text-green-400 text-sm">Active</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}