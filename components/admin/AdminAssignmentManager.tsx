'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  X, 
  Search, 
  Users, 
  User,
  ChevronRight,
  ArrowLeft,
  Plus,
  Minus,
  Filter,
  GraduationCap,
  Mail,
  Hash,
  AlertCircle
} from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  currentGPA?: number;
  takesReligion?: boolean;
}

interface Assignment {
  id: string;
  teacherId: string;
  studentId: string;
  status: string;
  teacher?: Teacher;
  student?: Student;
}

interface AdminAssignmentManagerProps {
  assignments: Assignment[];
  teachers: Teacher[];
  students: Student[];
  onAssign: (teacherId: string, studentIds: string[]) => void;
  onRemove: (assignmentIds: string[]) => void;
}

export default function AdminAssignmentManager({
  assignments,
  teachers,
  students,
  onAssign,
  onRemove
}: AdminAssignmentManagerProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState<Set<string>>(new Set());
  const [selectedAssignedStudents, setSelectedAssignedStudents] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Get the currently selected teacher
  const selectedTeacher = useMemo(() => 
    teachers.find(t => t.id === selectedTeacherId),
    [selectedTeacherId, teachers]
  );

  // Get students assigned to the selected teacher
  const assignedStudentIds = useMemo(() => {
    if (!selectedTeacherId) return new Set<string>();
    return new Set(
      assignments
        .filter(a => a.teacherId === selectedTeacherId)
        .map(a => a.studentId)
    );
  }, [selectedTeacherId, assignments]);

  // Get all students not assigned to any teacher (available)
  const assignedToAnyTeacher = useMemo(() => {
    return new Set(assignments.map(a => a.studentId));
  }, [assignments]);

  const availableStudents = useMemo(() => {
    return students.filter(s => !assignedToAnyTeacher.has(s.id));
  }, [students, assignedToAnyTeacher]);

  // Get assigned students with their details
  const assignedStudents = useMemo(() => {
    return students.filter(s => assignedStudentIds.has(s.id));
  }, [students, assignedStudentIds]);

  // Filter students based on search
  const filterStudents = (studentList: Student[]) => {
    if (!searchQuery.trim()) return studentList;
    const query = searchQuery.toLowerCase().trim();
    return studentList.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query)
    );
  };

  const filteredAvailable = filterStudents(availableStudents);
  const filteredAssigned = filterStudents(assignedStudents);

  // Toggle selection for available students
  const toggleAvailableStudent = (studentId: string) => {
    const newSet = new Set(selectedAvailableStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedAvailableStudents(newSet);
  };

  // Toggle selection for assigned students
  const toggleAssignedStudent = (studentId: string) => {
    const newSet = new Set(selectedAssignedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedAssignedStudents(newSet);
  };

  // Assign selected available students to the teacher
  const handleAssignSelected = () => {
    if (!selectedTeacherId || selectedAvailableStudents.size === 0) return;
    const studentIds = Array.from(selectedAvailableStudents);
    onAssign(selectedTeacherId, studentIds);
    setSelectedAvailableStudents(new Set());
  };

  // Remove selected assigned students from the teacher
  const handleRemoveSelected = () => {
    if (selectedAssignedStudents.size === 0) return;
    const assignmentIds = assignments
      .filter(a => selectedAssignedStudents.has(a.studentId) && a.teacherId === selectedTeacherId)
      .map(a => a.id);
    onRemove(assignmentIds);
    setSelectedAssignedStudents(new Set());
  };

  // Assign a single student (quick action)
  const handleQuickAssign = (studentId: string) => {
    if (!selectedTeacherId) return;
    onAssign(selectedTeacherId, [studentId]);
  };

  // Remove a single student (quick action)
  const handleQuickRemove = (studentId: string) => {
    const assignmentId = assignments.find(
      a => a.studentId === studentId && a.teacherId === selectedTeacherId
    )?.id;
    if (assignmentId) {
      onRemove([assignmentId]);
    }
  };

  // Select all available students
  const selectAllAvailable = () => {
    const allIds = filteredAvailable.map(s => s.id);
    setSelectedAvailableStudents(new Set(allIds));
  };

  // Deselect all available students
  const deselectAllAvailable = () => {
    setSelectedAvailableStudents(new Set());
  };

  // Select all assigned students
  const selectAllAssigned = () => {
    const allIds = filteredAssigned.map(s => s.id);
    setSelectedAssignedStudents(new Set(allIds));
  };

  // Deselect all assigned students
  const deselectAllAssigned = () => {
    setSelectedAssignedStudents(new Set());
  };

  // Get teacher card stats
  const getTeacherStats = (teacherId: string) => {
    const studentCount = assignments.filter(a => a.teacherId === teacherId).length;
    const verifiedCount = assignments.filter(
      a => a.teacherId === teacherId && a.status === 'verified'
    ).length;
    return { studentCount, verifiedCount };
  };

  // Reset selection when switching teachers
  const handleTeacherSelect = (teacherId: string) => {
    if (selectedTeacherId === teacherId) {
      setSelectedTeacherId(null);
    } else {
      setSelectedTeacherId(teacherId);
      setSelectedAvailableStudents(new Set());
      setSelectedAssignedStudents(new Set());
      setSearchQuery('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Assignment Management</h2>
            <p className="text-gray-400 text-sm">
              {selectedTeacher 
                ? `Managing assignments for ${selectedTeacher.name}` 
                : 'Select a tutor to manage their students'}
            </p>
          </div>
        </div>

        {!selectedTeacher && (
          <div className="flex items-center gap-2">
            <div className="bg-white/5 backdrop-blur-lg rounded-lg px-4 py-2 text-sm text-gray-300">
              <span className="text-purple-400 font-medium">{teachers.length}</span> Tutors •{' '}
              <span className="text-purple-400 font-medium">{students.length}</span> Students
            </div>
          </div>
        )}
      </div>

      {/* Teacher Cards Grid */}
      {!selectedTeacher ? (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tutors by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1 rounded-lg transition-colors ${
                  showFilters ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Teacher Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers
              .filter(t => {
                if (!searchQuery.trim()) return true;
                const query = searchQuery.toLowerCase().trim();
                return t.name.toLowerCase().includes(query) ||
                  t.email.toLowerCase().includes(query) ||
                  (t.role && t.role.toLowerCase().includes(query));
              })
              .map((teacher, index) => {
                const { studentCount, verifiedCount } = getTeacherStats(teacher.id);
                return (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTeacherSelect(teacher.id)}
                    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{teacher.name}</h3>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {teacher.email}
                          </p>
                        </div>
                      </div>
                      {teacher.role && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          teacher.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {teacher.role === 'admin' ? 'Admin' : 'Teacher'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-2xl font-bold text-white">{studentCount}</p>
                          <p className="text-gray-400 text-xs">Students</p>
                        </div>
                        {studentCount > 0 && (
                          <div>
                            <p className="text-2xl font-bold text-green-400">{verifiedCount}</p>
                            <p className="text-gray-400 text-xs">Verified</p>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </motion.div>
                );
              })}

            {teachers.filter(t => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase().trim();
              return t.name.toLowerCase().includes(query) ||
                t.email.toLowerCase().includes(query) ||
                (t.role && t.role.toLowerCase().includes(query));
            }).length === 0 && (
              <div className="col-span-full bg-white/5 backdrop-blur-lg rounded-xl p-12 text-center border border-white/10">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Tutors Found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Assignment View for Selected Teacher */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {/* Back Button & Teacher Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedTeacherId(null);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-white">{selectedTeacher?.name}</h3>
                  {selectedTeacher?.role && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedTeacher.role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {selectedTeacher.role === 'admin' ? 'Admin' : 'Teacher'}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">{selectedTeacher?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/5 backdrop-blur-lg rounded-lg px-4 py-2">
                <span className="text-gray-400 text-sm">Students: </span>
                <span className="text-white font-bold">{assignedStudents.length}</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Students */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Available Students</h4>
                  <p className="text-gray-400 text-sm">
                    {filteredAvailable.length} students available
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {filteredAvailable.length > 0 && (
                    <>
                      <button
                        onClick={selectedAvailableStudents.size === filteredAvailable.length 
                          ? deselectAllAvailable 
                          : selectAllAvailable}
                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {selectedAvailableStudents.size === filteredAvailable.length 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </button>
                      {selectedAvailableStudents.size > 0 && (
                        <button
                          onClick={handleAssignSelected}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                        >
                          <Plus className="w-3 h-3" />
                          Assign ({selectedAvailableStudents.size})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto p-4 space-y-2">
                {filteredAvailable.length > 0 ? (
                  filteredAvailable.map((student) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedAvailableStudents.has(student.id)
                          ? 'bg-purple-500/20 border-purple-500/50'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => toggleAvailableStudent(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedAvailableStudents.has(student.id)
                              ? 'bg-purple-500/30'
                              : 'bg-white/10'
                          }`}>
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.name}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {student.studentId}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAssign(student.id);
                          }}
                          className="p-1 hover:bg-purple-500/20 rounded-lg transition-colors text-purple-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No available students</p>
                    <p className="text-sm">All students are assigned to tutors</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Students */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Assigned Students</h4>
                  <p className="text-gray-400 text-sm">
                    {filteredAssigned.length} students assigned
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {filteredAssigned.length > 0 && (
                    <>
                      <button
                        onClick={selectedAssignedStudents.size === filteredAssigned.length 
                          ? deselectAllAssigned 
                          : selectAllAssigned}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        {selectedAssignedStudents.size === filteredAssigned.length 
                          ? 'Deselect All' 
                          : 'Select All'}
                      </button>
                      {selectedAssignedStudents.size > 0 && (
                        <button
                          onClick={handleRemoveSelected}
                          className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                        >
                          <Minus className="w-3 h-3" />
                          Remove ({selectedAssignedStudents.size})
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto p-4 space-y-2">
                {filteredAssigned.length > 0 ? (
                  filteredAssigned.map((student) => {
                    const assignment = assignments.find(
                      a => a.studentId === student.id && a.teacherId === selectedTeacherId
                    );
                    return (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedAssignedStudents.has(student.id)
                            ? 'bg-red-500/20 border-red-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => toggleAssignedStudent(student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedAssignedStudents.has(student.id)
                                ? 'bg-red-500/30'
                                : 'bg-white/10'
                            }`}>
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{student.name}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  {student.studentId}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {student.email}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {assignment?.status && (
                              <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                assignment.status === 'verified' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : assignment.status === 'not_verified'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {assignment.status === 'verified' && <CheckCircle className="w-3 h-3" />}
                                {assignment.status === 'not_verified' && <Clock className="w-3 h-3" />}
                                {assignment.status === 'rejected' && <X className="w-3 h-3" />}
                                {assignment.status.replace('_', ' ')}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickRemove(student.id);
                              }}
                              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No assigned students</p>
                    <p className="text-sm">Assign students from the left panel</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-white">{assignedStudents.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Available to Assign</p>
              <p className="text-2xl font-bold text-purple-400">{availableStudents.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Verified Students</p>
              <p className="text-2xl font-bold text-green-400">
                {assignments.filter(a => a.teacherId === selectedTeacherId && a.status === 'verified').length}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}