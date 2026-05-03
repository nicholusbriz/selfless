'use client';

import { User } from '@/lib/auth';
import { isSuperAdminEmail } from '@/config/admin';

/**
 * Formats a date string into a readable format
 * @param dateString - The date string to format
 * @returns Formatted date string
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

interface UsersTableProps {
  users: User[];
  onDeleteUser: (userId: string, userName: string) => void;
  isLoading?: boolean;
}

/**
 * UsersTable component
 * Displays a table of all users with their information and actions
 * @param users - Array of user objects to display
 * @param onDeleteUser - Callback function for user deletion
 * @param isLoading - Optional loading state
 */
export default function UsersTable({ users, onDeleteUser, isLoading = false }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-blue-300">Loading users...</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-0">
          <thead className="bg-black/20 border-b border-white/20">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden xl:table-cell">
                Phone
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                Joined
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-black/10 divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/10">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  <span className="truncate max-w-32 block" title={user.email}>{user.email}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${isSuperAdminEmail(user.email)
                    ? 'bg-purple-600/30 text-purple-200 border-purple-400/50 border'
                    : 'bg-gray-600/30 text-gray-200 border-gray-400/50 border'
                    }`}>
                    {isSuperAdminEmail(user.email) ? 'super admin' : 'user'}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 hidden xl:table-cell">
                  {user.phoneNumber ? (
                    <span className="text-green-400 text-xs">📱 {user.phoneNumber}</span>
                  ) : (
                    <span className="text-orange-400 italic text-xs">No phone</span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 hidden lg:table-cell">
                  <span className="text-xs">{user.createdAt ? formatDate(user.createdAt.toString()) : 'Unknown'}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => onDeleteUser(user.id, user.fullName || `${user.firstName} ${user.lastName}`)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
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

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 gap-3 p-4 max-h-screen overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="bg-white/10 rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {user.fullName || `${user.firstName} ${user.lastName}`}
                  </h3>
                  <p className="text-xs text-gray-300 truncate">{user.email}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${isSuperAdminEmail(user.email)
                  ? 'bg-purple-600/30 text-purple-200 border-purple-400/50 border'
                  : 'bg-gray-600/30 text-gray-200 border-gray-400/50 border'
                  }`}>
                  {isSuperAdminEmail(user.email) ? 'super admin' : 'user'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div>
                  <span className="text-gray-300">Phone:</span>
                  {user.phoneNumber ? (
                    <span className="text-green-400 ml-1 block truncate">📱 {user.phoneNumber}</span>
                  ) : (
                    <span className="text-orange-400 italic ml-1">No phone</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-300">Joined:</span>
                  <span className="text-gray-200 ml-1 block truncate">
                    {user.createdAt ? formatDate(user.createdAt.toString()) : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20">
                <button
                  onClick={() => onDeleteUser(user.id, user.fullName || `${user.firstName} ${user.lastName}`)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors"
                  title="Permanently delete user account"
                >
                  Delete User
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
