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
          body: JSON.stringify({ userId }),
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
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-float-delayed"></div>

        <div className="text-center relative z-10">
          <LoadingSpinner size="lg" text="Loading admin dashboard..." className="text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative">
      {/* Animated background elements for admin */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen backdrop-blur-sm bg-black/30">
        <div className="container mx-auto px-4 py-8">
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
              Selfless CE Admin Dashboard
            </h1>
            <p className="text-cyan-300 text-xl font-medium mb-2 drop-shadow-lg animate-slide-in-left">
              Freedom City Tech Center
            </p>
            <p className="text-gray-300 text-lg mb-6 animate-slide-in-right">
              Manage cleaning duty registrations
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
                  <span className="text-cyan-300 text-sm">Updating statistics...</span>
                </div>
              </div>
            )}
            <div className={`glass-card rounded-3xl p-6 border border-purple-400/30 shadow-glow hover-lift ${statsLoading ? 'animate-pulse' : 'animate-scale-in'} animation-delay-300`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gradient-primary">Total Days</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center animate-float">
                  <span className="text-white text-lg">📅</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gradient-primary animate-shimmer">
                {Object.values(weeks).reduce((total, week) => total + week.length, 0)}
              </p>
              <p className="text-bright text-sm mt-2">Cleaning days available</p>
            </div>
            <div className={`glass-card rounded-3xl p-6 border border-cyan-400/30 shadow-glow hover-lift ${statsLoading ? 'animate-pulse' : 'animate-scale-in'} animation-delay-500`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gradient-primary">Total Registered</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-float animation-delay-2000">
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-gradient-primary animate-shimmer">
                {Object.values(weeks).reduce((total: number, week: CleaningDay[]) =>
                  total + week.reduce((weekTotal: number, day: CleaningDay) => weekTotal + day.registeredCount, 0), 0
                )}
              </p>
              <p className="text-bright text-sm mt-2">Users registered</p>
            </div>
            <div className={`backdrop-blur-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl p-6 border-2 border-blue-400/30 shadow-xl shadow-blue-500/20 hover:scale-105 transition-all duration-300 ${statsLoading ? 'animate-pulse' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-cyan-300">Available Spots</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {Object.values(weeks).reduce((total: number, week: CleaningDay[]) =>
                  total + week.reduce((weekTotal: number, day: CleaningDay) => weekTotal + (day.maxSlots - day.registeredCount), 0), 0
                )}
              </p>
              <p className="text-bright text-sm mt-2">Spots remaining</p>
            </div>
          </div>

          {/* User Management Section */}
          <div className="backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 shadow-2xl mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                User Management
              </h2>
              <p className="text-cyan-300 text-sm mb-4">
                View and delete users from the database
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
                    All Registered Students
                  </h2>
                  <p className="text-cyan-300 text-sm">
                    Click on any cell to copy the data
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
                    Download CSV (All Details)
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
                      // Generate all data for copying in chronological order
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
                      alert('All data copied to clipboard! You can paste it into Excel.');
                    }}
                    className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 py-2 px-4 rounded-full border border-cyan-500/50 transition-all"
                  >
                    Copy All Data (for Excel)
                  </button>
                </div>
              )}
          </div>

          {/* Summary Stats by Week */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Weekly Summary
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

          {/* Navigation */}
          <div className="text-center mt-8 space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  // Get current URL params to pass to form page
                  const urlParams = new URLSearchParams(window.location.search);
                  router.push(`/form?${urlParams.toString()}`);
                }}
                className="bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 py-3 px-6 rounded-full font-medium border border-cyan-500/50 transition-all"
              >
                📋 Go to Form
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

      {/* Developer Footer */}
      <div className="text-center mt-12 pt-8 border-t border-cyan-400/30">
        <p className="text-sm text-white/80 mb-3">
          Developed with{' '}
          <span className="text-red-500 animate-pulse">❤️</span>{' '}
          by{' '}
          <a
            href="mailto:atbriz256@gmail.com"
            className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-medium hover:from-purple-300 hover:to-cyan-300 transition-all duration-300"
          >
            Atbriz Nicholus
          </a>
        </p>
        <p className="text-xs text-cyan-400/70">
          Software Developer | Zana, Kampala, Uganda | 🇺🇬
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
                
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        
                
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-slide-up:nth-child(1) { animation-delay: 0.1s; }
        .animate-slide-up:nth-child(2) { animation-delay: 0.2s; }
        .animate-slide-up:nth-child(3) { animation-delay: 0.3s; }
        .animate-slide-up:nth-child(4) { animation-delay: 0.4s; }
        .animate-slide-up:nth-child(5) { animation-delay: 0.5s; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
