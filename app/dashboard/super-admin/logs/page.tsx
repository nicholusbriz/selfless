'use client';

import { ArrowLeft, Home, Search, Filter, Calendar, User, Building2, ChevronDown, RefreshCw, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  techCenter?: {
    id: string;
    name: string;
    code: string;
  };
}

export default function ActivityLogsPage() {
  const router = useRouter();
  
  // Filters
  const [userId, setUserId] = useState('');
  const [techCenterId, setTechCenterId] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // Build query key based on filters
  const queryKey = ['logs', userId, techCenterId, action, entityType, startDate, endDate, page];

  // Fetch logs using TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (techCenterId) params.append('techCenterId', techCenterId);
      if (action) params.append('action', action);
      if (entityType) params.append('entityType', entityType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());
      params.append('limit', '50');

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const logs = data?.logs || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const total = data?.pagination?.total || 0;

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleReset = () => {
    setUserId('');
    setTechCenterId('');
    setAction('');
    setEntityType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    refetch();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'logout':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'register':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'create':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'update':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'delete':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'ai_chat_opened':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header with navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go home"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
          Activity Logs
        </h1>
        
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User ID Filter */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:border-[#E8A33D] transition-colors"
              />
            </div>

            {/* Tech Center ID Filter */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                Tech Center ID
              </label>
              <input
                type="text"
                value={techCenterId}
                onChange={(e) => setTechCenterId(e.target.value)}
                placeholder="Enter tech center ID"
                className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:border-[#E8A33D] transition-colors"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-colors"
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="register">Register</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="ai_chat_opened">AI Chat Opened</option>
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                Entity Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-colors"
              >
                <option value="">All Entities</option>
                <option value="user">User</option>
                <option value="tech_center">Tech Center</option>
                <option value="course">Course</option>
                <option value="grade">Grade</option>
                <option value="cleaning">Cleaning</option>
                <option value="ai_assistant">AI Assistant</option>
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-colors"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-[#A79C8C] mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:border-[#E8A33D] transition-colors"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-6 py-2 bg-[#E8A33D] text-[#0B0912] rounded-lg font-medium hover:bg-[#C97F1F] transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg font-medium hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#E8A33D]/10">
              <User className="w-5 h-5 text-[#E8A33D]" />
            </div>
            <div>
              <p className="text-sm text-[#A79C8C]">Total Logs</p>
              <p className="text-xl font-bold text-[#F5F0E8]">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <User className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-[#A79C8C]">Logins</p>
              <p className="text-xl font-bold text-[#F5F0E8]">
                {logs.filter((l: ActivityLog) => l.action === 'login').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-[#A79C8C]">Registrations</p>
              <p className="text-xl font-bold text-[#F5F0E8]">
                {logs.filter((l: ActivityLog) => l.action === 'register').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#14B8A6]/10">
              <Building2 className="w-5 h-5 text-[#14B8A6]" />
            </div>
            <div>
              <p className="text-sm text-[#A79C8C]">Tech Centers</p>
              <p className="text-xl font-bold text-[#F5F0E8]">
                {new Set(logs.map((l: ActivityLog) => l.techCenter?.id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden">
        {isLoading ? (
          // Loading Skeleton
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-[#2A2438]/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#2A2438] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#2A2438] rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-[#2A2438] rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-[#2A2438] rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#2A2438] rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-[#2A2438] rounded w-1/5 animate-pulse" />
                  </div>
                  <div className="h-4 bg-[#2A2438] rounded w-20 animate-pulse" />
                  <div className="h-4 bg-[#2A2438] rounded w-32 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-400">Failed to load logs</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-[#A79C8C] mb-4" />
            <p className="text-[#A79C8C]">No logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2438]">
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#A79C8C]">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#A79C8C]">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#A79C8C]">Entity</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#A79C8C]">Tech Center</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#A79C8C]">IP Address</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#A79C8C]">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: ActivityLog) => (
                  <tr key={log.id} className="border-b border-[#2A2438] hover:bg-[#2A2438]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {log.user?.profileImageUrl ? (
                          <img
                            src={log.user.profileImageUrl}
                            alt={log.user.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#2A2438] flex items-center justify-center">
                            <User className="w-4 h-4 text-[#A79C8C]" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[#F5F0E8]">
                            {log.user?.firstName} {log.user?.lastName}
                          </p>
                          <p className="text-xs text-[#A79C8C]">{log.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-[#F5F0E8] capitalize">{log.entityType}</p>
                        {log.entityId && (
                          <p className="text-xs text-[#A79C8C]">{log.entityId}</p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {log.techCenter ? (
                        <div>
                          <p className="text-sm text-[#F5F0E8]">{log.techCenter.name}</p>
                          <p className="text-xs text-[#A79C8C]">{log.techCenter.code}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-[#A79C8C]">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#A79C8C]">{log.ipAddress || '-'}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#A79C8C]">{formatDate(log.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && logs.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2A2438]">
            <p className="text-sm text-[#A79C8C]">
              Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, total)} of {total} logs
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-[#2A2438] text-[#A79C8C] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-[#F5F0E8]">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-[#2A2438] text-[#A79C8C] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
