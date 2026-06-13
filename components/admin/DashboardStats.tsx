'use client';

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    registeredForDays: number;
    courseSubmissions: number;
    usedCapacity: number;
    totalCapacity: number;
  };
  isLoading?: boolean;
}

/**
 * DashboardStats component
 * Displays key statistics in card format for the admin dashboard
 * @param stats - Dashboard statistics object
 * @param isLoading - Loading state for statistics
 */
export default function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-blue-300">Loading dashboard statistics...</p>
      </div>
    );
  }

  const capacityPercentage = stats.totalCapacity > 0
    ? Math.round((stats.usedCapacity / stats.totalCapacity) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Users Card */}
      <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-4 border border-blue-400/30 hover-lift">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">👥</span>
          </div>
          <div className="text-blue-300 text-xs font-medium">Total</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{stats.totalUsers || 0}</h3>
        <p className="text-blue-200 text-xs">Registered Users</p>
      </div>

      {/* Cleaning Days Registration Card */}
      <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-4 border border-green-400/30 hover-lift">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🧹</span>
          </div>
          <div className="text-green-300 text-xs font-medium">Active</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{stats.registeredForDays || 0}</h3>
        <p className="text-green-200 text-xs">Cleaning Day Registrations</p>
      </div>

      {/* Course Submissions Card */}
      <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-4 border border-purple-400/30 hover-lift">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">📚</span>
          </div>
          <div className="text-purple-300 text-xs font-medium">Submitted</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{stats.courseSubmissions || 0}</h3>
        <p className="text-purple-200 text-xs">Course Submissions</p>
      </div>

      {/* Capacity Usage Card */}
      <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-xl p-4 border border-orange-400/30 hover-lift">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <div className="text-orange-300 text-xs font-medium">Usage</div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">{capacityPercentage}%</h3>
        <p className="text-orange-200 text-xs">
          {stats.usedCapacity || 0} / {stats.totalCapacity || 75} Capacity Used
        </p>
      </div>
    </div>
  );
}
