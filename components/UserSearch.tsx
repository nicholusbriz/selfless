'use client';

import { useState, useMemo } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  createdAt?: string | Date;
}

interface CourseRegistration {
  id: string;
  userId: string;
  userName?: string;
  religion?: string;
  courseName?: string;
  credits?: number;
  submittedAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

interface CleaningDayUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  formattedDate: string;
  dayId: string;
  email: string;
  phoneNumber?: string;
}

interface UserSearchProps {
  users: User[];
  courseRegistrations: CourseRegistration[];
  cleaningDays: CleaningDayUser[];
}

interface UserSearchResult {
  user: User;
  courses: CourseRegistration[];
  registeredDays: Array<{
    dayId: string;
    dayName: string;
    formattedDate: string;
    registrationId: string;
  }>;
}

export default function UserSearch({ users, courseRegistrations, cleaningDays }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    return users?.filter(user =>
      user.fullName?.toLowerCase().includes(term) ||
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    ) || [];
  }, [users, searchTerm]);

  // Get comprehensive user data
  const getUserData = (userId: string) => {
    // Find user in the users array
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    // Filter course registrations for this user
    const courses = courseRegistrations.filter(cr => cr.userId === userId);

    // Filter cleaning days for this user
    const registeredDays = cleaningDays
      ? cleaningDays
        .filter(registration => registration.id === userId)
        .map(registration => ({
          dayId: registration.dayId,
          dayName: 'Cleaning Day', // We don't have dayName in the new structure
          formattedDate: registration.formattedDate,
          registrationId: registration.id
        }))
      : [];

    return {
      user,
      courses,
      registeredDays
    };
  };

  const handleUserSelect = (userId: string) => {
    const userData = getUserData(userId);
    setSelectedUser(userData);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedUser(null);
  };

  return (
    <div className="bg-black/30 rounded-xl border border-white/20 p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white mb-3">User Search</h2>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value === '') {
                setSelectedUser(null);
              }
            }}
            className="w-full px-3 py-2 pl-9 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <span className="text-sm">🔍</span>
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1.5 px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs hover:bg-red-600/30 transition-colors duration-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && filteredUsers.length > 0 && !selectedUser && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className="bg-white/10 rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {user.fullName || `${user.firstName} ${user.lastName}`}
                    </h4>
                    <p className="text-xs text-gray-300 truncate">{user.email}</p>
                    {user.phoneNumber && (
                      <p className="text-xs text-green-400">📱 {user.phoneNumber}</p>
                    )}
                  </div>
                  <span className="text-blue-400 text-xs ml-2">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchTerm && filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">
            <span className="text-2xl mb-2 block">🔍</span>
            No users found for &quot;{searchTerm}&quot;
          </div>
        </div>
      )}

      {/* Selected User Details */}
      {selectedUser && (
        <div className="space-y-4">
          {/* User Info Header */}
          <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-400/30">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-white">
                {selectedUser.user.fullName || `${selectedUser.user.firstName} ${selectedUser.user.lastName}`}
              </h3>
              <button
                onClick={clearSearch}
                className="text-gray-300 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-300">Email:</span>
                <span className="text-white ml-1">{selectedUser.user.email}</span>
              </div>
              <div>
                <span className="text-gray-300">Phone:</span>
                <span className="text-green-400 ml-1">
                  {selectedUser.user.phoneNumber || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Joined:</span>
                <span className="text-white ml-1">
                  {selectedUser.user.createdAt
                    ? new Date(selectedUser.user.createdAt.toString()).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-300">User ID:</span>
                <span className="text-gray-400 ml-1 text-xs">{selectedUser.user.id}</span>
              </div>
            </div>
          </div>

          {/* Course Registrations */}
          <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-400/30">
            <h4 className="text-base font-semibold text-white mb-3">
              📚 Course Registrations ({selectedUser.courses.length})
            </h4>
            {selectedUser.courses.length > 0 ? (
              <div className="space-y-2">
                {selectedUser.courses.map((course) => (
                  <div key={course.id} className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-white text-sm mb-1">
                          {course.courseName || 'No courses specified'}
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-300">Credits:</span>
                            <span className="text-white ml-1">{course.credits || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-300">Religion:</span>
                            <span className={`ml-1 ${course.religion === 'Yes' ? 'text-green-400' : 'text-gray-400'}`}>
                              {course.religion === 'Yes' ? '✓ Yes' : '✗ No'}
                            </span>
                          </div>
                        </div>
                        {course.submittedAt && (
                          <p className="text-xs text-gray-300 mt-1">
                            Registered: {new Date(course.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-sm">No course registrations found</p>
            )}
          </div>

          {/* Registered Days */}
          <div className="bg-green-600/20 rounded-lg p-3 border border-green-400/30">
            <h4 className="text-base font-semibold text-white mb-3">
              📅 Registered Cleaning Days ({selectedUser.registeredDays.length})
            </h4>
            {selectedUser.registeredDays.length > 0 ? (
              <div className="space-y-2">
                {selectedUser.registeredDays.map((day) => (
                  <div key={`${day.dayId}-${day.registrationId}`} className="bg-white/10 rounded-lg p-3 border border-white/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-white text-sm">{day.dayName}</h5>
                        <p className="text-xs text-gray-300">{day.formattedDate}</p>
                      </div>
                      <span className="text-green-400 text-xs">✓ Registered</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300 text-sm">No cleaning day registrations found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
