'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, CleaningDay, Weeks, UserRegistration } from '@/types';

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


  // Check authentication and registration status on page load
  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log('User data loaded:', parsedUser);

    // Check user's registration status
    const checkUserStatus = async () => {
      setUser(parsedUser);
      try {
        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: parsedUser.id }),
        });

        const data = await response.json();

        if (data.success) {
          setIsRegistered(data.isRegistered);
          setUserRegistrations(data.registrations || []);
          setUser(data.user);
        } else {
          // User not found (likely deleted by admin)
          if (response.status === 404) {
            setMessage('Your account has been removed. Please log in again.');
            setMessageType('error');
            // Clear invalid session and redirect
            localStorage.removeItem('user');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkUserStatus();
  }, [router]);

  // Fetch cleaning days and set selected day for registered users
  useEffect(() => {
    const fetchCleaningDays = async () => {
      try {
        const response = await fetch('/api/cleaning-days');
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
      } catch (error) {
        console.error('Error fetching cleaning days:', error);
      }
    };

    fetchCleaningDays();
  }, [isRegistered, userRegistrations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user is logged in
    if (!user || !user.id) {
      setMessage('User session expired. Please log in again.');
      setMessageType('error');
      // Clear invalid session and redirect
      localStorage.removeItem('user');
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

      console.log('Submitting with user data:', { userId: user.id, user });
      const response = await fetch('/api/form-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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

        setMessage(`${userName}, you have successfully registered for ${dayName}, ${formattedDate}! Thank you for signing up.`);
        setMessageType('success');
        setSelectedDay(null);

        // Immediately refresh the cleaning days to show the new registration
        const daysResponse = await fetch('/api/cleaning-days');
        const daysData = await daysResponse.json();
        if (daysData.success) {
          setWeeks(daysData.weeks);
        }

        // Refresh user status
        const statusResponse = await fetch('/api/user-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id }),
        });
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setIsRegistered(statusData.isRegistered);
          setUserRegistrations(statusData.registrations);
        }
      } else {
        // Handle specific error cases
        if (response.status === 404 && data.message?.includes('User not found')) {
          setMessage('Your session has expired. Please log in again.');
          setMessageType('error');
          // Clear invalid session and redirect
          localStorage.removeItem('user');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setMessage(data.message || 'Failed to register for cleaning day');
          setMessageType('error');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-6"></div>
          <p className="text-white text-xl font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-4 mb-4">
            {user?.email && ['atbriz256@gmail.com', 'kiwanukatonny@gmail.com'].includes(user.email) && (
              <button
                onClick={() => router.push('/admin')}
                className="bg-purple-600/20 backdrop-blur-sm text-purple-300 py-2 px-4 rounded-full font-medium hover:bg-purple-600/30 transition-all duration-300 transform hover:scale-105 border border-purple-500/50 text-sm"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={() => {
                // Refresh cleaning days data
                const fetchCleaningDays = async () => {
                  try {
                    const response = await fetch('/api/cleaning-days');
                    const data = await response.json();
                    if (data.success) {
                      setWeeks(data.weeks);
                    }
                  } catch (error) {
                    console.error('Error refreshing data:', error);
                  }
                };
                fetchCleaningDays();
              }}
              className="bg-cyan-600/20 backdrop-blur-sm text-cyan-300 py-2 px-4 rounded-full font-medium hover:bg-cyan-600/30 transition-all duration-300 transform hover:scale-105 border border-cyan-500/50 text-sm"
            >
              🔄 Refresh Data
            </button>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome, {user.fullName || `${user.firstName} ${user.lastName}`}!
          </h1>
          <p className="text-cyan-300 text-lg mb-2">
            Selfless CE Freedom City Tech Center
          </p>
          <p className="text-gray-300">
            {isRegistered ? "You&apos;re all set for cleaning duty!" : "Choose your preferred cleaning day"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl ${isRegistered
            ? 'border-green-500/30'
            : 'border-white/20'
            }`}>
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${isRegistered ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                <span className="text-3xl text-white">
                  {isRegistered ? '✓' : '+'}
                </span>
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${isRegistered ? 'text-green-400' : 'text-orange-400'
                }`}>
                {isRegistered ? 'Already Registered!' : 'Choose Your Cleaning Day'}
              </h2>
              {!isRegistered && (
                <p className="text-gray-300 text-lg mb-4">
                  You haven&apos;t registered for any cleaning day yet. Please select your preferred day below.
                </p>
              )}
              {isRegistered && userRegistrations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-emerald-400 text-xl font-bold">
                        ✓ Already Registered!
                      </p>
                      <p className="text-emerald-300 text-lg">
                        You have registered to work on:
                      </p>
                    </div>
                  </div>
                  {userRegistrations.map((registration, index) => (
                    <div key={index} className="bg-gradient-to-r from-emerald-600/30 to-green-600/30 backdrop-blur-sm rounded-2xl p-6 inline-block border border-emerald-400/50 shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">✓</span>
                        </div>
                        <div>
                          <p className="text-emerald-300 font-bold text-2xl">
                            {registration.dayName}
                          </p>
                          <div className="bg-emerald-600/20 rounded-lg px-4 py-2 border border-emerald-400/30 mb-2">
                            <p className="text-emerald-200 text-sm font-medium">
                              📅 {registration.formattedDate}
                            </p>
                          </div>
                          <p className="text-white text-sm text-emerald-200/80">
                            Registration Date
                          </p>
                        </div>
                      </div>
                      <div className="bg-emerald-600/20 rounded-lg px-3 py-2 border border-emerald-400/30">
                        <p className="text-emerald-200 text-sm font-medium">
                          📅 Registration confirmed
                        </p>
                      </div>
                    </div>
                  ))}
                  <p className="text-yellow-400 text-sm mt-4 bg-yellow-600/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                    ⚠️ You cannot register again as each student can only work on one day.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className={`max-w-4xl mx-auto mb-8`}>
            <div className={`rounded-lg p-4 text-center ${messageType === 'success'
              ? 'bg-green-600/20 border border-green-400/30'
              : 'bg-red-600/20 border border-red-400/30'
              }`}>
              <p className={`text-lg font-medium ${messageType === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Choose Your Cleaning Day
            </h2>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Week 1 (May 4-8, 2026)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeks[1]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                  <div
                    key={day.id}
                    onClick={() => !day.isFull && setSelectedDay(day)}
                    className={`bg-black/50 rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${selectedDay?.id === day.id
                      ? 'bg-black/70 border-cyan-400 shadow-lg shadow-cyan-500/25'
                      : day.isFull
                        ? 'bg-black/40 border-gray-400/50 opacity-50 cursor-not-allowed'
                        : 'bg-black/50 border-white/20 hover:bg-black/60 hover:border-cyan-400/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="cleaningDay"
                          checked={selectedDay?.id === day.id}
                          onChange={() => setSelectedDay(day)}
                          disabled={day.isFull}
                          className={`w-5 h-5 accent-cyan-600 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                        <div>
                          <h4 className={`font-bold text-lg ${day.isFull ? 'text-gray-400' : 'text-white'}`}>
                            {day.dayName}
                          </h4>
                          <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-white/70'}`}>
                            May {new Date(day.date).getDate()}, 2026
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${day.isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                          {day.registeredCount}/{day.maxSlots} Registered
                        </span>
                        {day.isFull && (
                          <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-400/30 ml-2">
                            FULL
                          </span>
                        )}
                      </div>
                    </div>

                    {day.registeredUsers && day.registeredUsers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h5 className="text-sm font-semibold text-cyan-300 mb-2">
                          Registered Students ({day.registeredUsers.length}):
                        </h5>
                        <div className="space-y-1">
                          {day.registeredUsers.map((user: User) => (
                            <div key={user.id} className="bg-black/30 rounded p-2 border border-white/20">
                              <p className="text-white text-xs font-medium">
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
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Week 2 (May 11-15, 2026)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeks[2]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                  <div
                    key={day.id}
                    onClick={() => !day.isFull && setSelectedDay(day)}
                    className={`bg-black/50 rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${selectedDay?.id === day.id
                      ? 'bg-black/70 border-cyan-400 shadow-lg shadow-cyan-500/25'
                      : day.isFull
                        ? 'bg-black/40 border-gray-400/50 opacity-50 cursor-not-allowed'
                        : 'bg-black/50 border-white/20 hover:bg-black/60 hover:border-cyan-400/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="cleaningDay"
                          checked={selectedDay?.id === day.id}
                          onChange={() => setSelectedDay(day)}
                          disabled={day.isFull}
                          className={`w-5 h-5 accent-cyan-600 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                        <div>
                          <h4 className={`font-bold text-lg ${day.isFull ? 'text-gray-400' : 'text-white'}`}>
                            {day.dayName}
                          </h4>
                          <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-white/70'}`}>
                            May {new Date(day.date).getDate()}, 2026
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${day.isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                          {day.registeredCount}/{day.maxSlots} Registered
                        </span>
                        {day.isFull && (
                          <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-400/30 ml-2">
                            FULL
                          </span>
                        )}
                      </div>
                    </div>

                    {day.registeredUsers && day.registeredUsers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h5 className="text-sm font-semibold text-cyan-300 mb-2">
                          Registered Students ({day.registeredUsers.length}):
                        </h5>
                        <div className="space-y-1">
                          {day.registeredUsers.map((user: User) => (
                            <div key={user.id} className="bg-black/30 rounded p-2 border border-white/20">
                              <p className="text-white text-xs font-medium">
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
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Week 3 (May 18-22, 2026)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeks[3]?.filter((day: CleaningDay) => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day.dayName)).map((day: CleaningDay) => (
                  <div
                    key={day.id}
                    onClick={() => !day.isFull && setSelectedDay(day)}
                    className={`bg-black/50 rounded-2xl p-6 border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${selectedDay?.id === day.id
                      ? 'bg-black/70 border-cyan-400 shadow-lg shadow-cyan-500/25'
                      : day.isFull
                        ? 'bg-black/40 border-gray-400/50 opacity-50 cursor-not-allowed'
                        : 'bg-black/50 border-white/20 hover:bg-black/60 hover:border-cyan-400/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="cleaningDay"
                          checked={selectedDay?.id === day.id}
                          onChange={() => setSelectedDay(day)}
                          disabled={day.isFull}
                          className={`w-5 h-5 accent-cyan-600 ${day.isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                        <div>
                          <h4 className={`font-bold text-lg ${day.isFull ? 'text-gray-400' : 'text-white'}`}>
                            {day.dayName}
                          </h4>
                          <p className={`text-sm ${day.isFull ? 'text-gray-500' : 'text-white/70'}`}>
                            May {new Date(day.date).getDate()}, 2026
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${day.isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                          {day.registeredCount}/{day.maxSlots} Registered
                        </span>
                        {day.isFull && (
                          <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full border border-red-400/30 ml-2">
                            FULL
                          </span>
                        )}
                      </div>
                    </div>

                    {day.registeredUsers && day.registeredUsers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h5 className="text-sm font-semibold text-cyan-300 mb-2">
                          Registered Students ({day.registeredUsers.length}):
                        </h5>
                        <div className="space-y-1">
                          {day.registeredUsers.map((user: User) => (
                            <div key={user.id} className="bg-black/30 rounded p-2 border border-white/20">
                              <p className="text-white text-xs font-medium">
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

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={isLoading || !selectedDay || isRegistered}
                className={`py-4 px-8 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${isRegistered
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700 focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-purple-500/25'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Registering...
                  </span>
                ) : isRegistered ? (
                  'Already Registered - Cannot Register Again'
                ) : (
                  'Register for Selected Day'
                )}
              </button>
              {isRegistered && (
                <p className="text-yellow-400 text-sm mt-3">
                  You have already registered to work on {userRegistrations[0]?.dayName}, {userRegistrations[0]?.formattedDate}. Each student can only register for one day.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => {
              localStorage.removeItem('user');
              router.push('/');
            }}
            className="bg-white/20 backdrop-blur-sm text-white py-3 px-6 rounded-full font-medium hover:bg-white/30 transition-all duration-300 transform hover:scale-105 border border-white/30"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="text-center mt-8 pt-6 border-t border-white/20">
        <p className="text-xs text-white/60 mb-2">
          Developed by{' '}
          <a
            href="mailto:atbriz256@gmail.com"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Atbriz Nicholus
          </a>
        </p>
        <p className="text-xs text-white/50">
          Software Developer | Zana, Kampala, Uganda
        </p>
      </div>
    </div>
  );
}
