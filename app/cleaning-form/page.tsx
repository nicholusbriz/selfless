'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User as UserType, CleaningDay, Weeks, UserRegistration } from '@/types';
import { checkUserAccess, User } from '@/lib/auth';
import { PageLoader, BackgroundImage } from '@/components/ui';
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
    <BackgroundImage className="h-screen">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="relative z-10 container mx-auto px-4 py-8 h-full flex flex-col">
        <div className="overflow-y-auto flex-1">
          {/* Modern Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <Image
                  src="/freedom.png"
                  alt="Freedom City Tech Center"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight">
                Cleaning Day
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Registration
                </span>
              </h1>

              <div className="flex items-center justify-center gap-2 text-gray-300 text-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Freedom City Tech Center</span>
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>

              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Select your preferred cleaning day and help maintain our collaborative workspace
              </p>
            </div>
          </div>

          {/* Modern User Welcome */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">
                      Welcome back, {user.firstName}!
                    </h2>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${isRegistered
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  }`}>
                  {isRegistered ? '✓ Registered' : 'Available to Register'}
                </div>
              </div>
            </div>
          </div>

          {/* Modern Status Card */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className={`relative overflow-hidden rounded-2xl border p-8 transition-all duration-300 ${isRegistered
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
              }`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${isRegistered
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-orange-500/20 text-orange-400'
                  }`}>
                  <span className="text-2xl">{isRegistered ? '✓' : '📅'}</span>
                </div>
                <h2 className={`text-3xl font-bold mb-4 ${isRegistered
                  ? 'text-emerald-300'
                  : 'text-orange-300'
                  }`}>
                  {isRegistered ? '✓ Already Registered for Cleaning Day' : '📅 Choose Your Cleaning Day'}
                </h2>
                {!isRegistered && (
                  <p className="text-gray-100 text-xl md:text-2xl lg:text-3xl mb-8">
                    Select your preferred cleaning day from the options below
                  </p>
                )}
                {isRegistered && (
                  <p className="text-gray-100 text-xl md:text-2xl lg:text-3xl mb-8">
                    You have successfully registered for a cleaning day. Thank you for your participation!
                  </p>
                )}
                {isRegistered && userRegistrations.length > 0 && (
                  <div className="space-y-8">
                    {userRegistrations.map((registration, index) => (
                      <div key={index} className="glass-card rounded-3xl p-10 border-2 border-emerald-400/30 shadow-glow-lg">
                        <div className="flex items-center gap-6 mb-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-400/50">
                            <span className="text-white text-2xl font-bold">✓</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-emerald-100 text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                              {registration.dayName}
                            </h3>
                            <div className="bg-emerald-500/10 rounded-xl px-6 py-4 border border-emerald-400/30">
                              <p className="text-emerald-50 text-lg md:text-xl lg:text-2xl font-semibold">
                                📅 {registration.formattedDate}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-emerald-500/10 rounded-xl px-6 py-4 border border-emerald-400/30 text-center">
                          <p className="text-emerald-50 text-lg md:text-xl lg:text-2xl font-semibold">
                            ✅ Registration Confirmed
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="glass-card rounded-2xl p-6 border-2 border-yellow-400/30">
                      <p className="text-yellow-50 text-base md:text-lg lg:text-xl font-medium text-center">
                        ⚠️ Each student can only register for one cleaning day. Your registration is confirmed!
                      </p>
                    </div>
                  </div>
                )
                }
              </div>
            </div>
          </div>
        </div>

        {/* Modern Message Display */}
        {message && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${messageType === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
              : 'bg-red-500/10 border-red-500/30 text-red-100'
              }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${messageType === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                  }`}>
                  <span className="text-lg">{messageType === 'success' ? '✓' : '⚠️'}</span>
                </div>
                <p className="font-medium">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Day Selection */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6">
                <span className="text-2xl text-white">📅</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Choose Your Cleaning Day
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Select from the available days below. Each day has limited spots available.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent to-blue-400"></div>
                <h3 className="text-2xl font-bold text-white">
                  Week 1
                </h3>
                <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-transparent"></div>
              </div>
              <p className="text-center text-gray-400 mb-6">May 4-8, 2026</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeks[1]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay, index: number) => (
                  <div
                    key={day.id}
                    onClick={() => !day.isFull && setSelectedDay(day)}
                    className={`group relative glass-card rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden shadow-lg ${selectedDay?.id === day.id
                      ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/50 shadow-xl shadow-blue-400/40'
                      : day.isFull
                        ? 'bg-gray-500/20 border-gray-400/50 opacity-75 cursor-not-allowed'
                        : 'bg-white/10 border-white/30 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-indigo-500/20 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-400/30'
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Status Badge */}
                    {day.isFull && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        FULL
                      </div>
                    )}

                    {selectedDay?.id === day.id && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        SELECTED
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name="cleaningDay"
                          checked={selectedDay?.id === day.id}
                          onChange={() => setSelectedDay(day)}
                          disabled={day.isFull}
                          className={`w-6 h-6 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedDay?.id === day.id ? 'accent-blue-600' : 'accent-gray-600'
                            }`}
                        />
                        <div>
                          <h4 className={`font-bold text-2xl mb-2 ${day.isFull ? 'text-gray-200' : 'text-white'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 20px rgba(255, 255, 255, 0.3)'
                              : '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
                            letterSpacing: '0.02em'
                          }}>
                            {day.dayName}
                          </h4>
                          <p className={`text-base ${day.isFull ? 'text-gray-300' : 'text-cyan-200'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 15px rgba(255, 255, 255, 0.2)'
                              : '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
                            letterSpacing: '0.05em'
                          }}>
                            May {new Date(day.date).getDate()}, 2026
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-300 text-lg">👥</span>
                        </div>
                        <div>
                          <span className={`text-lg font-semibold ${day.isFull ? 'text-red-200' : 'text-cyan-300'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 15px rgba(239, 68, 68, 0.5)'
                              : '0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)',
                            letterSpacing: '0.05em'
                          }}>
                            {day.registeredCount}/{day.maxSlots}
                          </span>
                          <p className={`text-sm ${day.isFull ? 'text-gray-300' : 'text-cyan-100'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 10px rgba(255, 255, 255, 0.2)'
                              : '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(6, 182, 212, 0.3)',
                            letterSpacing: '0.08em'
                          }}>
                            Spots Available
                          </p>
                        </div>
                      </div>
                    </div>

                    {day.registeredUsers && day.registeredUsers.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-semibold text-cyan-100" style={{
                            textShadow: '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.4)',
                            letterSpacing: '0.08em'
                          }}>
                            Registered Students ({day.registeredUsers.length})
                          </h5>
                          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-gray-300 text-xs">📋</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {day.registeredUsers.map((user: UserType) => (
                            <div key={user.id} className="bg-white/10 rounded-lg p-3 border border-white/20">
                              <p className="text-cyan-100 text-sm font-medium" style={{
                                textShadow: '0 0 10px rgba(6, 182, 212, 0.4), 0 0 20px rgba(6, 182, 212, 0.3)',
                                letterSpacing: '0.05em'
                              }}>
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-1 bg-gradient-to-r from-transparent to-purple-400"></div>
                <h3 className="text-2xl font-bold text-white">
                  Week 2
                </h3>
                <div className="w-8 h-1 bg-gradient-to-r from-purple-400 to-transparent"></div>
              </div>
              <p className="text-center text-gray-400 mb-6">May 11-15, 2026</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeks[2]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                  <div
                    key={day.id}
                    onClick={() => !day.isFull && setSelectedDay(day)}
                    className={`group relative glass-card rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden shadow-lg ${selectedDay?.id === day.id
                      ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/50 shadow-xl shadow-blue-400/40'
                      : day.isFull
                        ? 'bg-gray-500/20 border-gray-400/50 opacity-75 cursor-not-allowed'
                        : 'bg-white/10 border-white/30 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-indigo-500/20 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-400/30'
                      }`}
                  >
                    {/* Status Badge */}
                    {day.isFull && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        FULL
                      </div>
                    )}

                    {selectedDay?.id === day.id && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        SELECTED
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name="cleaningDay"
                          checked={selectedDay?.id === day.id}
                          onChange={() => setSelectedDay(day)}
                          disabled={day.isFull}
                          className={`w-6 h-6 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedDay?.id === day.id ? 'accent-blue-600' : 'accent-gray-600'
                            }`}
                        />
                        <div>
                          <h4 className={`font-bold text-2xl mb-2 ${day.isFull ? 'text-gray-200' : 'text-white'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 20px rgba(255, 255, 255, 0.3)'
                              : '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
                            letterSpacing: '0.02em'
                          }}>
                            {day.dayName}
                          </h4>
                          <p className={`text-base ${day.isFull ? 'text-gray-300' : 'text-cyan-200'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 15px rgba(255, 255, 255, 0.2)'
                              : '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
                            letterSpacing: '0.05em'
                          }}>
                            May {new Date(day.date).getDate()}, 2026
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-300 text-lg">👥</span>
                        </div>
                        <div>
                          <span className={`text-lg font-semibold ${day.isFull ? 'text-red-200' : 'text-cyan-300'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 15px rgba(239, 68, 68, 0.5)'
                              : '0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)',
                            letterSpacing: '0.05em'
                          }}>
                            {day.registeredCount}/{day.maxSlots}
                          </span>
                          <p className={`text-sm ${day.isFull ? 'text-gray-300' : 'text-cyan-100'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 10px rgba(255, 255, 255, 0.2)'
                              : '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(6, 182, 212, 0.3)',
                            letterSpacing: '0.08em'
                          }}>
                            Spots Available
                          </p>
                        </div>
                      </div>
                    </div>

                    {day.registeredUsers && day.registeredUsers.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-semibold text-cyan-100" style={{
                            textShadow: '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.4)',
                            letterSpacing: '0.08em'
                          }}>
                            Registered Students ({day.registeredUsers.length})
                          </h5>
                          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-gray-300 text-xs">📋</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {day.registeredUsers.map((user: UserType) => (
                            <div key={user.id} className="bg-white/10 rounded-lg p-3 border border-white/20">
                              <p className="text-cyan-100 text-sm font-medium" style={{
                                textShadow: '0 0 10px rgba(6, 182, 212, 0.4), 0 0 20px rgba(6, 182, 212, 0.3)',
                                letterSpacing: '0.05em'
                              }}>
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg">
                Week 3 (May 18-22, 2026)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeks[3]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                  <div
                    key={day.id}
                    onClick={() => !day.isFull && setSelectedDay(day)}
                    className={`group relative glass-card rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden shadow-lg ${selectedDay?.id === day.id
                      ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/50 shadow-xl shadow-blue-400/40'
                      : day.isFull
                        ? 'bg-gray-500/20 border-gray-400/50 opacity-75 cursor-not-allowed'
                        : 'bg-white/10 border-white/30 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-indigo-500/20 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-400/30'
                      }`}
                  >
                    {/* Status Badge */}
                    {day.isFull && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        FULL
                      </div>
                    )}

                    {selectedDay?.id === day.id && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        SELECTED
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <input
                          type="radio"
                          name="cleaningDay"
                          checked={selectedDay?.id === day.id}
                          onChange={() => setSelectedDay(day)}
                          disabled={day.isFull}
                          className={`w-6 h-6 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${selectedDay?.id === day.id ? 'accent-blue-600' : 'accent-gray-600'
                            }`}
                        />
                        <div>
                          <h4 className={`font-bold text-2xl mb-2 ${day.isFull ? 'text-gray-200' : 'text-white'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 20px rgba(255, 255, 255, 0.3)'
                              : '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
                            letterSpacing: '0.02em'
                          }}>
                            {day.dayName}
                          </h4>
                          <p className={`text-base ${day.isFull ? 'text-gray-300' : 'text-cyan-200'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 15px rgba(255, 255, 255, 0.2)'
                              : '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
                            letterSpacing: '0.05em'
                          }}>
                            May {new Date(day.date).getDate()}, 2026
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-300 text-lg">👥</span>
                        </div>
                        <div>
                          <span className={`text-lg font-semibold ${day.isFull ? 'text-red-200' : 'text-cyan-300'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 15px rgba(239, 68, 68, 0.5)'
                              : '0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.4)',
                            letterSpacing: '0.05em'
                          }}>
                            {day.registeredCount}/{day.maxSlots}
                          </span>
                          <p className={`text-sm ${day.isFull ? 'text-gray-300' : 'text-cyan-100'}`} style={{
                            textShadow: day.isFull
                              ? '0 0 10px rgba(255, 255, 255, 0.2)'
                              : '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(6, 182, 212, 0.3)',
                            letterSpacing: '0.08em'
                          }}>
                            Spots Available
                          </p>
                        </div>
                      </div>
                    </div>

                    {day.registeredUsers && day.registeredUsers.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/20">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-semibold text-cyan-100" style={{
                            textShadow: '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.4)',
                            letterSpacing: '0.08em'
                          }}>
                            Registered Students ({day.registeredUsers.length})
                          </h5>
                          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                            <span className="text-gray-300 text-xs">📋</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {day.registeredUsers.map((user: UserType) => (
                            <div key={user.id} className="bg-white/10 rounded-lg p-3 border border-white/20">
                              <p className="text-cyan-100 text-sm font-medium" style={{
                                textShadow: '0 0 10px rgba(6, 182, 212, 0.4), 0 0 20px rgba(6, 182, 212, 0.3)',
                                letterSpacing: '0.05em'
                              }}>
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedDay || isRegistered}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${isRegistered || isLoading || !selectedDay
                  ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : isRegistered ? (
                  'Already Registered'
                ) : !selectedDay ? (
                  'Select a Day First'
                ) : (
                  'Register for Cleaning Day'
                )}
              </button>
              {isRegistered && (
                <div className="mt-6 animate-slide-in-up">
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 shadow-lg shadow-green-500/20">
                    <div className="text-center">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-2xl font-bold text-green-400 mb-3">
                        Registration Complete!
                      </h3>
                      <p className="text-white text-lg mb-4">
                        You have successfully registered for cleaning duty
                      </p>
                      <div className="bg-black/30 rounded-xl p-4 border border-white/20">
                        <p className="text-cyan-300 font-semibold text-lg">
                          📅 {userRegistrations[0]?.dayName}
                        </p>
                        <p className="text-white text-sm">
                          {userRegistrations[0]?.formattedDate}
                        </p>
                      </div>
                      <p className="text-yellow-300 text-sm mt-4 bg-yellow-600/20 rounded-lg p-3 border border-yellow-400/30">
                        ⚠️ Each student can only register for one cleaning day. Your registration is confirmed!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">📊</span>
              Go back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
