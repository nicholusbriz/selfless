'use client';

import { useState, useEffect, useMemo } from 'react';
import { UserPlus, UserMinus, Filter, Users, Award, CheckCircle, XCircle, Search, CheckSquare, Square, Trash2 } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  role?: { name: string };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  teacherId: string;
}

interface Assignment {
  id: string;
  studentId: string;
  student: {
    user: {
      firstName: string;
      lastName: string;
    };
    studentId: string;
  };
  teacherId: string;
  teacher: {
    user: {
      firstName: string;
      lastName: string;
    };
    teacherId: string;
  };
  status: string;
  assignedAt: string;
}

interface AdminAssignmentManagerProps {
  assignments: Assignment[];
  teachers: Teacher[];
  students: Student[];
  isLoading?: boolean;
  onAssign?: (teacherId: string, studentIds: string[]) => void;
  onRemove?: (assignmentIds: string[]) => void;
}

export default function AdminAssignmentManager({
  assignments,
  teachers,
  students,
  isLoading,
  onAssign,
  onRemove,
}: AdminAssignmentManagerProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [filterTeacherId, setFilterTeacherId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedAssignmentIds, setSelectedAssignmentIds] = useState<Set<string>>(new Set());

  // Get all students (only those with 'student' role)
  const allStudents = useMemo(() => {
    return students.filter(s => s.role?.name === 'student');
  }, [students]);

  // Get already assigned student IDs for the selected teacher
  const assignedStudentIds = useMemo(() => {
    if (!selectedTeacher) return new Set<string>();
    return new Set(
      assignments
        .filter(a => a.teacherId === selectedTeacher)
        .map(a => a.studentId)
    );
  }, [assignments, selectedTeacher]);

  // Get available students (not assigned to selected teacher)
  const availableStudents = useMemo(() => {
    return allStudents.filter(s => !assignedStudentIds.has(s.id));
  }, [allStudents, assignedStudentIds]);

  // Filter available students by search term
  const searchedStudents = useMemo(() => {
    if (!searchTerm) return availableStudents;
    const term = searchTerm.toLowerCase();
    return availableStudents.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.studentId.toLowerCase().includes(term)
    );
  }, [availableStudents, searchTerm]);

  // Filter assignments by selected teacher
  const filteredAssignments = useMemo(() => {
    if (!filterTeacherId) return assignments;
    return assignments.filter(a => a.teacherId === filterTeacherId);
  }, [assignments, filterTeacherId]);

  // Get teacher name by ID
  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || 'Unknown Teacher';
  };

  // Handle bulk assign
  const handleBulkAssign = () => {
    if (selectedTeacher && selectedStudentIds.size > 0 && onAssign) {
      onAssign(selectedTeacher, Array.from(selectedStudentIds));
      setSelectedStudentIds(new Set());
      setSelectedTeacher('');
      setSearchTerm('');
    }
  };

  // Handle bulk remove
  const handleBulkRemove = () => {
    if (selectedAssignmentIds.size > 0 && onRemove) {
      if (confirm(`Remove ${selectedAssignmentIds.size} assignment(s)?`)) {
        onRemove(Array.from(selectedAssignmentIds));
        setSelectedAssignmentIds(new Set());
        setIsBulkMode(false);
      }
    }
  };

  // Toggle student selection for bulk assign
  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudentIds);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudentIds(newSelection);
  };

  // Toggle all students selection
  const toggleAllStudents = () => {
    if (selectedStudentIds.size === searchedStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(searchedStudents.map(s => s.id)));
    }
  };

  // Toggle assignment selection for bulk remove
  const toggleAssignmentSelection = (assignmentId: string) => {
    const newSelection = new Set(selectedAssignmentIds);
    if (newSelection.has(assignmentId)) {
      newSelection.delete(assignmentId);
    } else {
      newSelection.add(assignmentId);
    }
    setSelectedAssignmentIds(newSelection);
  };

  const toggleAllAssignments = () => {
    if (selectedAssignmentIds.size === filteredAssignments.length) {
      setSelectedAssignmentIds(new Set());
    } else {
      setSelectedAssignmentIds(new Set(filteredAssignments.map(a => a.id)));
    }
  };

  // Reset selections when teacher changes
  useEffect(() => {
    setSelectedStudentIds(new Set());
    setSearchTerm('');
  }, [selectedTeacher]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Teacher-Student Assignments</h2>
          <p className="text-gray-400 text-sm">Assign students to teachers and manage assignments</p>
        </div>
        {isBulkMode ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsBulkMode(false);
                setSelectedAssignmentIds(new Set());
              }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkRemove}
              disabled={selectedAssignmentIds.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Remove ({selectedAssignmentIds.size})
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsBulkMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            Bulk Remove
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-violet-400" />
            <h3 className="text-gray-400 text-sm">Total Teachers</h3>
          </div>
          <p className="text-3xl font-bold text-white">{teachers.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-blue-400" />
            <h3 className="text-gray-400 text-sm">Total Assignments</h3>
          </div>
          <p className="text-3xl font-bold text-white">{assignments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-gray-400 text-sm">Students Assigned</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {new Set(assignments.map(a => a.studentId)).size}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-5 h-5 text-orange-400" />
            <h3 className="text-gray-400 text-sm">Available Students</h3>
          </div>
          <p className="text-3xl font-bold text-white">{allStudents.length}</p>
        </div>
      </div>

      {/* Bulk Assign Section */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-violet-400" />
          Bulk Assign Students to Teacher
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Teacher Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Select Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Choose a teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          {/* Right Column - Search */}
          {selectedTeacher && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">Search Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Student List for Bulk Assign */}
        {selectedTeacher && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAllStudents}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {selectedStudentIds.size === searchedStudents.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedStudentIds.size === searchedStudents.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-gray-500 text-sm">
                  {selectedStudentIds.size} / {searchedStudents.length} selected
                </span>
              </div>
              <button
                onClick={handleBulkAssign}
                disabled={selectedStudentIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-4 h-4" />
                Assign Selected ({selectedStudentIds.size})
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 border border-white/10 rounded-lg p-2">
              {searchedStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm 
                    ? 'No students match your search'
                    : 'All students are already assigned to this teacher'}
                </p>
              ) : (
                searchedStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                      selectedStudentIds.has(student.id)
                        ? 'bg-green-600/30 border border-green-500 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs opacity-75">ID: {student.studentId}</p>
                    </div>
                    {selectedStudentIds.has(student.id) && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter by Teacher */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filter by teacher:</span>
            <select
              value={filterTeacherId}
              onChange={(e) => setFilterTeacherId(e.target.value)}
              className="bg-black/50 border border-white/20 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">All Teachers</option>
              {teachers.map((teacher) => {
                const assignmentCount = assignments.filter(a => a.teacherId === teacher.id).length;
                return (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({assignmentCount} students)
                  </option>
                );
              })}
            </select>
          </div>
          {filterTeacherId && (
            <button
              onClick={() => setFilterTeacherId('')}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h3 className="text-white font-medium">
            {filterTeacherId 
              ? `Students assigned to ${getTeacherName(filterTeacherId)}`
              : 'All Assignments'} ({filteredAssignments.length})
          </h3>
          {isBulkMode && filteredAssignments.length > 0 && (
            <button
              onClick={toggleAllAssignments}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              {selectedAssignmentIds.size === filteredAssignments.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedAssignmentIds.size === filteredAssignments.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto">
          {filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {filterTeacherId 
                ? 'No students assigned to this teacher yet.'
                : 'No assignments found. Use the section above to assign students.'}
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const teacher = teachers.find(t => t.id === assignment.teacherId);
              const isSelected = selectedAssignmentIds.has(assignment.id);
              
              return (
                <div 
                  key={assignment.id} 
                  className={`p-4 flex items-center justify-between hover:bg-white/5 transition-colors ${
                    isSelected ? 'bg-red-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isBulkMode && (
                      <button
                        onClick={() => toggleAssignmentSelection(assignment.id)}
                        className="focus:outline-none"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-red-400" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {assignment.student?.user?.firstName} {assignment.student?.user?.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Student ID: {assignment.student?.studentId}
                      </p>
                      {!filterTeacherId && (
                        <p className="text-gray-500 text-xs mt-1">
                          Assigned to: {teacher?.name || 'Unknown Teacher'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'verified' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {assignment.status === 'verified' ? 'Verified' : 'Pending'}
                    </div>
                    {!isBulkMode && (
                      <button
                        onClick={() => onRemove && onRemove([assignment.id])}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remove assignment"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}