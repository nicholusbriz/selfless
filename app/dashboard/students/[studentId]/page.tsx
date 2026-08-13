// app/dashboard/students/[studentId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, MapPin, Calendar, Book, CheckCircle, XCircle, Clock, Phone, Globe, Link as LinkIcon, Map, GitFork, Copy, User as UserIcon } from 'lucide-react';

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  profileImage: string | null;
  role: string;
  studentId: string;
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    };
  } | null;
  country: string | null;
  city: string | null;
  town: string | null;
  street: string | null;
  generalCourse: string | null;
  takesReligion: boolean | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  projectUrls: string[];
  gender: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
  isActive: boolean;
  lastLoginAt: string | null;
  studentCourses: Array<{
    id: string;
    code: string;
    courseUnit: string;
    credits: number;
    status: string;
  }>;
}

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/students/${params.studentId}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        const data = await response.json();
        setStudent(data.student);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch student profile');
      } finally {
        setLoading(false);
      }
    };

    if (params.studentId) {
      fetchStudent();
    }
  }, [params.studentId]);

  const getInitials = () => {
    if (!student) return '??';
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = () => {
    if (!student) return 'from-[#E8A33D] to-[#C97F1F]';
    const colors = [
      'from-[#E8A33D] to-[#C97F1F]',
      'from-[#14B8A6] to-[#0D9488]',
      'from-[#FB7185] to-[#E11D48]',
      'from-[#6366F1] to-[#4F46E5]',
      'from-[#34D399] to-[#059669]',
    ];
    const hash = student.firstName.charCodeAt(0) + student.lastName.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#2A2438]/50 animate-pulse" />
          <div className="h-8 w-px bg-[#2A2438]" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2A2438]/50 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-[#2A2438]/50 rounded animate-pulse" />
              <div className="h-4 w-48 bg-[#2A2438]/30 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Profile Card Skeleton */}
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6 md:p-8">
          {/* Profile Header Skeleton */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Profile Image Skeleton */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#2A2438]/50 animate-pulse" />
            </div>

            {/* Profile Info Skeleton */}
            <div className="flex-grow space-y-4">
              <div className="h-8 w-64 bg-[#2A2438]/50 rounded animate-pulse" />
              <div className="h-4 w-32 bg-[#2A2438]/30 rounded animate-pulse" />
              <div className="h-6 w-24 bg-[#2A2438]/30 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
                <div className="h-4 w-20 bg-[#2A2438]/30 rounded animate-pulse mb-2" />
                <div className="h-6 w-24 bg-[#2A2438]/50 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Additional Info Skeleton */}
          <div className="space-y-6">
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="h-4 w-24 bg-[#2A2438]/30 rounded animate-pulse mb-2" />
              <div className="h-5 w-48 bg-[#2A2438]/50 rounded animate-pulse" />
            </div>
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="h-4 w-24 bg-[#2A2438]/30 rounded animate-pulse mb-3" />
              <div className="flex gap-3">
                <div className="h-8 w-24 bg-[#2A2438]/30 rounded-lg animate-pulse" />
                <div className="h-8 w-24 bg-[#2A2438]/30 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8">
          <p className="text-[#FB7185]">{error || 'Student not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <User className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              Student Profile
            </h1>
            <p className="text-sm text-[#A79C8C]">View student information and academic progress</p>
          </div>
        </div>
      </div>

      {/* Profile Card with Cover Image */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden">
        {/* Cover Image */}
        <div 
          className="h-48 md:h-64 relative bg-cover bg-center"
          style={{
            backgroundImage: student.profileImage 
              ? `url(${student.profileImage})` 
              : 'linear-gradient(to bottom right, rgba(232, 163, 61, 0.3), rgba(201, 127, 31, 0.2), rgba(42, 36, 56, 1))'
          }}
        >
          {student.profileImage && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#150F20]/50 to-[#150F20]" />
          )}
        </div>

        {/* Profile Content */}
        <div className="px-6 md:px-8 pb-8">
          {/* Profile Header - Overlapping Cover */}
          <div className="relative -mt-20 md:-mt-24 mb-6">
            <div className="flex flex-col md:flex-row gap-6 items-end md:items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-[#150F20] shadow-2xl bg-[#0B0912]">
                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getAvatarColor()} flex items-center justify-center`}>
                      <span className="text-4xl md:text-5xl font-bold text-[#0B0912]">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-grow pt-2 md:pt-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#F5F0E8] mb-2">
                      {student.firstName} {student.lastName}
                    </h2>
                    <div className="flex items-center gap-2 text-[#A79C8C] mb-3">
                      <MapPin className="w-4 h-4" />
                      {student.techCenter ? (
                        <span className="text-sm">
                          {student.techCenter.name}, {student.techCenter.country?.name}
                        </span>
                      ) : (
                        <span className="text-sm">No tech center assigned</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="inline-block px-3 py-1 bg-[#2A2438] rounded-full">
                        <span className="text-sm text-[#A79C8C] capitalize">{student.role}</span>
                      </div>
                      {student.isActive ? (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#2FA88A]/10 border border-[#2FA88A]/30 rounded-full">
                          <CheckCircle className="w-4 h-4 text-[#2FA88A]" />
                          <span className="text-sm text-[#2FA88A]">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#FB7185]/10 border border-[#FB7185]/30 rounded-full">
                          <XCircle className="w-4 h-4 text-[#FB7185]" />
                          <span className="text-sm text-[#FB7185]">Inactive</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="flex items-center gap-2 text-[#6B6358] mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Joined</span>
              </div>
              <p className="text-lg font-semibold text-[#F5F0E8]">
                {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="flex items-center gap-2 text-[#6B6358] mb-2">
                <User className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Student ID</span>
              </div>
              <p className="text-lg font-semibold text-[#F5F0E8]">
                {student.studentId.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                Contact Information
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">Phone Number</p>
                    <p className="text-sm text-[#F5F0E8]">{student.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                Location
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">Country</p>
                    <p className="text-sm text-[#F5F0E8]">{student.country || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Map className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">City</p>
                    <p className="text-sm text-[#F5F0E8]">{student.city || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">Town</p>
                    <p className="text-sm text-[#F5F0E8]">{student.town || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">Street</p>
                    <p className="text-sm text-[#F5F0E8]">{student.street || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                Academic Information
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Book className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">General Course</p>
                    <p className="text-sm text-[#F5F0E8]">{student.generalCourse || 'Not provided'}</p>
                  </div>
                </div>
                
                {/* Religion Status */}
                {student.takesReligion !== null && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-[#6B6358]" />
                    <div>
                      <p className="text-xs text-[#6B6358]">Religion Status</p>
                      {student.takesReligion ? (
                        <span className="px-2 py-1 bg-[#14B8A6]/20 border border-[#14B8A6]/30 rounded-full text-xs text-[#14B8A6]">
                          Takes Religion
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-[#FB7185]/20 border border-[#FB7185]/30 rounded-full text-xs text-[#FB7185]">
                          No Religion
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                Personal Information
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">Gender</p>
                    <p className="text-sm text-[#F5F0E8] capitalize">{student.gender || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Units */}
            {student.studentCourses && student.studentCourses.length > 0 && (
              <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
                <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                  Course Units ({student.studentCourses.length})
                </div>
                <div className="space-y-2">
                  {student.studentCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-3 p-2 bg-[#2A2438]/50 rounded-lg">
                      <span className="px-2 py-1 bg-[#E8A33D]/20 border border-[#E8A33D]/30 rounded-full text-xs text-[#E8A33D] font-medium">
                        {course.code}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-[#F5F0E8]">{course.courseUnit}</p>
                        <p className="text-xs text-[#6B6358]">{course.credits} credits</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-[#2A2438] flex items-center justify-between">
                    <span className="text-xs text-[#6B6358]">Total Credits:</span>
                    <span className="text-lg font-bold text-[#E8A33D]">
                      {student.studentCourses.reduce((sum, course) => sum + course.credits, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                Social Links
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-[#0077B5]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6B6358]">LinkedIn</p>
                    {student.linkedinUrl ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-[#F5F0E8] truncate max-w-[200px] md:max-w-[300px]">{student.linkedinUrl}</p>
                        <button
                          onClick={() => student.linkedinUrl && copyToClipboard(student.linkedinUrl)}
                          className="p-1.5 rounded hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-colors flex-shrink-0"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B6358]">Not provided</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GitFork className="w-4 h-4 text-[#F5F0E8]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">GitHub</p>
                    {student.githubUrl ? (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-[#F5F0E8] truncate max-w-[200px] md:max-w-[300px]">{student.githubUrl}</p>
                        <button
                          onClick={() => student.githubUrl && copyToClipboard(student.githubUrl)}
                          className="p-1.5 rounded hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-colors flex-shrink-0"
                          title="Copy link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B6358]">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Project URLs */}
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                Project URLs
              </div>
              {student.projectUrls && student.projectUrls.length > 0 ? (
                <div className="space-y-2">
                  {student.projectUrls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-[#2A2438]/50 rounded-lg">
                      <LinkIcon className="w-4 h-4 text-[#E8A33D] flex-shrink-0" />
                      <span className="text-sm text-[#F5F0E8] truncate flex-1">{url}</span>
                      <button
                        onClick={() => url && copyToClipboard(url)}
                        className="p-1.5 rounded hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-colors flex-shrink-0"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6B6358]">No projects provided</p>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-[#0B0912] rounded-xl p-4 border border-[#2A2438]">
              <div className="text-xs uppercase tracking-wider text-[#6B6358] mb-4">
                Account Information
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">Profile Updated</p>
                    <p className="text-sm text-[#F5F0E8]">
                      {new Date(student.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#6B6358]" />
                  <div>
                    <p className="text-xs text-[#6B6358]">Status</p>
                    <p className="text-sm text-[#F5F0E8] capitalize">{student.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
