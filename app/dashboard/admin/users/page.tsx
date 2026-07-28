// app/dashboard/admin/users/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  UserCog,
  ArrowLeft,
  Shield,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit,
  X,
  Check,
  Building2,
  Globe,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Save,
  Phone
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { 
  useAdminUsers, 
  useUpdateUser, 
  useUpdateUserRole, 
  useUpdateUserStatus 
} from '@/hooks/useAdminUsers';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    ACTIVE: 'bg-[#34D399]/20 text-[#34D399]',
    INACTIVE: 'bg-[#6B6358]/20 text-[#6B6358]',
    SUSPENDED: 'bg-[#F87171]/20 text-[#F87171]',
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles] || styles.INACTIVE}`}>
      {status}
    </span>
  );
};

// Role badge component
const RoleBadge = ({ role }: { role: string }) => {
  const styles = {
    admin: 'bg-[#6366F1]/20 text-[#6366F1]',
    teacher: 'bg-[#34D399]/20 text-[#34D399]',
    student: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[role as keyof typeof styles] || styles.student}`}>
      {role.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, subtitle }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 hover:border-[#E8A33D]/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#6B6358] truncate">{title}</p>
        <p className="text-2xl font-bold text-[#F5F0E8] mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-[#6B6358] mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-[#${color}]/10 flex items-center justify-center flex-shrink-0 ml-3`}>
        <div className={`text-[#${color}] w-6 h-6`}>{icon}</div>
      </div>
    </div>
  </motion.div>
);

// Skeleton Components
const SkeletonStatsCard = () => (
  <div className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-[#2A2438] rounded w-24 mb-2"></div>
        <div className="h-8 bg-[#2A2438] rounded w-12"></div>
      </div>
      <div className="w-12 h-12 rounded-xl bg-[#2A2438] flex-shrink-0 ml-3"></div>
    </div>
  </div>
);

const SkeletonUserRow = () => (
  <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-[#2A2438] flex-shrink-0"></div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="h-5 bg-[#2A2438] rounded w-32"></div>
          <div className="h-5 bg-[#2A2438] rounded w-16"></div>
          <div className="h-5 bg-[#2A2438] rounded w-16"></div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="h-3 bg-[#2A2438] rounded w-48"></div>
          <div className="h-3 bg-[#2A2438] rounded w-24"></div>
          <div className="h-3 bg-[#2A2438] rounded w-32"></div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#2A2438] rounded-lg"></div>
        <div className="w-8 h-8 bg-[#2A2438] rounded-lg"></div>
        <div className="w-8 h-8 bg-[#2A2438] rounded-lg"></div>
      </div>
    </div>
  </div>
);

// ... rest of your component code ...

export default function AdminUsersPage() {
  const router = useRouter();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<'edit' | 'role' | 'status' | null>(null);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: '',
  });
  
  // Filters
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch all users on page load (no pagination)
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useAdminUsers({
    page: 1,
    limit: 1000, // Fetch all users at once
  });

  // Mutations using custom hooks
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();

  // Handlers
  const toggleExpand = (userId: string, action: 'edit' | 'role' | 'status') => {
    const user = usersData?.users.find(u => u.id === userId);
    if (!user) return;

    if (expandedUserId === userId && expandedAction === action) {
      setExpandedUserId(null);
      setExpandedAction(null);
      setSelectedUser(null);
      return;
    }

    setSelectedUser(user);
    setExpandedUserId(userId);
    setExpandedAction(action);
    
    // Populate edit form
    if (action === 'edit') {
      setEditFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        city: user.city || '',
      });
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUserMutation.mutate(
      { 
        userId: selectedUser.id, 
        data: editFormData 
      },
      {
        onSuccess: (data) => {
          setExpandedUserId(null);
          setExpandedAction(null);
          setSelectedUser(null);
          alert(data.message);
        },
        onError: (error: any) => {
          alert(error.message || 'Failed to update user');
        },
      }
    );
  };

  const handleChangeRole = (roleId: string) => {
    if (selectedUser) {
      updateRoleMutation.mutate(
        { userId: selectedUser.id, roleId },
        {
          onSuccess: (data) => {
            setExpandedUserId(null);
            setExpandedAction(null);
            setSelectedUser(null);
            alert(data.message);
          },
          onError: (error: any) => {
            alert(error.message || 'Failed to update user role');
          },
        }
      );
    }
  };

  const handleChangeStatus = (status: string) => {
    if (selectedUser) {
      updateStatusMutation.mutate(
        { userId: selectedUser.id, status },
        {
          onSuccess: (data) => {
            setExpandedUserId(null);
            setExpandedAction(null);
            setSelectedUser(null);
            alert(data.message);
          },
          onError: (error: any) => {
            alert(error.message || 'Failed to update user status');
          },
        }
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    
    return usersData.users.filter(user => {
      // Search filter
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = !debouncedSearchTerm || 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchLower));
      
      // Role filter
      const matchesRole = !filters.role || user.role?.name === filters.role;
      
      // Status filter
      const matchesStatus = !filters.status || user.status === filters.status;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersData, debouncedSearchTerm, filters]);

  // Get stats from filtered data
  const stats = useMemo(() => {
    if (!usersData) return null;
    return {
      total: usersData.pagination.total,
      active: usersData.stats.active,
      inactive: usersData.stats.inactive,
      suspended: usersData.stats.suspended,
    };
  }, [usersData]);

  // Pagination for filtered results
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredUsers.slice(startIndex, startIndex + limit);
  }, [filteredUsers, page, limit]);

  const totalPages = Math.ceil(filteredUsers.length / limit);

  // Loading state with skeleton
  if (isLoading && !usersData) {
    return (
      <div className="min-h-screen">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-2 rounded-lg bg-[#2A2438]/50 animate-pulse">
            <div className="w-5 h-5"></div>
          </div>
          <div className="p-2 rounded-lg bg-[#2A2438]/50 animate-pulse">
            <div className="w-5 h-5"></div>
          </div>
          <div className="h-8 w-px bg-[#2A2438]" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2A2438] animate-pulse">
              <div className="w-6 h-6"></div>
            </div>
            <div>
              <div className="h-8 bg-[#2A2438] rounded w-48 mb-1 animate-pulse"></div>
              <div className="h-4 bg-[#2A2438] rounded w-64 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"></div>
              <div className="w-full h-11 bg-[#0B0912] border border-[#2A2438] rounded-lg animate-pulse"></div>
            </div>
            <div className="w-24 h-11 bg-[#2A2438] rounded-lg animate-pulse"></div>
            <div className="w-24 h-11 bg-[#2A2438] rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Users Table Skeleton */}
        <div className="hidden lg:block space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonUserRow key={i} />
          ))}
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="lg:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#2A2438]"></div>
                  <div>
                    <div className="h-5 bg-[#2A2438] rounded w-32 mb-1"></div>
                    <div className="h-3 bg-[#2A2438] rounded w-48"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-5 bg-[#2A2438] rounded w-16"></div>
                  <div className="h-5 bg-[#2A2438] rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-[#2A2438] rounded w-40"></div>
                <div className="h-4 bg-[#2A2438] rounded w-48"></div>
                <div className="h-4 bg-[#2A2438] rounded w-36"></div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#2A2438]">
                <div className="h-7 bg-[#2A2438] rounded w-16"></div>
                <div className="h-7 bg-[#2A2438] rounded w-16"></div>
                <div className="h-7 bg-[#2A2438] rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F87171]/10 flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-[#F87171]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">Failed to Load</h3>
          <p className="text-[#A79C8C]">{(error as Error)?.message || 'An error occurred'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-6 py-2 bg-[#E8A33D] text-[#0B0912] rounded-lg hover:bg-[#C97F1F] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
            <UsersIcon className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
              User Management
            </h1>
            <p className="text-sm text-[#A79C8C]">Manage users in {usersData?.techCenter?.name || 'your tech center'}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.total}
            icon={<UsersIcon className="w-6 h-6" />}
            color="E8A33D"
          />
          <StatsCard
            title="Active"
            value={stats.active}
            icon={<UserCheck className="w-6 h-6" />}
            color="34D399"
          />
          <StatsCard
            title="Inactive"
            value={stats.inactive}
            icon={<UserX className="w-6 h-6" />}
            color="6B6358"
          />
          <StatsCard
            title="Suspended"
            value={stats.suspended}
            icon={<Shield className="w-6 h-6" />}
            color="F87171"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6358]" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <Filter className="w-4 h-4" />
            Filters
            {Object.values(filters).some(v => v) && (
              <span className="w-2 h-2 rounded-full bg-[#E8A33D]" />
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter dropdown */}
        <AnimatePresence>
          {showFilters && usersData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-[#2A2438]">
                <div>
                  <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                  >
                    <option value="">All Roles</option>
                    {usersData.filters.roles.map((r) => (
                      <option key={r.id} value={r.name}>{r.displayName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                  >
                    <option value="">All Statuses</option>
                    {usersData.filters.statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {Object.values(filters).some(v => v) && (
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setFilters({ role: '', status: '' })}
                    className="text-sm text-[#E8A33D] hover:text-[#F2C879] transition-colors duration-200"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Users Table */}
      {usersData && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-10 h-10 text-[#E8A33D] opacity-60" />
              </div>
              <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">No Users Found</h3>
              <p className="text-[#A79C8C]">
                {searchTerm || Object.values(filters).some(v => v) 
                  ? 'Try adjusting your search or filters' 
                  : 'No users in your tech center yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Table - Desktop */}
              <div className="hidden lg:block">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="mb-4">
                    <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden hover:border-[#E8A33D]/30 transition-all duration-300">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4 flex-1">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center text-[#0B0912] font-semibold text-sm flex-shrink-0">
                              {user.firstName.charAt(0).toUpperCase()}
                              {user.lastName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-sm font-medium text-[#F5F0E8]">
                                {user.firstName} {user.lastName}
                              </p>
                              <RoleBadge role={user.role?.name || 'student'} />
                              <StatusBadge status={user.status} />
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-[#6B6358] flex-wrap">
                              <span>{user.email}</span>
                              {user.phoneNumber && <span>• {user.phoneNumber}</span>}
                              <span>• Joined {formatDate(user.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <button
                            onClick={() => toggleExpand(user.id, 'edit')}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              expandedUserId === user.id && expandedAction === 'edit'
                                ? 'bg-[#E8A33D]/20 text-[#E8A33D]'
                                : 'hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F5F0E8]'
                            }`}
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleExpand(user.id, 'role')}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              expandedUserId === user.id && expandedAction === 'role'
                                ? 'bg-[#E8A33D]/20 text-[#E8A33D]'
                                : 'hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F5F0E8]'
                            }`}
                            title="Change Role"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleExpand(user.id, 'status')}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              expandedUserId === user.id && expandedAction === 'status'
                                ? 'bg-[#E8A33D]/20 text-[#E8A33D]'
                                : 'hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F5F0E8]'
                            }`}
                            title="Change Status"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Action Content */}
                      <AnimatePresence>
                        {expandedUserId === user.id && selectedUser && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-[#2A2438]"
                          >
                            <div className="p-4 bg-[#0B0912]/50">
                              {/* Edit Form */}
                              {expandedAction === 'edit' && (
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        First Name
                                      </label>
                                      <input
                                        type="text"
                                        name="firstName"
                                        value={editFormData.firstName}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        Last Name
                                      </label>
                                      <input
                                        type="text"
                                        name="lastName"
                                        value={editFormData.lastName}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        Email
                                      </label>
                                      <input
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        Phone
                                      </label>
                                      <input
                                        type="text"
                                        name="phoneNumber"
                                        value={editFormData.phoneNumber}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        Country
                                      </label>
                                      <input
                                        type="text"
                                        name="country"
                                        value={editFormData.country}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        City
                                      </label>
                                      <input
                                        type="text"
                                        name="city"
                                        value={editFormData.city}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedUserId(null);
                                        setExpandedAction(null);
                                      }}
                                      className="px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={updateUserMutation.isPending}
                                      className="px-4 py-2 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {updateUserMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Save className="w-4 h-4" />
                                      )}
                                      Save Changes
                                    </button>
                                  </div>
                                </form>
                              )}

                              {/* Change Role */}
                              {expandedAction === 'role' && usersData && (
                                <div className="space-y-2">
                                  <p className="text-sm text-[#A79C8C] mb-3">
                                    Select new role for {selectedUser.firstName} {selectedUser.lastName}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {usersData.filters.roles.map((role) => (
                                      <button
                                        key={role.id}
                                        onClick={() => handleChangeRole(role.id)}
                                        disabled={updateRoleMutation.isPending || selectedUser.role?.id === role.id}
                                        className={`text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between text-[#F5F0E8] ${
                                          selectedUser.role?.id === role.id
                                            ? 'bg-[#E8A33D]/10 border border-[#E8A33D]/30 cursor-default'
                                            : 'bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30 hover:bg-[#2A2438]/30'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        <div>
                                          <p className="text-[#F5F0E8] font-medium">{role.displayName}</p>
                                          <p className="text-xs text-[#A79C8C]">{role.name}</p>
                                        </div>
                                        {selectedUser.role?.id === role.id && (
                                          <Check className="w-5 h-5 text-[#E8A33D]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                  {updateRoleMutation.isPending && (
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                      <Loader2 className="w-4 h-4 text-[#E8A33D] animate-spin" />
                                      <span className="text-sm text-[#A79C8C]">Updating role...</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Change Status */}
                              {expandedAction === 'status' && (
                                <div className="space-y-2">
                                  <p className="text-sm text-[#A79C8C] mb-3">
                                    Change status for {selectedUser.firstName} {selectedUser.lastName}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => handleChangeStatus(status)}
                                        disabled={updateStatusMutation.isPending || selectedUser.status === status}
                                        className={`text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                                          selectedUser.status === status
                                            ? 'bg-[#E8A33D]/10 border border-[#E8A33D]/30 cursor-default'
                                            : 'bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30 hover:bg-[#2A2438]/30'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        <StatusBadge status={status} />
                                      </button>
                                    ))}
                                  </div>
                                  {updateStatusMutation.isPending && (
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                      <Loader2 className="w-4 h-4 text-[#E8A33D] animate-spin" />
                                      <span className="text-sm text-[#A79C8C]">Updating status...</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden hover:border-[#E8A33D]/30 transition-all duration-300">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center text-[#0B0912] font-semibold">
                              {user.firstName.charAt(0).toUpperCase()}
                              {user.lastName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-[#F5F0E8]">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-[#6B6358]">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <RoleBadge role={user.role?.name || 'student'} />
                          <StatusBadge status={user.status} />
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-[#6B6358]">
                        {user.phoneNumber && <p>• {user.phoneNumber}</p>}
                        <p>• Joined {formatDate(user.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#2A2438]">
                        <button
                          onClick={() => toggleExpand(user.id, 'edit')}
                          className="p-2 rounded-lg hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F5F0E8] transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleExpand(user.id, 'role')}
                          className="p-2 rounded-lg hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F5F0E8] transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleExpand(user.id, 'status')}
                          className="p-2 rounded-lg hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F5F0E8] transition-colors"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Expanded Content */}
                    <AnimatePresence>
                      {expandedUserId === user.id && selectedUser && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden border-t border-[#2A2438]"
                        >
                          <div className="p-4 bg-[#0B0912]/50">
                            {/* Same expanded content as desktop */}
                            {expandedAction === 'edit' && (
                              <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">First Name</label>
                                    <input
                                      type="text"
                                      name="firstName"
                                      value={editFormData.firstName}
                                      onChange={handleEditInputChange}
                                      className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">Last Name</label>
                                    <input
                                      type="text"
                                      name="lastName"
                                      value={editFormData.lastName}
                                      onChange={handleEditInputChange}
                                      className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">Email</label>
                                    <input
                                      type="email"
                                      name="email"
                                      value={editFormData.email}
                                      onChange={handleEditInputChange}
                                      className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">Phone</label>
                                    <input
                                      type="text"
                                      name="phoneNumber"
                                      value={editFormData.phoneNumber}
                                      onChange={handleEditInputChange}
                                      className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedUserId(null);
                                      setExpandedAction(null);
                                    }}
                                    className="px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={updateUserMutation.isPending}
                                    className="px-4 py-2 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                </div>
                              </form>
                            )}

                            {expandedAction === 'role' && usersData && (
                              <div className="space-y-2">
                                <p className="text-sm text-[#A79C8C] mb-3">Select new role</p>
                                {usersData.filters.roles.map((role) => (
                                  <button
                                    key={role.id}
                                    onClick={() => handleChangeRole(role.id)}
                                    disabled={updateRoleMutation.isPending || selectedUser.role?.id === role.id}
                                    className={`w-full text-left px-4 py-3 rounded-lg ${
                                      selectedUser.role?.id === role.id
                                        ? 'bg-[#E8A33D]/10 border border-[#E8A33D]/30'
                                        : 'bg-[#150F20] border border-[#2A2438]'
                                    }`}
                                  >
                                    {role.displayName}
                                  </button>
                                ))}
                              </div>
                            )}

                            {expandedAction === 'status' && (
                              <div className="space-y-2">
                                <p className="text-sm text-[#A79C8C] mb-3">Change status</p>
                                {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleChangeStatus(status)}
                                    disabled={updateStatusMutation.isPending || selectedUser.status === status}
                                    className={`w-full text-left px-4 py-3 rounded-lg ${
                                      selectedUser.status === status
                                        ? 'bg-[#E8A33D]/10 border border-[#E8A33D]/30'
                                        : 'bg-[#150F20] border border-[#2A2438]'
                                    }`}
                                  >
                                    <StatusBadge status={status} />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#2A2438]">
                  <p className="text-sm text-[#A79C8C]">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, filteredUsers.length)} of {filteredUsers.length} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 bg-[#150F20] text-[#F5F0E8] rounded-lg">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}