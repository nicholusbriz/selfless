'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Award, BookOpen, ArrowLeft, Calendar, Hash } from 'lucide-react';
import axios from '@/lib/axios';
import LoadingState from '@/components/shared/LoadingState';
import ErrorState from '@/components/shared/ErrorState';

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
  studentProfile: {
    id: string;
    studentId?: string;
    currentGPA?: number;
    takesReligion?: boolean;
    tuition?: number;
    enrolledCourses: Array<{
      id: string;
      courseName: string;
      credits: number;
      grades: Array<{
        id: string;
        score: number;
        letterGrade: string;
      }>;
    }>;
    grades: Array<{
      id: string;
      score: number;
      letterGrade: string;
      course: {
        courseName: string;
      };
    }>;
  };
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/students/${params.id}`);
        setStudent(response.data.student);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load student profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!student) return <ErrorState message="Student not found" />;

  const profile = student.studentProfile;
  const totalCredits = profile.enrolledCourses.reduce((sum, course) => sum + course.credits, 0);
  const totalCourses = profile.enrolledCourses.length;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header with Back Button */}
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>
      </motion.div>

      {/* Header Section */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="text-2xl sm:text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Student Profile
        </motion.h1>
        <motion.p 
          className="text-gray-300 text-sm sm:text-base"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          View student information and academic progress
        </motion.p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
              {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
            </div>
          </motion.div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.h2 
              className="text-xl sm:text-2xl font-bold text-white mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {student.firstName} {student.lastName}
            </motion.h2>
            <motion.p 
              className="text-gray-400 text-sm sm:text-base mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {student.email}
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-2 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                {student.role || 'Student'}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                Active
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* User Details */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-400" />
          Student Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {[
            { icon: User, label: "Full Name", value: `${student.firstName} ${student.lastName}` },
            { icon: Mail, label: "Email Address", value: student.email },
            { icon: Hash, label: "Student ID", value: profile.studentId || 'N/A' },
            { icon: Shield, label: "Role", value: student.role || 'Student' }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: "rgba(168, 85, 247, 0.3)" }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <item.icon className="w-4 h-4 text-purple-400" />
                <label className="text-gray-400 text-sm">{item.label}</label>
              </div>
              <p className="text-white font-medium">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Academic Stats */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
          <Award className="w-5 h-5 mr-2 text-purple-400" />
          Academic Information
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { label: "Current GPA", value: profile.currentGPA?.toFixed(2) || 'N/A', icon: Award },
            { label: "Total Credits", value: totalCredits, icon: BookOpen },
            { label: "Enrolled Courses", value: totalCourses, icon: BookOpen }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 + index * 0.1 }}
            >
              <item.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-gray-400 text-sm">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Enrolled Courses */}
      {profile.enrolledCourses.length > 0 && (
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
            Enrolled Courses
          </h3>
          <div className="space-y-3">
            {profile.enrolledCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.5 + index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{course.courseName}</p>
                    <p className="text-gray-400 text-sm">{course.credits} credits</p>
                  </div>
                  {course.grades.length > 0 && (
                    <div className="text-right">
                      <p className="text-purple-400 font-bold">{course.grades[0].letterGrade}</p>
                      <p className="text-gray-400 text-sm">{course.grades[0].score}%</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
