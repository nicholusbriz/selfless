'use client';

import { useState } from 'react';
import ExcelExporter from './ExcelExporter';
import Announcements from './Announcements';
import TutorManagement from './TutorManagement';
import AdminManagement from './AdminManagement';
import TutorSchedule from './TutorSchedule';
import { isSuperAdminEmail } from '@/config/admin';
import UserSearch from './UserSearch';
// Import modular admin components
import UsersTable from './admin/UsersTable';
import DashboardStats from './admin/DashboardStats';
import {
  useUsers,
  useCleaningDays,
  useRemoveUserFromDay,
  useDeleteUser,
} from '@/hooks/cleaningHooks';
import { useCourseRegistrations } from '@/hooks/courseHooks';
import {
  useRefetchControls,
  useDashboardStats
} from '@/hooks/utilityHooks';
import { User } from '@/lib/auth';

/**
 * Convert date string to readable format (e.g., "Jan 1, 2023, 12:00 PM")
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Types
interface AdminDashboardProps {
  adminId: string;
  adminEmail: string;
  adminName: string;
  isSuperAdmin?: boolean;
  initialSection?: string;
  showOnlySection?: boolean;
  onStatsRefresh?: () => void;
}

// Type for the flattened cleaning days data
interface FlattenedCleaningDay {
  id: string;
  dayName: string;
  formattedDate: string;
  dayId: string;
  registrationId: string;
}

export default function AdminDashboard({ adminId, adminEmail, adminName, isSuperAdmin = false, initialSection = 'overview', showOnlySection = false, onStatsRefresh }: AdminDashboardProps) {
  // React Query hooks for data fetching
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const { data: registeredDays = [], isLoading: daysLoading, error: daysError } = useCleaningDays();
  const { data: courseSubmissions = [], isLoading: coursesLoading } = useCourseRegistrations();
  const dashboardStats = useDashboardStats();

  const statsLoading = usersLoading || daysLoading || coursesLoading;

  // Mutation hooks
  const removeUserFromDay = useRemoveUserFromDay();
  const deleteUser = useDeleteUser();

  // Refetch controls
  const { refetchUsers, refetchDays, refetchAll } = useRefetchControls();

  // Loading state
  const loading = usersLoading || daysLoading || coursesLoading;

  // Mutation handlers using React Query
  const handleRemoveUserFromDay = async (userId: string, dayId: string, userName: string, formattedDate: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${userName} from ${formattedDate}?\n\nThis will:\n• Remove them from this cleaning day registration\n• Remove them from the registered list\n• Keep their account active in the database\n• They can register again for any available day\n\nTheir account will remain for future registrations.`
    );

    if (confirmed) {
      try {
        await removeUserFromDay.mutateAsync({ userId, dayId });
        alert(`${userName} has been successfully removed from ${formattedDate}`);
        // Refresh parent stats if callback provided
        if (onStatsRefresh) {
          onStatsRefresh();
        }
      } catch (error) {
        alert('Failed to remove user from day');
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETION ⚠️\n\nAre you sure you want to permanently delete ${userName}?\n\nThis will:\n• Delete their account permanently\n• Remove email, password, and all user data\n• Delete all their cleaning day registrations\n• Update the cleaning day counts\n• They will need to register again to access the system\n\nThis action CANNOT be undone!`
    );

    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      `FINAL CONFIRMATION\n\nYou are about to permanently delete ${userName} from the database.\n\nType "DELETE" to confirm or click Cancel to abort.`
    );

    if (!doubleConfirmed) return;

    try {
      await deleteUser.mutateAsync(userId);
      alert(`${userName} permanently deleted successfully!`);
      // Refresh parent stats if callback provided
      if (onStatsRefresh) {
        onStatsRefresh();
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/20 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-white/20 rounded"></div>
            <div className="h-32 bg-white/20 rounded"></div>
            <div className="h-32 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Overview Section - Default Dashboard */}
      {(!showOnlySection && initialSection === 'overview') && (
        <>
          <DashboardStats
            stats={{
              totalUsers: dashboardStats?.totalUsers || 0,
              registeredForDays: dashboardStats?.registeredForDays || 0,
              courseSubmissions: dashboardStats?.courseSubmissions || 0,
              usedCapacity: dashboardStats?.usedCapacity || 0,
              totalCapacity: dashboardStats?.totalCapacity || 75,
            }}
            isLoading={statsLoading}
          />

          {/* Quick Actions Section */}
          <div className="bg-black/30 rounded-xl border border-white/20 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => alert('Navigate to Users Management')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>👥</span>
                Manage Users
              </button>
              <button
                onClick={() => alert('Navigate to Cleaning Days')}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>🧹</span>
                Cleaning Days
              </button>
              <button
                onClick={() => alert('Navigate to System Settings')}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>⚙️</span>
                Settings
              </button>
            </div>
          </div>
        </>
      )}

      {/* Search Section */}
      {initialSection === 'search' && (
        <UserSearch
          users={users}
          courseRegistrations={courseSubmissions}
          cleaningDays={registeredDays}
        />
      )}

      {/* Show only the requested section */}
      {initialSection === 'users' && (
        <>
          <div className="bg-black/30 rounded-xl border border-white/20">
            <div className="p-4 border-b border-white/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                <h2 className="text-base font-semibold text-white">All Users ({users.length})</h2>
                <button
                  onClick={refetchUsers}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 w-fit"
                >
                  <span className="animate-spin">🔄</span>
                  Refresh Data
                </button>
              </div>
              <p className="text-xs text-gray-300">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            <UsersTable
              users={users as User[]}
              onDeleteUser={handleDeleteUser}
              isLoading={usersLoading}
            />
          </div>

          {/* Export Users Data */}
          <div className="mt-3 p-3 bg-black/30 rounded-lg border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-2">Export Users Data</h3>
            <ExcelExporter
              data={users.map(user => ({
                'Full Name': user.fullName || `${user.firstName} ${user.lastName}`,
                'Email': (user as any).email || '',
                'Phone Number': (user as any).phoneNumber || 'Not provided',
                'Role': isSuperAdminEmail((user as any).email) ? 'super admin' : 'user',
                'Joined Date': user.createdAt ? formatDate(user.createdAt.toString()) : 'Unknown'
              }))}
              filename="users.csv"
              className="mb-1"
            >
              📊 Export All Users
            </ExcelExporter>
          </div>
        </>
      )}

      {initialSection === 'system' && (
        <div className="bg-black/30 rounded-xl border border-white/20">
          <div className="p-4 border-b border-white/20">
            <h2 className="text-base font-semibold text-white">System Administration</h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-amber-600/20 rounded-lg border border-amber-400/30">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm">⚙️</span>
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">System Settings</h3>
                <p className="text-xs text-gray-300 mb-2">Platform configuration and system-wide settings</p>
                <button
                  onClick={() => alert('System Settings - Coming Soon!')}
                  className="bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                >
                  Configure
                </button>
              </div>

              <div className="text-center p-3 bg-orange-600/20 rounded-lg border border-orange-400/30">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm">📊</span>
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">System Analytics</h3>
                <p className="text-xs text-gray-300 mb-2">Monitor system performance and usage metrics</p>
                <button
                  onClick={() => alert('System Analytics - Coming Soon!')}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                >
                  Analytics
                </button>
              </div>

              <div className="text-center p-3 bg-yellow-600/20 rounded-lg border border-yellow-400/30">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm">🗂️</span>
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">Data Management</h3>
                <p className="text-xs text-gray-300 mb-2">Manage system data and database operations</p>
                <button
                  onClick={() => alert('Data Management - Coming Soon!')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                >
                  Manage Data
                </button>
              </div>

              <div className="text-center p-3 bg-red-600/20 rounded-lg border border-red-400/30">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white text-sm">📋</span>
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">System Logs</h3>
                <p className="text-xs text-gray-300 mb-2">View system logs and audit trails</p>
                <button
                  onClick={() => alert('System Logs - Coming Soon!')}
                  className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
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
          <div className="bg-black/30 rounded-xl border border-white/20">
            <div className="p-4 border-b border-white/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                <h2 className="text-base font-semibold text-white">Registered Days ({registeredDays.length})</h2>
                <button
                  onClick={refetchDays}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 w-fit"
                >
                  <span className="animate-spin">🔄</span>
                  Refresh Data
                </button>
              </div>
              <p className="text-xs text-gray-300">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full table-fixed">
                <thead className="bg-black/20 border-b border-white/20">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/3">
                      Student Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">
                      Phone
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">
                      Registered Date
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-black/10 divide-y divide-white/10">
                  {registeredDays.map((day) => (
                    <tr key={`${day.dayId}-${day.id}`} className="hover:bg-white/10">
                      <td className="px-3 py-2 text-sm text-white truncate">
                        {day.fullName || `${day.firstName} ${day.lastName}`}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-300">
                        {day.phoneNumber || 'Not provided'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-300">
                        {day.formattedDate}
                      </td>
                      <td className="px-3 py-2 text-center text-sm text-gray-300">
                        <button
                          onClick={() => {
                            const confirmed = window.confirm(
                              `Are you sure you want to remove ${day.fullName || `${day.firstName} ${day.lastName}`} from ${day.formattedDate}?\n\nThis will:\n• Remove them from this cleaning day registration\n• Remove them from the registered list\n• Keep their account active in the database\n• They can register again for any available day\n\nTheir account will remain for future registrations.`
                            );

                            if (confirmed) {
                              handleRemoveUserFromDay(
                                day.id,
                                day.dayId,
                                day.fullName || `${day.firstName} ${day.lastName}`,
                                day.formattedDate
                              );
                            }
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Remove from this cleaning day (keep account)"
                        >
                          Remove
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
                <div key={`${registration.dayId}-${registration.id}`} className="bg-white/10 border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-white">
                        {registration.fullName || `${registration.firstName} ${registration.lastName}`}
                      </h4>
                      <p className="text-sm text-gray-300">{registration.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p> {registration.formattedDate}</p>
                  </div>
                  <div className="pt-2 border-t border-white/20">
                    <button
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Are you sure you want to remove ${registration.fullName || `${registration.firstName} ${registration.lastName}`} from ${registration.formattedDate}?\n\nThis will:\n• Remove them from this cleaning day registration\n• Remove them from the registered list\n• Keep their account active in the database\n• They can register again for any available day\n\nTheir account will remain for future registrations.`
                        );

                        if (confirmed) {
                          handleRemoveUserFromDay(
                            registration.id,
                            registration.dayId,
                            registration.fullName || `${registration.firstName} ${registration.lastName}`,
                            registration.formattedDate
                          );
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
          <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-3">Export Registered Days Data</h3>
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

      {initialSection === 'announcements' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Announcements Management</h2>
            <p className="text-sm text-gray-600 mt-1">Create, manage, and delete announcements for all users</p>
          </div>
          <div className="p-6">
            <Announcements
              isAdmin={true}
              adminId={adminId}
              adminEmail={adminEmail}
              adminName={adminName}
              canPostAnnouncements={true}
            />
          </div>
        </div>
      )}

      {initialSection === 'communication' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Communication Management</h2>
          </div>
          <div className="p-6">
            <Announcements
              isAdmin={true}
              adminId={adminId}
              adminEmail={adminEmail}
              adminName={adminName}
              canPostAnnouncements={true}
            />
          </div>
        </div>
      )}

      {initialSection === 'tutors' && (
        <div className="space-y-6">
          <TutorSchedule />
          <TutorManagement
            adminId={adminId}
            adminEmail={adminEmail}
            adminName={adminName}
          />
        </div>
      )}

      {initialSection === 'admins' && isSuperAdmin && (
        <AdminManagement
          adminId={adminId}
          adminEmail={adminEmail}
          adminName={adminName}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  );
}
