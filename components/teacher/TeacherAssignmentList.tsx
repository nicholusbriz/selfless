'use client';

import { UserCheck, CheckCircle, Clock } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

interface TeacherAssignmentListProps {
  assignments: any[];
  isLoading?: boolean;
  onStatusChange?: (assignmentId: string, status: string) => void;
}

export default function TeacherAssignmentList({
  assignments,
  isLoading,
  onStatusChange
}: TeacherAssignmentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
            <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
            <div className="h-4 w-48 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        title="No assigned students"
        description="No students have been assigned to you yet"
      />
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-medium">Assigned Students ({assignments.length})</h3>
      </div>
      <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
        {assignments.map((assignment: any) => {
          const student = assignment.student;
          const studentName = student?.firstName && student?.lastName 
            ? `${student.firstName} ${student.lastName}`
            : student?.firstName || 'Unknown Student';
          
          return (
            <div key={assignment.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex-1">
                <p className="text-white font-medium">{studentName}</p>
                <p className="text-gray-400 text-sm">
                  Student ID: {student?.studentProfile?.studentId || 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {onStatusChange && (
                  <select
                    value={assignment.status}
                    onChange={(e) => onStatusChange(assignment.id, e.target.value)}
                    className="bg-black/50 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="not_verified">Not Verified</option>
                    <option value="verified">Verified</option>
                  </select>
                )}
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  assignment.status === 'verified' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {assignment.status === 'verified' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span>{assignment.status === 'verified' ? 'Verified' : 'Pending'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}