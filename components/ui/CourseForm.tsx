'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Star, CheckCircle, X, Edit2, Save, XCircle } from 'lucide-react';
import { CREDIT_OPTIONS } from '@/lib/constants';

interface CourseFormData {
  id?: string;
  courseName: string;
  credits: number;
}

interface CourseFormProps {
  onSubmit: (courses: Omit<CourseFormData, 'id'>[]) => Promise<void>;
  existingCourses?: CourseFormData[];
  isLoading?: boolean;
  onDeleteCourse?: (courseId: string) => Promise<void>;
  onUpdateCourse?: (courseId: string, data: Partial<CourseFormData>) => Promise<void>;
}

export default function CourseForm({ 
  onSubmit, 
  existingCourses = [], 
  isLoading = false,
  onDeleteCourse,
  onUpdateCourse 
}: CourseFormProps) {
  const [courses, setCourses] = useState<CourseFormData[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<CourseFormData | null>(null);

  const addCourse = () => {
    setCourses([...courses, { courseName: '', credits: 3 }]);
  };

  const updateCourse = (index: number, field: keyof CourseFormData, value: any) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const validCourses = courses.filter(c => c.courseName.trim() !== '');
    if (validCourses.length === 0) {
      alert('Please add at least one course with a name');
      return;
    }

    try {
      await onSubmit(validCourses);
      setCourses([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit courses. Please try again.');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (confirm('Are you sure you want to remove this course?')) {
      try {
        await onDeleteCourse?.(courseId);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete course.');
      }
    }
  };

  const handleEditStart = (course: CourseFormData) => {
    setEditingCourseId(course.id!);
    setEditFormData({ ...course });
  };

  const handleEditCancel = () => {
    setEditingCourseId(null);
    setEditFormData(null);
  };

  const handleEditSave = async () => {
    if (editFormData && editFormData.courseName.trim()) {
      try {
        await onUpdateCourse?.(editFormData.id!, {
          courseName: editFormData.courseName,
          credits: editFormData.credits
        });
        setEditingCourseId(null);
        setEditFormData(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Update error:', error);
        alert('Failed to update course.');
      }
    }
  };

  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Operation completed successfully!
        </div>
      )}

      {/* Currently Enrolled Courses Section */}
      {existingCourses.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <span>?? Your Enrolled Courses</span>
            <span className="text-sm text-gray-400">({existingCourses.length} courses)</span>
          </h3>
          <div className="grid gap-2 max-h-96 overflow-y-auto">
            {existingCourses.map((course, idx) => (
              <div
                key={course.id || idx}
                className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-4"
              >
                {editingCourseId === course.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editFormData?.courseName || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev!, courseName: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      placeholder="Course name"
                    />
                    <div className="flex gap-3">
                      <select
                        value={editFormData?.credits || 3}
                        onChange={(e) => setEditFormData(prev => ({ ...prev!, credits: parseInt(e.target.value) }))}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      >
                        {CREDIT_OPTIONS.map((credit) => (
                          <option key={credit} value={credit}>{credit} Credit{credit !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleEditSave} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Save</button>
                      <button onClick={handleEditCancel} className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-violet-400 font-bold">#{idx + 1}</span>
                      <p className="text-white font-medium">{course.courseName}</p>
                      <span className="text-gray-400 text-sm">
                        {course.credits} credit{course.credits !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStart(course)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Edit course"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id!)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remove course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Course Section */}
      <div className="border-t border-white/10 pt-6">
        <button
          onClick={addCourse}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add New Course
        </button>
      </div>

      {/* New Course Input Rows */}
      {courses.length > 0 && (
        <>
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-lg">?? New Courses to Add</h3>
            {courses.map((course, index) => (
              <div
                key={index}
                className="bg-violet-500/10 backdrop-blur-lg border border-violet-500/30 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Course Name"
                    value={course.courseName}
                    onChange={(e) => updateCourse(index, 'courseName', e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                  <select
                    value={course.credits}
                    onChange={(e) => updateCourse(index, 'credits', parseInt(e.target.value))}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    {CREDIT_OPTIONS.map((credit) => (
                      <option key={credit} value={credit}>{credit} Credit{credit !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <button onClick={() => removeCourse(index)} className="p-2 text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
            <span className="text-gray-300">Total Credits: <span className="text-white font-bold">{totalCredits}</span></span>
            <button onClick={handleSubmit} disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg">
              {isLoading ? 'Submitting...' : 'Submit Courses'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}