'use client';

import { useState } from 'react';
import { Search, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

interface AdminTuitionListProps {
  students: any[];
  isLoading?: boolean;
  onTogglePayment?: (studentId: string, currentStatus: boolean) => void;
}

export default function AdminTuitionList({
  students,
  isLoading,
  onTogglePayment
}: AdminTuitionListProps) {
  const [search, setSearch] = useState('');

  const studentsWithTuition = students.filter(s => s.tuition !== null);
  const filteredStudents = studentsWithTuition.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const totalTuition = studentsWithTuition.reduce((sum, s) => sum + (s.tuition || 0), 0);
  const paidTuition = studentsWithTuition.filter(s => s.tuitionPaid).reduce((sum, s) => sum + (s.tuition || 0), 0);
  const pendingTuition = totalTuition - paidTuition;
  const pendingCount = studentsWithTuition.filter(s => !s.tuitionPaid).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
              <div className="h-8 bg-white/10 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (studentsWithTuition.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title="No tuition records"
        description="Students haven't set their tuition amounts yet"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-gray-400 text-sm font-medium">Total Tuition</h3>
          </div>
          <p className="text-3xl font-bold text-white">${totalTuition.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-gray-400 text-sm font-medium">Paid Tuition</h3>
          </div>
          <p className="text-3xl font-bold text-white">${paidTuition.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-gray-400 text-sm font-medium">Pending ({pendingCount})</h3>
          </div>
          <p className="text-3xl font-bold text-white">${pendingTuition.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Tuition List */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="divide-y divide-white/10">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex-1">
                <p className="text-white font-medium">{student.name}</p>
                <p className="text-gray-400 text-sm">{student.studentId}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">${student.tuition?.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs">{student.email}</p>
                </div>
                {onTogglePayment && (
                  <button
                    onClick={() => onTogglePayment(student.id, student.tuitionPaid)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      student.tuitionPaid
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    }`}
                  >
                    {student.tuitionPaid ? 'Paid' : 'Pending'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}