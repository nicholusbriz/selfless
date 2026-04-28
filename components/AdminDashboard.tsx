'use client';

import { useState, useEffect } from 'react';
import ExcelExporter from './ExcelExporter';
import Announcements from './Announcements';
import TutorManagement from './TutorManagement';
import AdminManagement from './AdminManagement';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  createdAt?: string | Date;
}

interface CourseSubmission {
  id: string;
  userId: string;
  userName: string;
  religion?: string;
  courseName: string;
  credits: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AdminDashboardProps {
  adminId: string;
  adminEmail: string;
  adminName: string;
  isSuperAdmin?: boolean;
  initialSection?: 'overview' | 'users' | 'courses' | 'registered-days' | 'system' | 'communication' | 'security' | 'reporting' | 'announcements' | 'tutors' | 'admins';
  showOnlySection?: boolean;
  onStatsRefresh?: () => void; // Function to refresh dashboard statistics
}

export default function AdminDashboard({ adminId, adminEmail, adminName, isSuperAdmin = false, initialSection = 'overview', showOnlySection = false, onStatsRefresh }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [courseSubmissions, setCourseSubmissions] = useState<CourseSubmission[]>([]);
  const [registeredDays, setRegisteredDays] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    formattedDate: string;
    dayId: string;
    phoneNumber?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real users from your existing API
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();

        // Fetch real course submissions from your existing API
        const coursesResponse = await fetch('/api/all-course-registrations');
        const coursesData = await coursesResponse.json();

        // Fetch registered days data
        const cleaningResponse = await fetch('/api/cleaning-days');
        const cleaningData = await cleaningResponse.json();

        if (usersData.success) {
          setUsers(usersData.users || []);
        }

        if (coursesData.success) {
          // Transform course registrations to match expected format
          const transformedSubmissions = coursesData.registrations.map((reg: {
            id: string;
            userId: string;
            user?: { fullName?: string; firstName?: string; lastName?: string };
            takesReligion?: boolean;
            courses?: Array<{ name: string }>;
            totalCredits?: number;
            registrationDate?: string;
            createdAt?: string;
            status?: string;
          }) => ({
            id: reg.id,
            userId: reg.userId,
            userName: reg.user?.fullName || `${reg.user?.firstName || ''} ${reg.user?.lastName || ''}`.trim(),
            religion: reg.takesReligion ? 'Yes' : 'No',
            courseName: reg.courses?.map((c: { name: string }) => c.name).join(', ') || 'Unknown',
            credits: reg.totalCredits || 0,
            submittedAt: reg.registrationDate || reg.createdAt || new Date().toISOString(),
            status: (reg.status || 'approved') as 'pending' | 'approved' | 'rejected'
          }));
          setCourseSubmissions(transformedSubmissions);
        }

        if (cleaningData.success && cleaningData.weeks) {
          // Fetch users to get phone numbers from credentials
          const usersResponse = await fetch('/api/users');
          const usersData = await usersResponse.json();

          // Check if usersData is an array, if not, try to extract it
          const usersArray = Array.isArray(usersData) ? usersData : usersData?.users || [];

          // Flatten all registered users from all weeks and days
          const allRegisteredUsers: Array<{
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
            formattedDate: string;
            dayId: string;
            phoneNumber?: string;
          }> = [];
          (Object.values(cleaningData.weeks) as Array<Array<{
            id: string;
            formattedDate: string;
            registeredUsers?: Array<{
              id: string;
              firstName: string;
              lastName: string;
              fullName: string;
            }>;
          }>>).forEach((weekDays) => {
            weekDays.forEach((day) => {
              if (day.registeredUsers && day.registeredUsers.length > 0) {
                day.registeredUsers.forEach((registeredUser) => {
                  // Find the user's full credentials to get phone number
                  const userCredentials = usersArray.find((user: User) => user.id === registeredUser.id);

                  allRegisteredUsers.push({
                    ...registeredUser,
                    formattedDate: day.formattedDate,
                    dayId: day.id,
                    // Get phone number from user credentials, not from registered data
                    phoneNumber: userCredentials?.phoneNumber || userCredentials?.phone || ''
                  });
                });
              }
            });
          });
          setRegisteredDays(allRegisteredUsers);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Refresh function for individual data types
  const refreshUsers = async () => {
    try {
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const refreshCourses = async () => {
    try {
      const coursesResponse = await fetch('/api/all-course-registrations');
      const coursesData = await coursesResponse.json();
      if (coursesData.success) {
        const transformedSubmissions = coursesData.registrations.map((reg: {
          id: string;
          userId: string;
          user?: { fullName?: string; firstName?: string; lastName?: string };
          takesReligion?: boolean;
          courses?: Array<{ name: string }>;
          totalCredits?: number;
          registrationDate?: string;
          createdAt?: string;
          status?: string;
        }) => ({
          id: reg.id,
          userId: reg.userId,
          userName: reg.user?.fullName || `${reg.user?.firstName || ''} ${reg.user?.lastName || ''}`.trim(),
          religion: reg.takesReligion ? 'Yes' : 'No',
          courseName: reg.courses?.map((c: { name: string }) => c.name).join(', ') || 'Unknown',
          credits: reg.totalCredits || 0,
          submittedAt: reg.registrationDate || reg.createdAt || new Date().toISOString(),
          status: (reg.status || 'approved') as 'pending' | 'approved' | 'rejected'
        }));
        setCourseSubmissions(transformedSubmissions);
      }
    } catch (error) {
      console.error('Error refreshing courses:', error);
    }
  };

  const refreshRegisteredDays = async () => {
    try {
      const cleaningResponse = await fetch('/api/cleaning-days');
      const cleaningData = await cleaningResponse.json();

      if (cleaningData.success && cleaningData.weeks) {
        // Fetch users to get phone numbers from credentials
        const usersResponse = await fetch('/api/users');
        const usersData = await usersResponse.json();

        // Check if usersData is an array, if not, try to extract it
        const usersArray = Array.isArray(usersData) ? usersData : usersData?.users || [];

        const allRegisteredUsers: Array<{
          id: string;
          firstName: string;
          lastName: string;
          fullName: string;
          formattedDate: string;
          dayId: string;
          phoneNumber?: string;
        }> = [];
        (Object.values(cleaningData.weeks) as Array<Array<{
          id: string;
          formattedDate: string;
          registeredUsers?: Array<{
            id: string;
            firstName: string;
            lastName: string;
            fullName: string;
          }>;
        }>>).forEach((weekDays) => {
          weekDays.forEach((day) => {
            if (day.registeredUsers && day.registeredUsers.length > 0) {
              day.registeredUsers.forEach((registeredUser) => {
                // Find the user's full credentials to get phone number
                const userCredentials = usersArray.find((user: User) => user.id === registeredUser.id);

                allRegisteredUsers.push({
                  ...registeredUser,
                  formattedDate: day.formattedDate,
                  dayId: day.id,
                  // Get phone number from user credentials, not from registered data
                  phoneNumber: userCredentials?.phoneNumber || userCredentials?.phone || ''
                });
              });
            }
          });
        });
        setRegisteredDays(allRegisteredUsers);
      }
    } catch (error) {
      console.error('Error refreshing registered days:', error);
    }
  };


  // Clear course submissions
  const clearCourseSubmissions = async (submissionId: string, userName: string, courseName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to clear ${userName}'s course submission for "${courseName}"?\n\nThis will:\n• Remove this course registration\n• Allow the user to register again\n• Keep their account active\n• Update their total credits\n\nThis action can be undone by re-registering for the course.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/courses/clear?id=${submissionId}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        // Update course submissions list to remove cleared submission
        setCourseSubmissions(courseSubmissions.filter(sub => sub.id !== submissionId));
        alert(`${userName}'s course submission cleared successfully! They can register again.`);
      } else {
        alert(data.message || 'Failed to clear course submission');
      }
    } catch (error) {
      console.error('Clear course submission error:', error);
      alert('Network error occurred');
    }
  };

  // Delete user permanently (from your existing admin page)
  const deleteUserPermanently = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION ⚠️\n\nAre you sure you want to permanently delete ${userName}?\n\nThis will:\n• Delete their account permanently\n• Remove email, password, and all user data\n• Delete all their cleaning day registrations\n• Update the cleaning day counts\n• They will need to register again to access the system\n\nThis action CANNOT be undone!`
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      `FINAL CONFIRMATION\n\nYou are about to permanently delete ${userName} from the database.\n\nType "DELETE" to confirm or click Cancel to abort.`
    );

    if (!doubleConfirmed) return;

    try {
      const response = await fetch(`/api/users/permanent?id=${userId}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        // Update user list to remove deleted user
        setUsers(users.filter(user => user.id !== userId));
        alert(`${userName} permanently deleted successfully!`);

        // Refresh dashboard statistics to update remaining days
        if (onStatsRefresh) {
          onStatsRefresh();
        }
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Network error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {initialSection === 'users' ? 'All Users' :
              initialSection === 'courses' ? 'Course Submissions' :
                initialSection === 'system' ? 'System Administration' :
                  initialSection === 'communication' ? 'Communication Management' :
                    initialSection === 'security' ? 'Security & Compliance' :
                      initialSection === 'reporting' ? 'Reporting & Analytics' :
                        initialSection === 'announcements' ? 'Announcements Management' : 'Dashboard'}
          </h1>
        </div>

        {/* Show only the requested section */}
        {initialSection === 'users' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">All Users ({users.length})</h2>
                  <button
                    onClick={refreshUsers}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span className="animate-spin">🔄</span>
                    Refresh Data
                  </button>
                </div>
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.fullName || `${user.firstName} ${user.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs rounded-full ${user.email?.includes('admin')
                            ? 'bg-purple-100 text-purple-800 border-purple-200 border'
                            : 'bg-gray-100 text-gray-800 border-gray-200 border'
                            }`}>
                            {user.email?.includes('admin') ? 'admin' : 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.phoneNumber ? (
                            <span className="text-green-600">📱 {user.phoneNumber}</span>
                          ) : (
                            <span className="text-orange-600 italic">No phone</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? formatDate(user.createdAt.toString()) : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => deleteUserPermanently(user.id, user.fullName || `${user.firstName} ${user.lastName}`)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            title="Permanently delete user account"
                          >
                            Delete User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - No Scrolling */}
              <div className="lg:hidden">
                <div className="grid grid-cols-1 gap-3 p-4 max-h-screen overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {user.fullName || `${user.firstName} ${user.lastName}`}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${user.email?.includes('admin')
                          ? 'bg-purple-100 text-purple-800 border-purple-200 border'
                          : 'bg-gray-100 text-gray-800 border-gray-200 border'
                          }`}>
                          {user.email?.includes('admin') ? 'admin' : 'user'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div>
                          <span className="text-gray-500">Phone:</span>
                          {user.phoneNumber ? (
                            <span className="text-green-600 ml-1">📱 {user.phoneNumber}</span>
                          ) : (
                            <span className="text-orange-600 italic ml-1">No phone</span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Joined:</span>
                          <span className="text-gray-700 ml-1">
                            {user.createdAt ? formatDate(user.createdAt.toString()) : 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={() => deleteUserPermanently(user.id, user.fullName || `${user.firstName} ${user.lastName}`)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                          title="Permanently delete user account"
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Users Data */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Users Data</h3>
              <ExcelExporter
                data={users.map(user => ({
                  'Full Name': user.fullName || `${user.firstName} ${user.lastName}`,
                  'Email': user.email || '',
                  'Phone Number': user.phoneNumber || 'Not provided',
                  'Role': user.email?.includes('admin') ? 'admin' : 'user',
                  'Joined Date': user.createdAt ? formatDate(user.createdAt.toString()) : 'Unknown'
                }))}
                filename="users.csv"
                className="mb-2"
              >
                📊 Export All Users
              </ExcelExporter>
            </div>
          </>
        )}

        {initialSection === 'courses' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Course Submissions ({courseSubmissions.length})</h2>
                  <button
                    onClick={refreshCourses}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span className="animate-spin">🔄</span>
                    Refresh Data
                  </button>
                </div>
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Religion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courseSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {submission.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${submission.religion === 'Yes'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-sm'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                            {submission.religion === 'Yes' && <span className="text-green-600">✓</span>}
                            {submission.religion}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.courseName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.credits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => clearCourseSubmissions(submission.id, submission.userName, submission.courseName)}
                            className="text-orange-600 hover:text-orange-900 text-xs font-medium"
                            title="Clear course submission (allow re-registration)"
                          >
                            Clear Submission
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - No Scrolling */}
              <div className="lg:hidden">
                <div className="grid grid-cols-1 gap-3 p-4 max-h-screen overflow-y-auto">
                  {courseSubmissions.map((submission) => (
                    <div key={submission.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {submission.userName}
                          </h3>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${submission.religion === 'Yes'
                          ? 'bg-green-100 text-green-800 border-2 border-green-300 shadow-sm'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                          {submission.religion === 'Yes' && <span className="text-green-600">✓</span>}
                          {submission.religion}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-gray-500">Courses:</span>
                          <span className="text-gray-700 ml-1 block mt-1">{submission.courseName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Credits:</span>
                          <span className="text-gray-700 ml-1 font-medium">{submission.credits}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={() => clearCourseSubmissions(submission.id, submission.userName, submission.courseName)}
                          className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 px-3 rounded text-xs font-medium transition-colors"
                          title="Clear course submission (allow re-registration)"
                        >
                          Clear Submission
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Courses Data */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Courses Data</h3>
              <ExcelExporter
                data={courseSubmissions.map(submission => ({
                  'Student Name': submission.userName || '',
                  'Religion': submission.religion || '',
                  'Course Name': submission.courseName || '',
                  'Credits': String(submission.credits || 0)
                }))}
                filename="course-submissions.csv"
                className="mb-2"
              >
                📊 Export Course Submissions
              </ExcelExporter>
            </div>
          </>
        )}

        {initialSection === 'system' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">System Administration</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">⚙️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">System Settings</h3>
                  <p className="text-sm text-gray-600 mb-4">Platform configuration and system-wide settings</p>
                  <button
                    onClick={() => alert('System Settings - Coming Soon!')}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Configure
                  </button>
                </div>

                <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">System Analytics</h3>
                  <p className="text-sm text-gray-600 mb-4">Monitor system performance and usage metrics</p>
                  <button
                    onClick={() => alert('System Analytics - Coming Soon!')}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Analytics
                  </button>
                </div>

                <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🗂️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Management</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage system data and database operations</p>
                  <button
                    onClick={() => alert('Data Management - Coming Soon!')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Manage Data
                  </button>
                </div>

                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">System Logs</h3>
                  <p className="text-sm text-gray-600 mb-4">View system logs and audit trails</p>
                  <button
                    onClick={() => alert('System Logs - Coming Soon!')}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {initialSection === 'registered-days' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Registered Days ({registeredDays.length})</h2>
                  <button
                    onClick={refreshRegisteredDays}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span className="animate-spin">🔄</span>
                    Refresh Data
                  </button>
                </div>
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registeredDays.map((registration) => (
                      <tr key={`${registration.dayId}-${registration.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.fullName || `${registration.firstName} ${registration.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.phoneNumber || 'Not provided'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.formattedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Are you sure you want to remove ${registration.fullName || `${registration.firstName} ${registration.lastName}`} from ${registration.formattedDate}?\n\nThis will:\n• Remove them from this cleaning day registration\n• Remove them from the registered list\n• Keep their account active in the database\n• They can register again for any available day\n\nTheir account will remain for future registrations.`
                              );

                              if (confirmed) {
                                console.log(`Removing user from day: ${registration.id} from day: ${registration.dayId}`);
                                alert('Remove from day functionality would be implemented here');
                              }
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            title="Remove from this cleaning day (keep account)"
                          >
                            Remove from Day
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {registeredDays.map((registration) => (
                  <div key={`${registration.dayId}-${registration.id}`} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {registration.fullName || `${registration.firstName} ${registration.lastName}`}
                        </h4>
                        <p className="text-sm text-gray-500">{registration.phoneNumber || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p> {registration.formattedDate}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Are you sure you want to remove ${registration.fullName || `${registration.firstName} ${registration.lastName}`} from ${registration.formattedDate}?\n\nThis will:\n• Remove them from this cleaning day registration\n• Remove them from the registered list\n• Keep their account active in the database\n• They can register again for any available day\n\nTheir account will remain for future registrations.`
                          );

                          if (confirmed) {
                            console.log(`Removing user from day: ${registration.id} from day: ${registration.dayId}`);
                            alert('Remove from day functionality would be implemented here');
                          }
                        }}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-xs font-medium transition-colors"
                        title="Remove from this cleaning day (keep account)"
                      >
                        Remove from Day
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Registered Days Data */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Registered Days Data</h3>
              <ExcelExporter
                data={registeredDays.map(registration => ({
                  'Student Name': registration.fullName || `${registration.firstName} ${registration.lastName}`,
                  'Phone Number': registration.phoneNumber || 'Not provided',
                  'Registered Date': registration.formattedDate || ''
                }))}
                filename="registered-days.csv"
                className="mb-2"
              >
                📊 Export Registered Days
              </ExcelExporter>
            </div>
          </>
        )}

        {initialSection === 'communication' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Communication Management</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📢</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Announcements</h3>
                  <p className="text-sm text-gray-600 mb-4">Create and manage system announcements</p>
                  <button
                    onClick={() => {
                      // Scroll to announcements section
                      const element = document.querySelector('[data-section="announcements"]');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.scrollTo({ top: 600, behavior: 'smooth' });
                      }
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Manage
                  </button>
                </div>

                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🔔</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
                  <p className="text-sm text-gray-600 mb-4">User notifications and alerts management</p>
                  <button
                    onClick={() => alert('Notifications - Coming Soon!')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Configure
                  </button>
                </div>

                <div className="text-center p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📧</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Management</h3>
                  <p className="text-sm text-gray-600 mb-4">Email templates and delivery settings</p>
                  <button
                    onClick={() => alert('Email Management - Coming Soon!')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Settings
                  </button>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">💬</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">SMS Management</h3>
                  <p className="text-sm text-gray-600 mb-4">SMS templates and delivery configuration</p>
                  <button
                    onClick={() => alert('SMS Management - Coming Soon!')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {initialSection === 'announcements' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Announcements Management</h2>
            </div>

            <div className="p-6">
              <Announcements
                isAdmin={true}
                adminId={adminId}
                adminEmail={adminEmail}
                adminName={adminName}
              />
            </div>
          </div>
        )}

        {initialSection === 'tutors' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Tutor Management</h2>
              <p className="text-sm text-gray-600 mt-1">Add and manage tutor permissions for announcements</p>
            </div>

            <div className="p-6">
              <TutorManagement
                adminId={adminId}
                adminEmail={adminEmail}
                adminName={adminName}
              />
            </div>
          </div>
        )}

        {initialSection === 'admins' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Admin Management</h2>
              <p className="text-sm text-gray-600 mt-1">Manage administrators (Cannot remove super admin)</p>
            </div>

            <div className="p-6">
              <AdminManagement
                adminId={adminId}
                adminEmail={adminEmail}
                adminName={adminName}
                isSuperAdmin={isSuperAdmin}
              />
            </div>
          </div>
        )}


        {initialSection === 'security' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Security & Compliance</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Security Settings</h3>
                  <p className="text-sm text-gray-600 mb-4">System security and access control</p>
                  <button
                    onClick={() => alert('Security Settings - Coming Soon!')}
                    className="bg-rose-600 hover:bg-rose-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Configure
                  </button>
                </div>

                <div className="text-center p-6 bg-pink-50 rounded-lg border border-pink-200">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Audit Logs</h3>
                  <p className="text-sm text-gray-600 mb-4">Security audit trails and logs</p>
                  <button
                    onClick={() => alert('Audit Logs - Coming Soon!')}
                    className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Logs
                  </button>
                </div>

                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">🔐</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Access Control</h3>
                  <p className="text-sm text-gray-600 mb-4">User permissions and access management</p>
                  <button
                    onClick={() => alert('Access Control - Coming Soon!')}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Manage Access
                  </button>
                </div>

                <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📜</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Compliance</h3>
                  <p className="text-sm text-gray-600 mb-4">Regulatory compliance and reporting</p>
                  <button
                    onClick={() => alert('Compliance - Coming Soon!')}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Compliance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {initialSection === 'reporting' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Reporting & Analytics</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-violet-50 rounded-lg border border-violet-200">
                  <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reports</h3>
                  <p className="text-sm text-gray-600 mb-4">Generate system and user reports</p>
                  <button
                    onClick={() => alert('Reports - Coming Soon!')}
                    className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Generate
                  </button>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📈</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                  <p className="text-sm text-gray-600 mb-4">Data analytics and insights</p>
                  <button
                    onClick={() => alert('Analytics - Coming Soon!')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Analytics
                  </button>
                </div>

                <div className="text-center p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📤</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Export</h3>
                  <p className="text-sm text-gray-600 mb-4">Export data in various formats</p>
                  <button
                    onClick={() => {
                      // Scroll to data export section
                      const element = document.querySelector('[data-section="data-export"]');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.scrollTo({ top: 1000, behavior: 'smooth' });
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Export Data
                  </button>
                </div>

                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
                  <p className="text-sm text-gray-600 mb-4">Business intelligence dashboard</p>
                  <button
                    onClick={() => alert('Dashboard - Coming Soon!')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
