'use client';

import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ExcelExporter from '@/components/ExcelExporter';
import { useRouter } from 'next/navigation';
import { User, CleaningDay, Weeks } from '@/types';
import { isAdminEmail } from '@/config/admin';

interface DBUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export default function Admin() {
  const [weeks, setWeeks] = useState<Weeks>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [users, setUsers] = useState<DBUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneUpdateLoading, setPhoneUpdateLoading] = useState(false);
  const [courseRegistrations, setCourseRegistrations] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [clearingCourse, setClearingCourse] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is admin (URL-based authentication)
  useEffect(() => {
    // Get user data from URL parameters (passed from login)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const email = urlParams.get('email');

    if (!userId || !email) {
      // No auth params, redirect to home
      router.push('/');
      return;
    }

    // Admin check - only authorized emails can access admin dashboard
    if (!isAdminEmail(email)) {
      router.push('/form');
      return;
    }

    // Verify user exists in database (optional but recommended)
    const verifyUser = async () => {
      try {
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, email }),
        });

        if (!response.ok) {
          router.push('/');
          return;
        }

        const data = await response.json();
        if (!data.success || !data.user) {
          router.push('/');
          return;
        }
      } catch {
        router.push('/');
      }
    };

    verifyUser();
  }, [router]);

  // Fetch cleaning days data (initial load)
  const fetchCleaningDays = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cleaning-days');
      const data = await response.json();

      if (data.success) {
        setWeeks(data.weeks);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching cleaning days:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update statistics without full loading screen
  const updateStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/cleaning-days');
      const data = await response.json();

      if (data.success) {
        setWeeks(data.weeks);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error updating statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    const loadCleaningDays = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/cleaning-days');
        const data = await response.json();

        if (data.success) {
          setWeeks(data.weeks);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error fetching cleaning days:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCleaningDays();
    // Auto-refresh every 5 minutes to stay in sync with form (less frequent)
    const interval = setInterval(loadCleaningDays, 300000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchCourseRegistrations = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const response = await fetch('/api/all-course-registrations');
      const data = await response.json();
      if (data.success) {
        setCourseRegistrations(data.registrations);
      }
    } catch (error) {
      console.error('Error fetching course registrations:', error);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // Delete user registrations only (preserve account)
  const deleteUserRegistrations = async (userId: string, userName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}'s registrations?\n\nThis will:\n• Remove all their cleaning day registrations\n• Update the cleaning day counts\n• Keep their account for future login access\n• They can register again if needed\n\nThis action can be undone by re-registering.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        // Update user list to remove deleted user
        setUsers(users.filter(user => user.id !== userId));

        // Show detailed feedback
        const feedbackMessage = data.deletedRegistrations > 0
          ? `${userName} registrations deleted (${data.deletedRegistrations} removed). Account preserved for login.`
          : `${userName} registrations deleted. Account preserved for login.`;

        setCopyFeedback(feedbackMessage);

        // Immediately refresh statistics to update registration counts without full loading screen
        updateStatistics();

        // Also refresh users list to ensure consistency
        fetchUsers();

        // Clear feedback after 3 seconds
        setTimeout(() => setCopyFeedback(''), 3000);
      } else {
        setCopyFeedback(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setCopyFeedback('Network error occurred');
    }
  };

  // Permanently delete user (including account)
  const deleteUserPermanently = async (userId: string, userName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION ⚠️\n\nAre you sure you want to permanently delete ${userName}?\n\nThis will:\n• Delete their account permanently\n• Remove email, password, and all user data\n• Delete all their cleaning day registrations\n• Update the cleaning day counts\n• They will need to register again to access the system\n\nThis action CANNOT be undone!`
    );

    if (!confirmed) {
      return;
    }

    // Double confirmation for permanent deletion
    const doubleConfirmed = window.confirm(
      `FINAL CONFIRMATION\n\nYou are about to permanently delete ${userName} (${users.find(u => u.id === userId)?.email}) from the database.\n\nType "DELETE" to confirm or click Cancel to abort.`
    );

    if (!doubleConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/users/permanent?id=${userId}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        // Update user list to remove deleted user
        setUsers(users.filter(user => user.id !== userId));

        // Show detailed feedback
        const feedbackMessage = data.deletedRegistrations > 0
          ? `${userName} permanently deleted (${data.deletedRegistrations} registrations removed)`
          : `${userName} permanently deleted`;

        setCopyFeedback(feedbackMessage);

        // Immediately refresh statistics to update registration counts without full loading screen
        updateStatistics();

        // Also refresh users list to ensure consistency
        fetchUsers();

        // Clear feedback after 3 seconds
        setTimeout(() => setCopyFeedback(''), 3000);
      } else {
        setCopyFeedback(data.message || 'Permanent delete failed');
      }
    } catch (error) {
      console.error('Permanent delete user error:', error);
      setCopyFeedback('Network error occurred');
    }
  };

  // Start editing phone number
  const startEditingPhone = (userId: string, currentPhone: string) => {
    setEditingPhone(userId);
    setPhoneInput(currentPhone);
  };

  // Cancel editing phone number
  const cancelEditingPhone = () => {
    setEditingPhone(null);
    setPhoneInput('');
  };

  // Save phone number
  const savePhoneNumber = async (userId: string) => {
    setPhoneUpdateLoading(true);
    try {
      const response = await fetch('/api/update-phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          phoneNumber: phoneInput.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user in local state
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, phoneNumber: data.user.phoneNumber }
            : user
        ));

        setCopyFeedback('Phone number updated successfully!');
        setEditingPhone(null);
        setPhoneInput('');
      } else {
        setCopyFeedback(data.message || 'Failed to update phone number');
      }
    } catch {
      setCopyFeedback('Network error occurred');
    } finally {
      setPhoneUpdateLoading(false);
      setTimeout(() => setCopyFeedback(''), 3000);
    }
  };

  // Clear user's course registrations
  const clearUserCourses = async (userId: string, userName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Clear Course Registrations\n\nAre you sure you want to clear all course registrations for ${userName}?\n\nThis will:\n• Delete all their registered courses and credits\n• Allow them to register courses again\n• Keep their account and cleaning day registrations\n• Update the course credits overview\n\nThis action can be reversed by the user re-registering their courses.`
    );

    if (!confirmed) {
      return;
    }

    setClearingCourse(userId);
    try {
      const response = await fetch(`/api/courses/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the user's course registration from the local state
        setCourseRegistrations(courseRegistrations.filter(reg => reg.userId !== userId));

        // Update statistics to refresh the total students counter
        updateStatistics();

        setCopyFeedback(`Course registrations cleared for ${userName}. They can now register again.`);

        // Clear feedback after 3 seconds
        setTimeout(() => setCopyFeedback(''), 3000);
      } else {
        setCopyFeedback(data.message || 'Failed to clear courses');
      }
    } catch (error) {
      console.error('Clear courses error:', error);
      setCopyFeedback('Network error occurred');
    } finally {
      setClearingCourse(null);
    }
  };

  // Prepare data for Excel export
  const prepareExcelData = () => {
    const registeredStudents: { 'Date': string; 'Full Name': string; 'Email': string; 'Phone Number': string }[] = [];

    // Collect all registered users from all weeks and days
    Object.values(weeks).forEach((week) => {
      week.forEach((day: CleaningDay) => {
        if (day.registeredUsers && day.registeredUsers.length > 0) {
          day.registeredUsers.forEach((user: User) => {
            // Find the complete user data from the users array to get phone number
            const completeUser = users.find(u => u.id === user.id);

            // Get the exact phone number as registered, preserve formatting completely
            let phoneNumber = completeUser?.phoneNumber || '';

            // Ensure phone number is exactly as entered - no automatic formatting
            if (phoneNumber && phoneNumber.trim()) {
              phoneNumber = phoneNumber.trim();
            } else {
              phoneNumber = 'No phone number provided';
            }

            registeredStudents.push({
              'Date': day.formattedDate,
              'Full Name': user.fullName || `${user.firstName} ${user.lastName}`,
              'Email': user.email,
              'Phone Number': phoneNumber
            });
          });
        }
      });
    });

    // Sort by date for better organization
    return registeredStudents.sort((a, b) => {
      const dateA = new Date(a.Date).getTime();
      const dateB = new Date(b.Date).getTime();
      return dateB - dateA; // Most recent first
    });
  };

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await fetch('/api/users');
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Load course registrations on component mount
  useEffect(() => {
    fetchCourseRegistrations();
  }, []);

  const getProgressColor = (count: number, max: number) => {
    const percentage = (count / max) * 100;
    if (percentage <= 40) return 'text-green-400';
    if (percentage <= 80) return 'text-yellow-400';
    return 'text-red-400';
  };


  const getWeekName = (weekNumber: number) => {
    const weekNames = {
      1: 'Week 1',
      2: 'Week 2',
      3: 'Week 3'
    };
    return weekNames[weekNumber as keyof typeof weekNames] || `Week ${weekNumber}`;
  };

  const getWeekDates = (weekNumber: number) => {
    const dates = {
      1: 'May 4-8, 2026',
      2: 'May 11-15, 2026',
      3: 'May 18-22, 2026'
    };
    return dates[weekNumber as keyof typeof dates] || '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center relative">

        <div className="text-center relative z-10">
          <LoadingSpinner size="lg" text="Loading admin dashboard..." className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">

      <div className="relative z-10 backdrop-blur-sm bg-black/30 h-full flex flex-col">
        <div className="container mx-auto px-4 py-8 overflow-y-auto flex-1">
          {/* Enhanced Header */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mb-4 animate-bounce-in shadow-glow-lg p-2">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <h1 className="text-5xl font-bold text-gradient-primary mb-3 animate-shimmer text-shadow-lg">
              Stipend Management Admin Dashboard
            </h1>
            <p className="text-cyan-300 text-xl font-medium mb-2 drop-shadow-lg animate-slide-in-left">
              Freedom City Tech Center
            </p>
            <p className="text-gray-300 text-lg mb-6 animate-slide-in-right">
              Manage student registrations for stipend planning
            </p>
            <div className="flex items-center justify-center gap-4 text-white/80 text-sm animate-fade-in-up">
              <div className="glass-morphism px-4 py-2 rounded-full border border-purple-500/30 hover-lift">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  Last updated: {lastUpdated?.toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={fetchCleaningDays}
                className="glass-morphism hover:glass-card px-6 py-2 rounded-full border border-cyan-400/50 transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 animate-float"
              >
                <span className="flex items-center gap-2">
                  <span className="animate-spin-slow">🔄</span>
                  Refresh Data
                </span>
              </button>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${statsLoading ? 'opacity-75' : ''} animate-fade-in-up animation-delay-200`}>
            {statsLoading && (
              <div className="col-span-full text-center mb-4">
                <div className="glass-morphism inline-flex items-center px-4 py-2 rounded-full">
                  <span className="text-cyan-400 text-sm animate-pulse mr-2">🔄</span>
                  <span className="text-cyan-300 text-sm">Updating stipend statistics...</span>
                </div>
              </div>
            )}
            <div className={`glass-card rounded-3xl p-6 border border-purple-400/30 shadow-glow hover-lift ${statsLoading ? 'animate-pulse' : 'animate-scale-in'} animation-delay-300`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gradient-primary">Total Duty Days</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center animate-float">
                  <span className="text-white text-lg">📅</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gradient-primary animate-shimmer">
                {Object.values(weeks).reduce((total, week) => total + week.length, 0)}
              </p>
              <p className="text-bright text-sm mt-2">Days available for duty assignments</p>
            </div>
            <div className={`glass-card rounded-3xl p-6 border border-cyan-400/30 shadow-glow hover-lift ${statsLoading ? 'animate-pulse' : 'animate-scale-in'} animation-delay-500`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gradient-primary">Students Registered</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-float animation-delay-2000">
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gradient-primary animate-shimmer">
                {Object.values(weeks).reduce((total: number, week: CleaningDay[]) =>
                  total + week.reduce((weekTotal: number, day: CleaningDay) => weekTotal + day.registeredCount, 0), 0
                )}
              </p>
              <p className="text-bright text-sm mt-2">Students assigned to duty days</p>
            </div>
            <div className={`backdrop-blur-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-6 border-2 border-blue-400/30 shadow-xl shadow-blue-500/20 hover:scale-105 transition-all duration-300 ${statsLoading ? 'animate-pulse' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-cyan-300">Available Slots</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {Object.values(weeks).reduce((total: number, week: CleaningDay[]) =>
                  total + week.reduce((weekTotal: number, day: CleaningDay) => weekTotal + (day.maxSlots - day.registeredCount), 0), 0
                )}
              </p>
              <p className="text-bright text-sm mt-2">Open duty slots remaining</p>
            </div>
          </div>

          {/* Duty Day Management Section */}
          <div className="backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Student Management
              </h2>
              <p className="text-cyan-300 text-sm mb-4">
                View and manage student duty assignments for stipend planning
              </p>
              <button
                onClick={fetchUsers}
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-2 px-4 rounded-full border border-purple-500/50 transition-all text-sm"
              >
                Refresh Users
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="md" text="Loading users..." className="text-gray-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <span className="text-white font-semibold">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-cyan-300 text-sm">
                            ({user.email})
                          </span>
                        </div>
                        {editingPhone === user.id ? (
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="tel"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              className="flex-1 px-2 py-1 bg-white/10 border border-green-400/30 rounded text-white text-sm placeholder-green-300/70"
                              placeholder="+256 123 456 789"
                            />
                            <button
                              onClick={() => savePhoneNumber(user.id)}
                              disabled={phoneUpdateLoading}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-2 py-1 rounded text-xs transition-all"
                            >
                              {phoneUpdateLoading ? '...' : '✓'}
                            </button>
                            <button
                              onClick={cancelEditingPhone}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs transition-all"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            {user.phoneNumber ? (
                              <div className="text-green-400 text-sm">
                                📱 {user.phoneNumber}
                              </div>
                            ) : (
                              <div className="text-orange-400 text-sm italic">
                                no phone number
                              </div>
                            )}
                            <button
                              onClick={() => startEditingPhone(user.id, user.phoneNumber)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-all"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                        <div className="text-gray-400 text-xs">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteUserRegistrations(user.id, `${user.firstName} ${user.lastName}`)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm transition-all"
                          title="Clear registrations only (keep account)"
                        >
                          Clear Forms
                        </button>
                        <button
                          onClick={() => deleteUserPermanently(user.id, `${user.firstName} ${user.lastName}`)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-all"
                          title="Permanently delete user account"
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Excel-style Data Table */}
          <div className="backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Student Duty Assignments
                  </h2>
                  <p className="text-cyan-300 text-sm">
                    Click on any cell to copy the data for stipend records
                  </p>
                  {copyFeedback && (
                    <div className="mt-2 text-green-400 text-sm animate-pulse">
                      {copyFeedback}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <ExcelExporter
                    data={prepareExcelData()}
                    filename="registered-students.csv"
                    className="text-sm"
                  >
                    <span className="text-lg">📊</span>
                    Download CSV (Stipend Records)
                  </ExcelExporter>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-2 mb-6 pb-4 border-b border-cyan-400/30">
              <div className="col-span-2 text-cyan-300 font-bold text-sm uppercase tracking-wider">DATE</div>
              <div className="col-span-3 text-cyan-300 font-bold text-sm uppercase tracking-wider">FULL NAME</div>
              <div className="col-span-4 text-cyan-300 font-bold text-sm uppercase tracking-wider">EMAIL</div>
              <div className="col-span-3 text-cyan-300 font-bold text-sm uppercase tracking-wider">PHONE</div>
            </div>

            {/* Mobile Table Headers */}
            <div className="sm:hidden mb-6 pb-4 border-b border-cyan-400/30 space-y-3">
              <div className="text-cyan-300 font-bold text-sm uppercase tracking-wider">DATE</div>
              <div className="text-cyan-300 font-bold text-sm uppercase tracking-wider">FULL NAME</div>
              <div className="text-cyan-300 font-bold text-sm uppercase tracking-wider">EMAIL</div>
              <div className="text-cyan-300 font-bold text-sm uppercase tracking-wider">PHONE</div>
            </div>

            {/* Table Data */}
            <div className="space-y-2">
              {(() => {
                // Collect all registrations and sort by date
                const allRegistrations: Array<{
                  day: CleaningDay;
                  user: User;
                  sortDate: Date;
                }> = [];

                Object.entries(weeks).forEach(([, days]) => {
                  days.forEach((day: CleaningDay) => {
                    // Safety check for registeredUsers
                    if (day.registeredUsers && Array.isArray(day.registeredUsers)) {
                      day.registeredUsers.forEach((user: User) => {
                        allRegistrations.push({
                          day,
                          user,
                          sortDate: new Date(day.date)
                        });
                      });
                    }
                  });
                });

                // Sort by date (earliest first)
                allRegistrations.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

                return allRegistrations.map((registration) => (
                  <div key={`${registration.day.id}-${registration.user.id}`} className="animate-slide-up">
                    {/* Desktop Layout */}
                    <div
                      className="hidden sm:grid grid-cols-12 gap-2 py-3 px-3 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-cyan-600/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-cyan-400/30"
                      onClick={() => {
                        // Copy to clipboard when clicked
                        const completeUser = users.find(u => u.id === registration.user.id);
                        const phone = completeUser?.phoneNumber;
                        const phoneText = phone && phone !== 'Not provided' ? phone : 'no phone number';
                        const rowData = `${registration.day.formattedDate}\t${registration.user.firstName} ${registration.user.lastName}\t${registration.user.email}\t${phoneText}`;
                        navigator.clipboard.writeText(rowData);
                        setCopyFeedback('Row copied to clipboard!');
                        setTimeout(() => setCopyFeedback(''), 2000);
                      }}
                    >
                      <div className="col-span-2 text-white text-sm font-mono truncate">
                        <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                          {registration.day.formattedDate}
                        </span>
                      </div>
                      <div className="col-span-3 text-white text-sm truncate font-medium">
                        {registration.user.firstName} {registration.user.lastName}
                      </div>
                      <div className="col-span-4 text-cyan-300 text-sm font-mono text-wrap break-word">
                        {registration.user.email}
                      </div>
                      <div className="col-span-3 text-green-400 text-sm">
                        {(() => {
                          const completeUser = users.find(u => u.id === registration.user.id);
                          const phone = completeUser?.phoneNumber;
                          return phone && phone !== 'Not provided' ? phone : <span className="text-orange-400 text-sm">no phone number</span>;
                        })()}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div
                      className="sm:hidden p-3 hover:bg-white/10 rounded cursor-pointer transition-all border border-white/10"
                      onClick={() => {
                        // Copy to clipboard when clicked
                        const completeUser = users.find(u => u.id === registration.user.id);
                        const phone = completeUser?.phoneNumber;
                        const phoneText = phone && phone !== 'Not provided' ? phone : 'no phone number';
                        const rowData = `${registration.day.formattedDate}\t${registration.user.firstName} ${registration.user.lastName}\t${registration.user.email}\t${phoneText}`;
                        navigator.clipboard.writeText(rowData);
                        setCopyFeedback('Row copied to clipboard!');
                        setTimeout(() => setCopyFeedback(''), 2000);
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-cyan-300 text-xs font-semibold">DATE:</span>
                          <span className="text-white text-sm font-mono text-right">{registration.day.formattedDate}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-cyan-300 text-xs font-semibold">NAME:</span>
                          <span className="text-white text-sm text-right">{registration.user.firstName} {registration.user.lastName}</span>
                        </div>
                        <div className="flex justify-start items-start">
                          <span className="text-cyan-300 text-xs font-semibold mr-2">EMAIL:</span>
                          <span className="text-cyan-300 text-sm font-mono break-all flex-1">{registration.user.email}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-cyan-300 text-xs font-semibold">PHONE:</span>
                          <span className="text-green-400 text-sm text-right">
                            {(() => {
                              const completeUser = users.find(u => u.id === registration.user.id);
                              const phone = completeUser?.phoneNumber;
                              return phone && phone !== 'Not provided' ? phone : <span className="text-orange-400 text-sm">no phone number</span>;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}

              {/* Show empty state if no registrations */}
              {Object.values(weeks).every((week: CleaningDay[]) =>
                week.every((day: CleaningDay) => day.registeredUsers.length === 0)
              ) && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-lg">
                      No students registered yet
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Students will appear here once they register for cleaning days
                    </p>
                  </div>
                )}
            </div>

            {/* Copy All Button */}
            {Object.values(weeks).some((week: CleaningDay[]) =>
              week.some((day: CleaningDay) => day.registeredUsers.length > 0)
            ) && (
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <button
                    onClick={() => {
                      // Generate all data for copying in chronological order for stipend planning
                      let allData = 'DATE\tFULL NAME\tEMAIL\n';
                      const allRegistrations: Array<{
                        day: CleaningDay;
                        user: User;
                        sortDate: Date;
                      }> = [];

                      Object.entries(weeks).forEach(([, days]) => {
                        days.forEach((day: CleaningDay) => {
                          day.registeredUsers.forEach((user: User) => {
                            allRegistrations.push({
                              day,
                              user,
                              sortDate: new Date(day.date)
                            });
                          });
                        });
                      });

                      // Sort by date (earliest first)
                      allRegistrations.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

                      // Add sorted data to output
                      allRegistrations.forEach((registration: { day: CleaningDay, user: User, sortDate: Date }) => {
                        allData += `${registration.day.formattedDate}\t${registration.user.firstName} ${registration.user.lastName}\t${registration.user.email}\n`;
                      });

                      navigator.clipboard.writeText(allData);
                      alert('All duty assignment data copied to clipboard! Ready for stipend planning.');
                    }}
                    className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 py-2 px-4 rounded-full border border-cyan-500/50 transition-all"
                  >
                    Copy All Duty Assignments (for Stipend Planning)
                  </button>
                </div>
              )}
          </div>

          {/* Weekly Duty Summary */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Weekly Duty Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(weeks).map(([weekNum, days]) => (
                <div key={weekNum} className="backdrop-blur-md bg-white/20 rounded-2xl p-6 border-2 border-white/20">
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">
                    {getWeekName(parseInt(weekNum))}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {getWeekDates(parseInt(weekNum))}
                  </p>
                  <div className="space-y-2">
                    {days.map((day: CleaningDay) => (
                      <div key={day.id} className="flex justify-between items-center">
                        <span className="text-white text-sm">{day.dayName}</span>
                        <span className={`text-sm font-bold ${getProgressColor(day.registeredCount, day.maxSlots)}`}>
                          {day.registeredCount}/{day.maxSlots}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Course Registrations Overview for Stipend Planning */}
          <div className="mt-12 animate-fade-in-up animation-delay-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gradient-primary animate-slide-in-right text-shadow-lg">
                Course Credits Overview (Stipend Planning)
              </h2>
              <button
                onClick={fetchCourseRegistrations}
                className="glass-morphism hover:glass-card px-6 py-3 rounded-full border border-blue-400/50 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 animate-float"
                disabled={coursesLoading}
              >
                <span className="flex items-center gap-2 text-blue-300">
                  {coursesLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span className="animate-spin-slow">🔄</span>
                      <span>Refresh Courses</span>
                    </>
                  )}
                </span>
              </button>
            </div>
            {coursesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
                <p className="text-blue-300 text-lg animate-pulse">Loading course registrations...</p>
              </div>
            ) : courseRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-gray-400">📚</span>
                </div>
                <p className="text-gray-400 text-lg mb-2">No course registrations found</p>
                <p className="text-gray-500 text-sm">Students haven&apos;t registered their course credits yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-400/30">
                    <p className="text-blue-300 text-sm font-medium">Total Students Who Have Registered for Their Credits</p>
                    <p className="text-white text-2xl font-bold">{courseRegistrations.filter(reg => reg.courses && reg.courses.length > 0 && reg.user).length}</p>
                  </div>
                </div>

                {/* Course Registrations Table */}
                <div className="bg-black/30 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-cyan-300">Student Course Credits (Stipend Planning Format)</h3>
                    <button
                      onClick={() => {
                        // Prepare Excel-friendly data
                        const studentsWithCourses = courseRegistrations.filter(reg => reg.courses && reg.courses.length > 0);
                        const excelData = studentsWithCourses.map(reg => {
                          const coursesList = reg.courses.map((course: any) =>
                            `${course.name} (${course.credits} credits)`
                          ).join('\n');

                          return `${reg.user.firstName} ${reg.user.lastName}\t${coursesList}\t${reg.totalCredits}\t${reg.takesReligion ? 'YES' : 'NO'}\n`;
                        }).join('');

                        const header = 'Student Name\tCourses\tCredits\tReligion Course\n';
                        const fullData = header + excelData;

                        navigator.clipboard.writeText(fullData);
                        setCopyFeedback('Course credits data copied to clipboard! Ready for stipend planning.');
                        setTimeout(() => setCopyFeedback(''), 3000);
                      }}
                      className="bg-green-600/20 hover:bg-green-600/30 text-green-300 py-2 px-4 rounded-full border border-green-500/50 transition-all text-sm"
                    >
                      📋 Copy All Credits (for Stipend Planning)
                    </button>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left py-3 px-4 font-medium text-cyan-300">Student Name</th>
                          <th className="text-left py-3 px-4 font-medium text-cyan-300">Courses</th>
                          <th className="text-center py-3 px-4 font-medium text-cyan-300">Credits</th>
                          <th className="text-center py-3 px-4 font-medium text-cyan-300">Religion Course</th>
                          <th className="text-center py-3 px-4 font-medium text-cyan-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseRegistrations.filter(reg => reg.courses && reg.courses.length > 0 && reg.user).map((registration) => (
                          <tr
                            key={registration.id}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => {
                              const coursesList = registration.courses.map((course: any) =>
                                `${course.name} (${course.credits} credits)`
                              ).join('\n');

                              const userName = registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User';
                              const rowData = `${userName}\t${coursesList}\t${registration.totalCredits}\t${registration.takesReligion ? 'YES' : 'NO'}`;

                              navigator.clipboard.writeText(rowData);
                              setCopyFeedback(`Row copied: ${userName}`);
                              setTimeout(() => setCopyFeedback(''), 2000);
                            }}
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium text-white">
                                {registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white text-sm">
                                {registration.courses.map((course: any, courseIndex: number) => (
                                  <div key={courseIndex} className="mb-1">
                                    {course.name} ({course.credits} credits)
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-lg text-green-400">{registration.totalCredits}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-bold ${registration.takesReligion ? 'text-green-400' : 'text-red-400'}`}>
                                {registration.takesReligion ? 'YES' : 'NO'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click
                                  const userName = registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User';
                                  clearUserCourses(registration.userId, userName);
                                }}
                                disabled={clearingCourse === registration.userId}
                                className="bg-red-600/20 hover:bg-red-600/30 text-red-300 py-1 px-3 rounded-full border border-red-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {clearingCourse === registration.userId ? (
                                  <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border border-red-300 border-t-transparent mr-2"></div>
                                    Clearing...
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    🗑️ Clear
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {courseRegistrations.filter(reg => reg.courses && reg.courses.length > 0 && reg.user).map((registration) => (
                      <div key={registration.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                        <div className="mb-3">
                          <h4 className="text-white font-bold text-lg">
                            {registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User'}
                          </h4>
                          <p className="text-cyan-300 text-sm">{registration.user?.email || 'No email'}</p>
                        </div>

                        <div className="space-y-2 mb-3">
                          <p className="text-gray-300 text-sm font-medium">Courses:</p>
                          {registration.courses.map((course: any, courseIndex: number) => (
                            <div key={courseIndex} className="bg-black/30 rounded px-3 py-2 text-sm">
                              <span className="text-white">{course.name}</span>
                              <span className="text-cyan-400 ml-2">({course.credits}cr)</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-300">Total Credits:</span>
                            <span className="text-green-400 font-bold ml-2">{registration.totalCredits}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Religion:</span>
                            <span className={`font-bold ml-2 ${registration.takesReligion ? 'text-green-400' : 'text-red-400'}`}>
                              {registration.takesReligion ? '✓ Yes' : '✗ No'}
                            </span>
                          </div>
                        </div>

                        <div className="text-gray-400 text-xs mt-2">
                          Registered: {registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString() : 'Unknown date'}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/20">
                          <button
                            onClick={() => {
                              const userName = registration.user ? `${registration.user.firstName} ${registration.user.lastName}` : 'Unknown User';
                              clearUserCourses(registration.userId, userName);
                            }}
                            disabled={clearingCourse === registration.userId}
                            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 py-2 px-4 rounded-full border border-red-500/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {clearingCourse === registration.userId ? (
                              <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-3 w-3 border border-red-300 border-t-transparent mr-2"></div>
                                Clearing Courses...
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                🗑️ Clear Course Registrations
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                // Get current URL params to pass to dashboard page
                const urlParams = new URLSearchParams(window.location.search);
                router.push(`/dashboard?${urlParams.toString()}`);
              }}
              className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 py-3 px-6 rounded-full font-medium border border-cyan-500/50 transition-all"
            >
              🏠 Go to Dashboard
            </button>
            <button
              onClick={() => {
                router.push('/');
              }}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 px-6 rounded-full font-medium border border-red-500/50 transition-all"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
