'use client';

import { useState } from 'react';
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';
import GradeBadge from '@/components/shared/GradeBadge';

interface AdminStudentTableProps {
  students: any[];
  isLoading?: boolean;
  onEdit?: (student: any) => void;
  onDelete?: (studentId: string) => void;
  onRoleChange?: (userId: string, roleId: string) => void;
  roles?: any[];
}

export default function AdminStudentTable({
  students,
  isLoading,
  onEdit,
  onDelete,
  onRoleChange,
  roles
}: AdminStudentTableProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.studentId.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="animate-pulse h-10 bg-white/10 rounded w-full"></div>
        </div>
        <div className="divide-y divide-white/10">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-32 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No students found"
        description="Students will appear here once they register"
      />
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-white/10 border-b border-white/10 text-gray-400 text-sm font-medium">
        <div className="col-span-4">Student</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-2">Student ID</div>
        <div className="col-span-1">GPA</div>
        <div className="col-span-1">Role</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/10">
        {paginatedStudents.map((student) => (
          <div key={student.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors">
            {/* Student Info */}
            <div className="col-span-4">
              <p className="text-white font-medium">{student.name}</p>
              <p className="text-gray-400 text-sm">{student.studentId}</p>
            </div>

            {/* Email */}
            <div className="col-span-3">
              <p className="text-gray-300 text-sm">{student.email}</p>
            </div>

            {/* Student ID */}
            <div className="col-span-2">
              <p className="text-gray-300 text-sm">{student.studentId}</p>
            </div>

            {/* GPA */}
            <div className="col-span-1">
              <GradeBadge grade={`${(student.currentGPA || 0).toFixed(2)}`} showIcon={false} />
            </div>

            {/* Role Selector */}
            <div className="col-span-1">
              {onRoleChange && roles && (
                <select
                  value={student.roleId || ''}
                  onChange={(e) => onRoleChange(student.id, e.target.value)}
                  className="bg-black/50 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {roles.map((role: any) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(student.id)}
                  className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}