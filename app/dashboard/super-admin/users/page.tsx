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
  Home,
  Shield,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Building2,
  Globe,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Save
} from 'lucide-react';
import { 
  useSuperAdminUsers, 
  useUpdateSuperAdminUser, 
  useUpdateSuperAdminUserRole, 
  useUpdateSuperAdminUserStatus,
  useDeleteSuperAdminUser
} from '@/hooks/useSuperAdminUsers';

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
    super_admin: 'bg-[#E8A33D]/20 text-[#E8A33D]',
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

// ===== SKELETON COMPONENTS (Integrated) =====

// Stats Skeleton
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="h-4 w-20 bg-[#2A2438] rounded animate-pulse" />
            <div className="h-8 w-12 bg-[#2A2438] rounded animate-pulse mt-2" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#2A2438] animate-pulse flex-shrink-0" />
        </div>
      </div>
    ))}
  </div>
);

// Table Skeleton
const UserTableSkeleton = () => (
  <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="p-4 border-b border-[#2A2438] last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-full bg-[#2A2438] animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-4 w-32 bg-[#2A2438] rounded animate-pulse" />
                <div className="h-5 w-16 bg-[#2A2438] rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-[#2A2438] rounded-full animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="h-3 w-48 bg-[#2A2438] rounded animate-pulse" />
                <div className="h-3 w-32 bg-[#2A2438] rounded animate-pulse" />
                <div className="h-3 w-24 bg-[#2A2438] rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <div className="w-8 h-8 bg-[#2A2438] rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-[#2A2438] rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-[#2A2438] rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-[#2A2438] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Card Skeleton (Mobile)
const UserCardSkeleton = () => (
  <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#2A2438] animate-pulse flex-shrink-0" />
        <div>
          <div className="h-4 w-32 bg-[#2A2438] rounded animate-pulse" />
          <div className="h-3 w-48 bg-[#2A2438] rounded animate-pulse mt-1" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="h-5 w-16 bg-[#2A2438] rounded-full animate-pulse" />
        <div className="h-5 w-20 bg-[#2A2438] rounded-full animate-pulse" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 w-40 bg-[#2A2438] rounded animate-pulse" />
      <div className="h-3 w-32 bg-[#2A2438] rounded animate-pulse" />
      <div className="h-3 w-36 bg-[#2A2438] rounded animate-pulse" />
    </div>
    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#2A2438]">
      <div className="h-8 w-16 bg-[#2A2438] rounded-lg animate-pulse" />
      <div className="h-8 w-16 bg-[#2A2438] rounded-lg animate-pulse" />
      <div className="h-8 w-16 bg-[#2A2438] rounded-lg animate-pulse" />
      <div className="h-8 w-16 bg-[#2A2438] rounded-lg animate-pulse" />
    </div>
  </div>
);

// Search & Filters Skeleton
const SearchFiltersSkeleton = () => (
  <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4 mb-6">
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 h-11 bg-[#2A2438] rounded-lg animate-pulse" />
      <div className="w-32 h-11 bg-[#2A2438] rounded-lg animate-pulse" />
      <div className="w-32 h-11 bg-[#2A2438] rounded-lg animate-pulse" />
    </div>
  </div>
);

// Header Skeleton
const HeaderSkeleton = () => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-10 h-10 bg-[#2A2438] rounded-lg animate-pulse" />
    <div className="w-10 h-10 bg-[#2A2438] rounded-lg animate-pulse" />
    <div className="h-8 w-px bg-[#2A2438]" />
    <div>
      <div className="h-8 w-48 bg-[#2A2438] rounded animate-pulse" />
      <div className="h-4 w-64 bg-[#2A2438] rounded animate-pulse mt-1" />
    </div>
  </div>
);

export default function SuperAdminUsersPage() {
  const router = useRouter();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<'edit' | 'role' | 'status' | 'delete' | null>(null);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: '',
    techCenterId: '',
    profileImageUrl: '',
  });
  
  // Filters
  const [filters, setFilters] = useState({
    techCenterId: '',
    country: '',
    role: '',
    status: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Fetch ALL users once on page load
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useSuperAdminUsers({
    page: 1,
    limit: 1000,
    techCenterId: filters.techCenterId || undefined,
    country: filters.country || undefined,
    role: filters.role || undefined,
    status: filters.status || undefined,
  });

  // Client-side search and pagination
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    
    let filtered = usersData.users;
    
    // Client-side search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.firstName?.toLowerCase().includes(search) ||
        user.lastName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phoneNumber?.toLowerCase().includes(search) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [usersData?.users, searchTerm]);

  // Paginated data (client-side)
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, limit]);

  // Total pages (client-side)
  const totalPages = Math.ceil(filteredUsers.length / limit);

  // Get stats from filtered users
  const stats = useMemo(() => {
    if (!usersData) return null;
    const users = usersData.users;
    return {
      total: usersData.pagination.total || users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      inactive: users.filter(u => u.status === 'INACTIVE').length,
      suspended: users.filter(u => u.status === 'SUSPENDED').length,
    };
  }, [usersData]);

  // Mutations
  const deleteMutation = useDeleteSuperAdminUser();
  const updateRoleMutation = useUpdateSuperAdminUserRole();
  const updateStatusMutation = useUpdateSuperAdminUserStatus();
  const updateUserMutation = useUpdateSuperAdminUser();

  // Handlers
  const toggleExpand = (userId: string, action: 'edit' | 'role' | 'status' | 'delete') => {
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
    
    if (action === 'edit') {
      setEditFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        country: user.country || '',
        city: user.city || '',
        techCenterId: user.techCenterId || '',
        profileImageUrl: user.profileImageUrl || '',
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
          refetch();
          alert(data.message);
        },
        onError: (error: any) => {
          alert(error.message || 'Failed to update user');
        },
      }
    );
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteMutation.mutate(
        selectedUser.id,
        {
          onSuccess: (data) => {
            setExpandedUserId(null);
            setExpandedAction(null);
            setSelectedUser(null);
            refetch();
            alert(data.message);
          },
          onError: (error: any) => {
            alert(error.message || 'Failed to delete user');
          },
        }
      );
    }
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
            refetch();
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
            refetch();
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

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);

  // Skeleton loading on initial load
  if (isLoading && !usersData) {
    return (
      <div className="min-h-screen">
        <HeaderSkeleton />
        <StatsSkeleton />
        <SearchFiltersSkeleton />
        <div className="hidden lg:block">
          <UserTableSkeleton />
        </div>
        <div className="lg:hidden space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <UserCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

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
        
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
        >
          <Home className="w-5 h-5" />
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
            <p className="text-sm text-[#A79C8C]">Manage all users across the platform</p>
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6358] hover:text-[#F5F0E8] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-[#2A2438]">
                <div>
                  <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                    Tech Center
                  </label>
                  <select
                    value={filters.techCenterId}
                    onChange={(e) => setFilters(prev => ({ ...prev, techCenterId: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                  >
                    <option value="">All Centers</option>
                    {usersData.filters.techCenters.map((tc) => (
                      <option key={tc.id} value={tc.id}>{tc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                    Country
                  </label>
                  <select
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-2 bg-[#0B0912] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                  >
                    <option value="">All Countries</option>
                    {usersData.filters.countries.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

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
                    onClick={() => setFilters({ techCenterId: '', country: '', role: '', status: '' })}
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
                  : 'No users registered yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#6B6358]">
                  Showing {paginatedUsers.length} of {filteredUsers.length} users
                  {searchTerm && ` (filtered from ${usersData.users.length} total)`}
                </p>
              </div>

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
                              <span>• {user.techCenter?.name || 'N/A'}</span>
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
                          <button
                            onClick={() => toggleExpand(user.id, 'delete')}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              expandedUserId === user.id && expandedAction === 'delete'
                                ? 'bg-[#F87171]/20 text-[#F87171]'
                                : 'hover:bg-[#2A2438] text-[#6B6358] hover:text-[#F87171]'
                            }`}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
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
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        Tech Center
                                      </label>
                                      <select
                                        name="techCenterId"
                                        value={editFormData.techCenterId}
                                        onChange={handleEditInputChange}
                                        className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200"
                                      >
                                        <option value="">Select Tech Center</option>
                                        {usersData.filters.techCenters.map((tc) => (
                                          <option key={tc.id} value={tc.id}>{tc.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-[#A79C8C] mb-1.5">
                                        Profile Image URL
                                      </label>
                                      <input
                                        type="url"
                                        name="profileImageUrl"
                                        value={editFormData.profileImageUrl}
                                        onChange={handleEditInputChange}
                                        placeholder="https://example.com/image.jpg"
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
                                      <Loader2 className="w-4 h-4 animate-spin text-[#E8A33D]" />
                                      <span className="text-sm text-[#A79C8C]">Updating role...</span>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      setExpandedUserId(null);
                                      setExpandedAction(null);
                                    }}
                                    className="mt-3 px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200"
                                  >
                                    Close
                                  </button>
                                </div>
                              )}

                              {/* Change Status */}
                              {expandedAction === 'status' && (
                                <div className="space-y-2">
                                  <p className="text-sm text-[#A79C8C] mb-3">
                                    Select new status for {selectedUser.firstName} {selectedUser.lastName}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => handleChangeStatus(status)}
                                        disabled={updateStatusMutation.isPending || selectedUser.status === status}
                                        className={`text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                                          selectedUser.status === status
                                            ? 'bg-[#E8A33D]/10 border border-[#E8A33D]/30 cursor-default'
                                            : 'bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30 hover:bg-[#2A2438]/30'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                      >
                                        <div>
                                          <p className="text-[#F5F0E8] font-medium">{status}</p>
                                          <p className="text-xs text-[#6B6358]">
                                            {status === 'ACTIVE' ? 'Full access' :
                                             status === 'INACTIVE' ? 'Cannot login' :
                                             'Temporarily blocked'}
                                          </p>
                                        </div>
                                        {selectedUser.status === status && (
                                          <Check className="w-5 h-5 text-[#E8A33D]" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                  {updateStatusMutation.isPending && (
                                    <div className="flex items-center justify-center gap-2 mt-3">
                                      <Loader2 className="w-4 h-4 animate-spin text-[#E8A33D]" />
                                      <span className="text-sm text-[#A79C8C]">Updating status...</span>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => {
                                      setExpandedUserId(null);
                                      setExpandedAction(null);
                                    }}
                                    className="mt-3 px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200"
                                  >
                                    Close
                                  </button>
                                </div>
                              )}

                              {/* Delete Confirmation */}
                              {expandedAction === 'delete' && (
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#F87171]/10 flex items-center justify-center flex-shrink-0">
                                      <AlertTriangle className="w-5 h-5 text-[#F87171]" />
                                    </div>
                                    <div>
                                      <h4 className="text-base font-semibold text-[#F5F0E8]">
                                        Delete {selectedUser.firstName} {selectedUser.lastName}?
                                      </h4>
                                      <p className="text-sm text-[#A79C8C]">
                                        This action cannot be undone. All associated data including courses, grades, and activity logs will be permanently removed.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => {
                                        setExpandedUserId(null);
                                        setExpandedAction(null);
                                      }}
                                      className="px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleDeleteUser}
                                      disabled={deleteMutation.isPending}
                                      className="px-4 py-2 bg-[#F87171] text-[#0B0912] font-medium rounded-lg hover:bg-[#EF4444] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {deleteMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                      Delete User
                                    </button>
                                  </div>
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

              {/* Cards - Mobile */}
              <div className="lg:hidden space-y-4">
                {paginatedUsers.map((user) => (
                  <div key={user.id}>
                    <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center text-[#0B0912] font-semibold text-base flex-shrink-0">
                              {user.firstName.charAt(0).toUpperCase()}
                              {user.lastName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[#F5F0E8]">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-[#6B6358]">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={user.status} />
                          <RoleBadge role={user.role?.name || 'student'} />
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {user.techCenter && (
                          <div className="flex items-center gap-2 text-[#A79C8C]">
                            <Building2 className="w-4 h-4 text-[#6B6358]" />
                            <span>{user.techCenter.name}</span>
                          </div>
                        )}
                        {user.country && (
                          <div className="flex items-center gap-2 text-[#A79C8C]">
                            <Globe className="w-4 h-4 text-[#6B6358]" />
                            <span>{user.country}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[#A79C8C]">
                          <Calendar className="w-4 h-4 text-[#6B6358]" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#2A2438]">
                        <button
                          onClick={() => toggleExpand(user.id, 'edit')}
                          className={`px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs flex items-center gap-1 ${
                            expandedUserId === user.id && expandedAction === 'edit'
                              ? 'bg-[#E8A33D]/20 text-[#E8A33D]'
                              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
                          }`}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleExpand(user.id, 'role')}
                          className={`px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs flex items-center gap-1 ${
                            expandedUserId === user.id && expandedAction === 'role'
                              ? 'bg-[#E8A33D]/20 text-[#E8A33D]'
                              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          Role
                        </button>
                        <button
                          onClick={() => toggleExpand(user.id, 'status')}
                          className={`px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs flex items-center gap-1 ${
                            expandedUserId === user.id && expandedAction === 'status'
                              ? 'bg-[#E8A33D]/20 text-[#E8A33D]'
                              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
                          }`}
                        >
                          <UserCog className="w-3 h-3" />
                          Status
                        </button>
                        <button
                          onClick={() => toggleExpand(user.id, 'delete')}
                          className={`px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs flex items-center gap-1 ${
                            expandedUserId === user.id && expandedAction === 'delete'
                              ? 'bg-[#F87171]/20 text-[#F87171]'
                              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F87171]'
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>

                      {/* Expanded content for mobile */}
                      <AnimatePresence>
                        {expandedUserId === user.id && selectedUser && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mt-3 pt-3 border-t border-[#2A2438]"
                          >
                            {expandedAction === 'edit' && (
                              <form onSubmit={handleEditSubmit} className="space-y-3">
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    name="firstName"
                                    value={editFormData.firstName}
                                    onChange={handleEditInputChange}
                                    placeholder="First Name"
                                    className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm"
                                  />
                                  <input
                                    type="text"
                                    name="lastName"
                                    value={editFormData.lastName}
                                    onChange={handleEditInputChange}
                                    placeholder="Last Name"
                                    className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm"
                                  />
                                  <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditInputChange}
                                    placeholder="Email"
                                    className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm"
                                  />
                                  <input
                                    type="text"
                                    name="phoneNumber"
                                    value={editFormData.phoneNumber}
                                    onChange={handleEditInputChange}
                                    placeholder="Phone"
                                    className="w-full px-4 py-2 bg-[#150F20] border border-[#2A2438] rounded-lg text-[#F5F0E8] placeholder-[#6B6358] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:border-[#E8A33D]/40 transition-colors duration-200 text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedUserId(null);
                                      setExpandedAction(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200 text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={updateUserMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#E8A33D] to-[#C97F1F] text-[#0B0912] font-medium rounded-lg hover:shadow-lg hover:shadow-[#E8A33D]/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                  >
                                    {updateUserMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4" />
                                    )}
                                    Save
                                  </button>
                                </div>
                              </form>
                            )}

                            {expandedAction === 'role' && usersData && (
                              <div className="space-y-2">
                                <p className="text-sm text-[#A79C8C] mb-2">
                                  Select role for {selectedUser.firstName}
                                </p>
                                {usersData.filters.roles.map((role) => (
                                  <button
                                    key={role.id}
                                    onClick={() => handleChangeRole(role.id)}
                                    disabled={updateRoleMutation.isPending || selectedUser.role?.id === role.id}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between text-sm ${
                                      selectedUser.role?.id === role.id
                                        ? 'bg-[#E8A33D]/10 border border-[#E8A33D]/30 cursor-default'
                                        : 'bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30'
                                    } disabled:opacity-50`}
                                  >
                                    <span className="text-[#F5F0E8]">{role.displayName}</span>
                                    {selectedUser.role?.id === role.id && (
                                      <Check className="w-4 h-4 text-[#E8A33D]" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}

                            {expandedAction === 'status' && (
                              <div className="space-y-2">
                                <p className="text-sm text-[#A79C8C] mb-2">
                                  Select status for {selectedUser.firstName}
                                </p>
                                {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleChangeStatus(status)}
                                    disabled={updateStatusMutation.isPending || selectedUser.status === status}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between text-sm ${
                                      selectedUser.status === status
                                        ? 'bg-[#E8A33D]/10 border border-[#E8A33D]/30 cursor-default'
                                        : 'bg-[#150F20] border border-[#2A2438] hover:border-[#E8A33D]/30'
                                    } disabled:opacity-50`}
                                  >
                                    <span className="text-[#F5F0E8]">{status}</span>
                                    {selectedUser.status === status && (
                                      <Check className="w-4 h-4 text-[#E8A33D]" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}

                            {expandedAction === 'delete' && (
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="w-5 h-5 text-[#F87171] flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm text-[#F5F0E8] font-medium">
                                      Delete {selectedUser.firstName}?
                                    </p>
                                    <p className="text-xs text-[#A79C8C]">
                                      This cannot be undone.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setExpandedUserId(null);
                                      setExpandedAction(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200 text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleDeleteUser}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-[#F87171] text-[#0B0912] font-medium rounded-lg hover:bg-[#EF4444] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                  >
                                    {deleteMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Client-side */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <p className="text-sm text-[#6B6358] order-2 sm:order-1">
                    Showing {(page - 1) * limit + 1} to{' '}
                    {Math.min(page * limit, filteredUsers.length)} of {filteredUsers.length} users
                    {searchTerm && ` (filtered from ${usersData.users.length} total)`}
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-2 rounded-lg bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors duration-200 ${
                            pageNum === page
                              ? 'bg-[#E8A33D] text-[#0B0912]'
                              : 'bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg bg-[#2A2438] text-[#A79C8C] hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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