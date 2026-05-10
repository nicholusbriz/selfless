'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User as UserType, CleaningDay, Weeks, UserRegistration, UserWithAttendance } from '@/types';
import { checkUserAccess, User } from '@/lib/auth';
import { PageLoader, BackgroundImage, LoadingButton } from '@/components/ui';
import { API_ENDPOINTS } from '@/config/constants';

export default function FormPage() {
  const [user, setUser] = useState<User | null>(null);
  const [weeks, setWeeks] = useState<Weeks>({});
  const [selectedDay, setSelectedDay] = useState<CleaningDay | null>(null);
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

  // Fetch cleaning days and set selected day for registered users
  useEffect(() => {
    const fetchCleaningDays = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.CLEANING_FORM);
        const data = await response.json();

        if (data.success) {
          setWeeks(data.weeks);

          // If user is registered, set their current registered day as selected
          if (isRegistered && userRegistrations.length > 0) {
            const currentRegistration = userRegistrations[0];
            // Find the matching day in weeks data to get formatted date
            for (const weekNum in data.weeks) {
              const week = data.weeks[weekNum];
              const day = week.find((d: CleaningDay) => d.id === currentRegistration.id);
              if (day) {
                setSelectedDay(day);
                break;
              }
            }
          }
        }
      } catch {
        // Error fetching cleaning days - will show in UI
      }
    };

    // Only fetch if user is authenticated
    if (user && user.id) {
      fetchCleaningDays();
    }
  }, [user, isRegistered, userRegistrations]);

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

  const handleStudentClick = (day: CleaningDay) => {
    setSelectedDay(day);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Check if user can mark attendance
  const canMarkAttendance = () => {
    return user && (user.isAdmin || user.isSuperAdmin || user.isTutor);
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

          // Update selected day with new data
          if (selectedDay) {
            const updatedDay = cleaningFormData.weeks[selectedDay.week]?.find((d: CleaningDay) => d.id === selectedDay.id);
            if (updatedDay) {
              setSelectedDay(updatedDay);
            }
          }
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
  }, [canMarkAttendance, selectedDay, setMessage, setMessageType]);

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

          // Update selected day with new data
          if (selectedDay) {
            const updatedDay = cleaningFormData.weeks[selectedDay.week]?.find((d: CleaningDay) => d.id === selectedDay.id);
            if (updatedDay) {
              setSelectedDay(updatedDay);
            }
          }
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
  }, [canMarkAttendance, selectedDay, setMessage, setMessageType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user is logged in
    if (!user || !user.id) {
      setMessage('User session expired. Please log in again.');
      setMessageType('error');
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }

    // Validate day selection
    if (!selectedDay) {
      setMessage('Please select a cleaning day before submitting.');
      setMessageType('error');
      return;
    }

    if (selectedDay.isFull) {
      setMessage('This day is already full. Please select another day.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Only allow initial registration, no updates
      if (isRegistered) {
        const registeredDay = userRegistrations[0];
        setMessage(`You have already registered to work on ${registeredDay?.dayName}, ${registeredDay?.formattedDate}. Each student can only register for one day.`);
        setMessageType('error');
        setIsLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.CLEANING_FORM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'register',
          cleaningDayId: selectedDay.id,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userName = user?.fullName || `${user?.firstName} ${user?.lastName}`;
        const dayName = selectedDay?.dayName;
        const formattedDate = selectedDay?.date ? new Date(selectedDay.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) : '';

        setMessage(`${userName}, you have successfully registered for ${dayName}, ${formattedDate}! Redirecting to your dashboard...`);
        setMessageType('success');
        setSelectedDay(null);

        // Refresh user status before redirect
        const statusResponse = await fetch(API_ENDPOINTS.USER_STATUS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, email: user?.email }),
        });
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setIsRegistered(statusData.isRegistered);
          setUserRegistrations(statusData.registrations);
        }

        // User stays on form page to manually navigate when ready
      } else {
        // Handle specific error cases
        if (response.status === 404 && data.message?.includes('User not found')) {
          setMessage('Your session has expired. Please log in again.');
          setMessageType('error');
          // Redirect to home
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setMessage(data.message || 'Failed to register for cleaning day');
          setMessageType('error');
        }
      }
    } catch {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || checkingStatus) {
    return (
      <PageLoader text="Loading your registration..." color="orange" />
    );
  }

  return (
    <BackgroundImage className="min-h-screen">
      {/* Modern dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-950/80 to-slate-900/80 backdrop-blur-sm"></div>

      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Modern Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Cleaning Day Registration</h1>
                <p className="text-sm text-slate-400">Freedom City Tech Center</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg border border-slate-700/50 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        {/* User Status Card */}
        <div className="mb-6">
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="text-slate-100 font-medium">Welcome, {user.firstName}!</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isRegistered
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                {isRegistered ? '✓ Registered' : 'Available'}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a student by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
              <div className="absolute left-4 top-3.5 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto">
                <p className="text-slate-400 text-sm mb-3">Found {searchResults.length} student(s):</p>
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleStudentClick(result.day)}
                      className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-slate-600/50 transition-colors border border-slate-600/50 hover:border-indigo-500/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {result.student.firstName?.charAt(0)}{result.student.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-200 text-sm font-medium">{result.student.firstName} {result.student.lastName}</p>
                          <p className="text-slate-400 text-xs">{result.student.email}</p>
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${result.student.attendanceStatus === 'attended'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : result.student.attendanceStatus === 'no-show'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                              {result.student.attendanceStatus === 'attended' ? '✓ Attended' :
                                result.student.attendanceStatus === 'no-show' ? '✗ No Show' :
                                  '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 text-sm font-medium">{result.day.dayName}</p>
                        <p className="text-slate-400 text-xs">{new Date(result.day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && (
              <div className="mt-4 text-center py-4">
                <p className="text-slate-400 text-sm mb-3">No students found matching "{searchQuery}"</p>
                <button
                  onClick={() => handleSearch('')}
                  className="px-4 py-2 bg-slate-600/50 hover:bg-slate-500/50 text-slate-300 rounded-lg text-sm transition-colors border border-slate-600/50"
                >
                  Clear Search
                </button>
              </div>
            )}

            {showSearchResults && searchResults.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-700/50">
                <button
                  onClick={() => handleSearch('')}
                  className="w-full px-4 py-2 bg-slate-600/50 hover:bg-slate-500/50 text-slate-300 rounded-lg text-sm transition-colors border border-slate-600/50"
                >
                  Clear All Results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6">
            <div className={`rounded-xl p-4 border ${messageType === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
              : 'bg-red-500/10 border-red-500/30 text-red-100'
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{messageType === 'success' ? '✓' : '⚠️'}</span>
                <p className="font-medium text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Already Registered Display */}
        {isRegistered && userRegistrations.length > 0 && (
          <div className="flex-1">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-emerald-300">Registration Confirmed</h3>
                  <p className="text-emerald-100/80 text-sm">You have registered for a cleaning day</p>
                </div>
              </div>
              {userRegistrations.map((registration, index) => (
                <div key={index} className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <p className="text-emerald-100 font-semibold">{registration.dayName}</p>
                  <p className="text-emerald-100/70 text-sm">{registration.formattedDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Layout - Show for all users */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100">May 2026</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm">Week 1-3</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-slate-500 text-sm font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {Object.entries(weeks).map(([weekNum, weekDays]) => (
                  <div key={weekNum}>
                    <p className="text-slate-400 text-sm mb-2 font-medium">Week {weekNum}</p>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays
                        .filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName))
                        .map((day: CleaningDay) => {
                          const date = new Date(day.date);
                          const isSelected = selectedDay?.id === day.id;
                          const isFull = day.isFull;

                          return (
                            <button
                              key={day.id}
                              onClick={() => setSelectedDay(day)}
                              className={`
                                  aspect-square rounded-xl flex flex-col items-center justify-center
                                  transition-all duration-200 transform hover:scale-105
                                  ${isFull
                                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 cursor-pointer border border-red-500/30'
                                  : isSelected
                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 cursor-pointer border border-slate-600/50 hover:border-indigo-500/50'
                                }
                                `}
                            >
                              <span className="text-lg font-semibold">{date.getDate()}</span>
                              <span className="text-xs mt-1">{day.registeredCount}/{day.maxSlots}</span>
                              {isFull && <span className="text-xs text-red-400 mt-1">Full</span>}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-6 sticky top-6">
              {selectedDay ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-100">Day Details</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${selectedDay.isFull
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                      {selectedDay.isFull ? 'Full' : 'Available'}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-slate-400 text-sm">Day</p>
                      <p className="text-slate-100 font-semibold text-lg">{selectedDay.dayName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="text-slate-100 font-semibold">{new Date(selectedDay.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Availability</p>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-300">Spots</span>
                          <span className="text-slate-100 font-semibold">{selectedDay.registeredCount}/{selectedDay.maxSlots}</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${selectedDay.isFull
                              ? 'bg-red-500'
                              : selectedDay.registeredCount / selectedDay.maxSlots > 0.7
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                              }`}
                            style={{ width: `${(selectedDay.registeredCount / selectedDay.maxSlots) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedDay.registeredUsers && selectedDay.registeredUsers.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-slate-400 text-sm">Registered Students ({selectedDay.registeredUsers.length})</p>
                        {canMarkAttendance() && (
                          <p className="text-xs text-indigo-400">Click to mark attendance</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        {selectedDay.registeredUsers.map((u: UserWithAttendance) => (
                          <div key={u.id} className={`bg-slate-700/50 rounded-lg p-3 flex items-center justify-between ${canMarkAttendance() ? 'hover:bg-slate-600/50 transition-colors' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-slate-200 text-sm font-medium">{u.firstName} {u.lastName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.attendanceStatus === 'attended'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : u.attendanceStatus === 'no-show'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    }`}>
                                    {u.attendanceStatus === 'attended' ? '✓ Attended' :
                                      u.attendanceStatus === 'no-show' ? '✗ No Show' :
                                        '⏳ Pending'}
                                  </span>
                                  {u.markedAt && (
                                    <span className="text-xs text-slate-400">
                                      {new Date(u.markedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {canMarkAttendance() && u.attendanceStatus === 'pending' && (
                              <div className="flex gap-2">
                                <LoadingButton
                                  isLoading={attendanceLoading === u.registrationId}
                                  loadingText="Marking..."
                                  onClick={() => handleMarkAttendance(u, 'attended')}
                                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Attended
                                  </>
                                </LoadingButton>
                                <LoadingButton
                                  isLoading={attendanceLoading === u.registrationId}
                                  loadingText="Marking..."
                                  onClick={() => handleMarkAttendance(u, 'no-show')}
                                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    No Show
                                  </>
                                </LoadingButton>
                              </div>
                            )}

                            {canMarkAttendance() && u.attendanceStatus !== 'pending' && (
                              <div className="flex gap-2">
                                <LoadingButton
                                  isLoading={attendanceLoading === u.registrationId}
                                  loadingText="Clearing..."
                                  onClick={() => handleClearAttendance(u)}
                                  className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors"
                                >
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16a1 1 0 0 1 1v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1V5a1 1 0 0 1 1H3a1 1 0 0 1-1v16a1 1 0 0 1 1z" />
                                    </svg>
                                    Clear Status
                                  </>
                                </LoadingButton>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {canMarkAttendance() && (
                        <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                          <p className="text-xs text-indigo-300">
                            <strong>Admin Access:</strong> You can mark attendance for students. Click "Attended" or "No Show" to update their status.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      disabled={isLoading || selectedDay.isFull || isRegistered}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${isLoading || selectedDay.isFull || isRegistered
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30'
                        }`}
                    >
                      {isRegistered ? 'Already Registered' : (isLoading ? 'Registering...' : 'Register for This Day')}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="text-slate-400">Select a day from the calendar</p>
                  <p className="text-slate-500 text-sm mt-2">Click on an available day to see details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
