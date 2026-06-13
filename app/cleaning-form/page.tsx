'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User as UserType, CleaningDay, Weeks, UserRegistration, UserWithAttendance } from '@/types';
import { checkUserAccess, User } from '@/lib/auth';
import { PageLoader, LoadingButton } from '@/components/ui';
import { API_ENDPOINTS } from '@/config/constants';

export default function FormPage() {
  const [user, setUser] = useState<User | null>(null);
  const [weeks, setWeeks] = useState<Weeks>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([]);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ student: UserWithAttendance, day: CleaningDay }>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState<string | null>(null);
  const router = useRouter();

  // Get all registered students from all days
  const getAllRegisteredStudents = useCallback(() => {
    const allStudents: Array<{ student: UserWithAttendance, day: CleaningDay }> = [];
    Object.entries(weeks).forEach(([weekNum, weekDays]) => {
      weekDays.forEach((day: CleaningDay) => {
        if (day.registeredUsers) {
          day.registeredUsers.forEach((student: UserWithAttendance) => {
            allStudents.push({ student, day });
          });
        }
      });
    });
    return allStudents;
  }, [weeks]);

  // Check if user has valid authentication from JWT token
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const authResult = await checkUserAccess();

        if (authResult.success && authResult.user) {
          setUser(authResult.user);
          setIsRegistered(authResult.user.isRegistered || false);
          // Convert auth registrations to UserRegistration format
          const convertedRegistrations: UserRegistration[] = (authResult.user.registrations || []).map(reg => ({
            ...reg,
            dayName: '', // Will be filled from API data
            registeredCount: 1,
            maxSlots: 5
          }));
          setUserRegistrations(convertedRegistrations);

          // If user is already registered, show their registration status
          // (don't redirect - let them see they've already registered)
        } else {
          // User not found, redirect to home
          router.push('/');
        }
      } catch {
        router.push('/');
      } finally {
        setCheckingStatus(false);
      }
    };

    authenticateUser();
  }, [router]);

  // Fetch cleaning days
  useEffect(() => {
    const fetchCleaningDays = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CLEANING_FORM);
        const data = await response.json();

        if (data.success) {
          setWeeks(data.weeks);
        }
      } catch {
        // Error fetching cleaning days - will show in UI
      }
    };

    // Only fetch if user is authenticated
    if (user && user.id) {
      fetchCleaningDays();
    }
  }, [user]);

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results: Array<{ student: UserWithAttendance, day: CleaningDay }> = [];

    // Search through all weeks and days
    Object.entries(weeks).forEach(([weekNum, weekDays]) => {
      weekDays.forEach((day: CleaningDay) => {
        if (day.registeredUsers) {
          day.registeredUsers.forEach((student: UserWithAttendance) => {
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            const email = student.email?.toLowerCase() || '';
            const searchLower = query.toLowerCase();

            if (fullName.includes(searchLower) || email.includes(searchLower)) {
              results.push({ student, day });
            }
          });
        }
      });
    });

    setSearchResults(results);
    setShowSearchResults(true);
  }, [weeks]);


  // Check if user can mark attendance
  const canMarkAttendance = (): boolean => {
    return !!(user && (user.isAdmin || user.isSuperAdmin || user.isTutor));
  };

  // Handle attendance marking
  const handleMarkAttendance = useCallback(async (student: UserWithAttendance, status: 'attended' | 'no-show') => {
    if (!canMarkAttendance()) {
      setMessage('Only admins, tutors, and super admins can mark attendance.');
      setMessageType('error');
      return;
    }

    setAttendanceLoading(student.registrationId);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: student.registrationId,
          attendanceStatus: status,
          userId: student.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully marked ${student.firstName} ${student.lastName} as ${status}.`);
        setMessageType('success');

        // Refresh the data to show updated attendance
        const cleaningFormResponse = await fetch(API_ENDPOINTS.CLEANING_FORM);
        const cleaningFormData = await cleaningFormResponse.json();
        if (cleaningFormData.success) {
          setWeeks(cleaningFormData.weeks);
        }
      } else {
        setMessage(data.message || 'Failed to mark attendance');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setAttendanceLoading(null);
    }
  }, [canMarkAttendance]);

  // Handle clearing attendance status
  const handleClearAttendance = useCallback(async (student: UserWithAttendance) => {
    if (!canMarkAttendance()) {
      setMessage('Only admins, tutors, and super admins can clear attendance.');
      setMessageType('error');
      return;
    }

    setAttendanceLoading(student.registrationId);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId: student.registrationId,
          attendanceStatus: 'pending',
          userId: student.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully cleared attendance for ${student.firstName} ${student.lastName}.`);
        setMessageType('success');

        // Refresh data to show updated attendance
        const cleaningFormResponse = await fetch(API_ENDPOINTS.CLEANING_FORM);
        const cleaningFormData = await cleaningFormResponse.json();
        if (cleaningFormData.success) {
          setWeeks(cleaningFormData.weeks);
        }
      } else {
        setMessage(data.message || 'Failed to clear attendance');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setAttendanceLoading(null);
    }
  }, [canMarkAttendance]);


  if (!user || checkingStatus) {
    return (
      <div className="min-h-screen bg-cloud-500 flex items-center justify-center">
        <PageLoader text="Loading your registration..." color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cloud-500 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sage-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(44, 44, 44, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(44, 44, 44, 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-terracotta-400 rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-700">Cleaning Day Registration</h1>
                <p className="text-sm text-charcoal-600">Freedom City Tech Center</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-cloud-500 backdrop-blur-md hover:bg-cloud-400 text-charcoal-700 border border-sandstone-400 hover:border-terracotta-400 rounded-lg transition-all duration-300"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        {/* User Status Card */}
        <div className="mb-6">
          <div className="bg-cloud-500 backdrop-blur-md rounded-2xl p-4 border border-sandstone-400 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-terracotta-400 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="text-charcoal-700 font-medium">Welcome, {user.firstName}!</p>
                  <p className="text-charcoal-600 text-sm">{user.email}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isRegistered
                ? 'bg-sage-400/20 text-sage-400 border border-sage-400'
                : 'bg-terracotta-400/20 text-terracotta-400 border border-terracotta-400'
                }`}>
                {isRegistered ? '✓ Registered' : 'Available'}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-cloud-500 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-xl p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a student by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-cloud-400 backdrop-blur-md border border-sandstone-400 rounded-xl text-charcoal-700 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 transition-all"
              />
              <div className="absolute left-4 top-3.5 text-charcoal-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-4 top-3.5 text-charcoal-500 hover:text-terracotta-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-charcoal-600 text-sm font-medium">
                    Found {searchResults.length} student{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => handleSearch('')}
                    className="text-xs text-charcoal-600 hover:text-terracotta-400 transition-colors"
                  >
                    Clear search
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="group bg-cloud-400 backdrop-blur-md rounded-xl p-3 
                               hover:bg-cloud-300 transition-all duration-300 
                               border border-sandstone-400 hover:border-terracotta-400
                               hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-terracotta-400 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {result.student.firstName?.charAt(0)}{result.student.lastName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-charcoal-700 font-semibold text-sm truncate">
                            {result.student.firstName} {result.student.lastName}
                          </p>
                          <p className="text-charcoal-600 text-xs truncate">
                            {result.student.email || 'No email'}
                          </p>
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                              ${result.student.attendanceStatus === 'attended'
                                ? 'bg-sage-400/20 text-sage-400 border border-sage-400'
                                : result.student.attendanceStatus === 'no-show'
                                  ? 'bg-red-400/20 text-red-400 border border-red-400'
                                  : 'bg-terracotta-400/20 text-terracotta-400 border border-terracotta-400'
                              }`}>
                              {result.student.attendanceStatus === 'attended' ? '✓ Attended' :
                               result.student.attendanceStatus === 'no-show' ? '✗ No Show' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-charcoal-700 text-sm font-medium">{result.day.dayName}</p>
                          <p className="text-charcoal-600 text-xs">
                            {new Date(result.day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && (
              <div className="mt-4 text-center py-4">
                <p className="text-charcoal-600 text-sm mb-3">No students found matching "{searchQuery}"</p>
                <button
                  onClick={() => handleSearch('')}
                  className="px-4 py-2 bg-terracotta-400/10 backdrop-blur-md hover:bg-terracotta-400/20 text-terracotta-400 rounded-lg text-sm transition-all duration-300 border border-terracotta-400/20"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-md ${messageType === 'success' 
            ? 'bg-sage-400/20 border border-sage-400 text-sage-400' 
            : 'bg-red-400/20 border border-red-400 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* Already Registered Display */}
        {isRegistered && userRegistrations.length > 0 && (
          <div className="flex-1">
            <div className="bg-sage-400/10 border border-sage-400 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-sage-400/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-sage-400">Registration Confirmed</h3>
                  <p className="text-charcoal-600 text-sm">You have registered for a cleaning day</p>
                </div>
              </div>
              {userRegistrations.map((registration, index) => (
                <div key={index} className="bg-sage-400/10 rounded-xl p-4 border border-sage-400/20">
                  <p className="text-charcoal-700 font-semibold">{registration.dayName}</p>
                  <p className="text-charcoal-600 text-sm">{registration.formattedDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Registered Students Card Grid - Grouped by Date */}
        <div className="flex-1">
          <div className="bg-cloud-500 backdrop-blur-md rounded-2xl border border-sandstone-400 shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-charcoal-700">Cleaning Day Schedule</h2>
                <p className="text-charcoal-600 text-sm mt-1">All registered students by date</p>
              </div>
              {canMarkAttendance() && (
                <div className="px-3 py-1.5 bg-terracotta-400/20 rounded-lg border border-terracotta-400">
                  <p className="text-xs text-terracotta-400 font-medium">Admin Access Enabled</p>
                </div>
              )}
            </div>

            {showSearchResults ? (
              /* Show Search Results - Grouped by Date */
              <div className="space-y-4">
                {Object.entries(
                  searchResults.reduce((acc, result) => {
                    const dateKey = String(result.day.date);
                    if (!acc[dateKey]) {
                      acc[dateKey] = { day: result.day, students: [] };
                    }
                    acc[dateKey].students.push(result.student);
                    return acc;
                  }, {} as Record<string, { day: CleaningDay; students: UserWithAttendance[] }>)
                ).map(([dateKey, { day, students }]) => (
                  <DateCard
                    key={dateKey}
                    day={day}
                    students={students}
                    canMarkAttendance={canMarkAttendance()}
                    attendanceLoading={attendanceLoading}
                    onMarkAttendance={handleMarkAttendance}
                    onClearAttendance={handleClearAttendance}
                  />
                ))}
              </div>
            ) : (
              /* Show All Registered Students - Grouped by Date */
              <div className="space-y-4">
                {Object.entries(
                  getAllRegisteredStudents().reduce((acc, result) => {
                    const dateKey = String(result.day.date);
                    if (!acc[dateKey]) {
                      acc[dateKey] = { day: result.day, students: [] };
                    }
                    acc[dateKey].students.push(result.student);
                    return acc;
                  }, {} as Record<string, { day: CleaningDay; students: UserWithAttendance[] }>)
                ).map(([dateKey, { day, students }]) => (
                  <DateCard
                    key={dateKey}
                    day={day}
                    students={students}
                    canMarkAttendance={canMarkAttendance()}
                    attendanceLoading={attendanceLoading}
                    onMarkAttendance={handleMarkAttendance}
                    onClearAttendance={handleClearAttendance}
                  />
                ))}
              </div>
            )}

            {getAllRegisteredStudents().length === 0 && !showSearchResults && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-cloud-400 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-sandstone-400">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-charcoal-600">No students registered yet</p>
                <p className="text-charcoal-500 text-sm mt-2">Students will appear here once they register</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Date Card Component - Groups students by date
interface DateCardProps {
  day: CleaningDay;
  students: UserWithAttendance[];
  canMarkAttendance: boolean;
  attendanceLoading: string | null;
  onMarkAttendance: (student: UserWithAttendance, status: 'attended' | 'no-show') => void;
  onClearAttendance: (student: UserWithAttendance) => void;
}

function DateCard({ day, students, canMarkAttendance, attendanceLoading, onMarkAttendance, onClearAttendance }: DateCardProps) {
  const attendedCount = students.filter(s => s.attendanceStatus === 'attended').length;
  const noShowCount = students.filter(s => s.attendanceStatus === 'no-show').length;
  const pendingCount = students.filter(s => s.attendanceStatus === 'pending').length;

  return (
    <div className="group relative bg-cloud-400 backdrop-blur-md rounded-2xl border border-sandstone-400 hover:border-terracotta-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className="p-6">
        {/* Date Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-charcoal-700">{day.dayName}</h3>
            <p className="text-charcoal-600 text-sm">
              {new Date(day.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-terracotta-400">{students.length}</div>
            <div className="text-charcoal-600 text-xs">Registered</div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-sage-400/20 rounded-lg p-2 text-center border border-sage-400">
            <div className="text-lg font-bold text-sage-400">{attendedCount}</div>
            <div className="text-xs text-charcoal-600">Attended</div>
          </div>
          <div className="flex-1 bg-terracotta-400/20 rounded-lg p-2 text-center border border-terracotta-400">
            <div className="text-lg font-bold text-terracotta-400">{pendingCount}</div>
            <div className="text-xs text-charcoal-600">Pending</div>
          </div>
          <div className="flex-1 bg-red-400/20 rounded-lg p-2 text-center border border-red-400">
            <div className="text-lg font-bold text-red-400">{noShowCount}</div>
            <div className="text-xs text-charcoal-600">No Show</div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-2">
          {students.map((student) => (
            <div 
              key={student.id}
              className="flex items-center justify-between p-3 bg-cloud-500 rounded-lg border border-sandstone-400 hover:border-terracotta-400 transition-all"
            >
              <p className="text-charcoal-700 font-medium text-sm">{student.firstName} {student.lastName}</p>
              
              <div className="flex items-center gap-2">
                {/* Status Badge */}
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  student.attendanceStatus === 'attended'
                    ? 'bg-sage-400/20 text-sage-400 border border-sage-400'
                    : student.attendanceStatus === 'no-show'
                      ? 'bg-red-400/20 text-red-400 border border-red-400'
                      : 'bg-terracotta-400/20 text-terracotta-400 border border-terracotta-400'
                }`}>
                  {student.attendanceStatus === 'attended' ? '✓' :
                   student.attendanceStatus === 'no-show' ? '✗' : '⏳'}
                </span>

                {/* Admin Actions */}
                {canMarkAttendance && (
                  <div className="flex gap-1">
                    {student.attendanceStatus === 'pending' ? (
                      <>
                        <button
                          onClick={() => onMarkAttendance(student, 'attended')}
                          disabled={attendanceLoading === student.registrationId}
                          className="p-1.5 bg-sage-400/20 hover:bg-sage-400/30 text-sage-400 border border-sage-400 rounded-lg transition-all hover:scale-105"
                          title="Mark as Attended"
                        >
                          {attendanceLoading === student.registrationId ? (
                            <div className="w-3 h-3 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => onMarkAttendance(student, 'no-show')}
                          disabled={attendanceLoading === student.registrationId}
                          className="p-1.5 bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400 rounded-lg transition-all hover:scale-105"
                          title="Mark as No Show"
                        >
                          {attendanceLoading === student.registrationId ? (
                            <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onClearAttendance(student)}
                        disabled={attendanceLoading === student.registrationId}
                        className="p-1.5 bg-terracotta-400/20 hover:bg-terracotta-400/30 text-terracotta-400 border border-terracotta-400 rounded-lg transition-all hover:scale-105"
                        title="Clear Status"
                      >
                        {attendanceLoading === student.registrationId ? (
                          <div className="w-3 h-3 border-2 border-terracotta-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-terracotta-400/0 via-terracotta-400/5 to-terracotta-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
}