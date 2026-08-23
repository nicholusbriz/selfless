'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key,
  ArrowLeft,
  Home,
  Shield,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  X,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import Image from 'next/image';

// ============================================
// USER AVATAR COMPONENT
// ============================================

const UserAvatar = ({ user, size = 40 }: { user: any; size?: number }) => {
  if (user.profileImageUrl) {
    return (
      <div 
        className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={user.profileImageUrl}
          alt={`${user.firstName} ${user.lastName}`}
          width={size}
          height={size}
          unoptimized
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  
  return (
    <div 
      className="rounded-full bg-gradient-to-br from-[#E8A33D] to-[#C97F1F] flex items-center justify-center text-[#0B0912] font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
};

// ============================================
// STATS CARD COMPONENT
// ============================================

const StatsCard = ({ title, value, icon, color }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#150F20] border border-[#2A2438] rounded-xl p-6 hover:border-[#E8A33D]/30 transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#6B6358] truncate">{title}</p>
        <p className="text-2xl font-bold text-[#F5F0E8] mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-[#${color}]/10 flex items-center justify-center flex-shrink-0 ml-3`}>
        <div className={`text-[#${color}] w-6 h-6`}>{icon}</div>
      </div>
    </div>
  </motion.div>
);

// ============================================
// SKELETON COMPONENTS
// ============================================

const AvatarSkeleton = ({ size = 40 }: { size?: number }) => (
  <div 
    className="rounded-full bg-[#2A2438] animate-pulse flex-shrink-0"
    style={{ width: size, height: size }}
  />
);

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

const TableSkeleton = () => (
  <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="p-4 border-b border-[#2A2438] last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <AvatarSkeleton size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-4 w-32 bg-[#2A2438] rounded animate-pulse" />
                <div className="h-5 w-24 bg-[#2A2438] rounded-full animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="h-3 w-48 bg-[#2A2438] rounded animate-pulse" />
                <div className="h-3 w-32 bg-[#2A2438] rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <div className="w-8 h-8 bg-[#2A2438] rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-[#2A2438] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function PasswordResetsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Fetch password reset requests
  const fetchPasswordResets = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/password-resets');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to fetch password reset requests');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch password reset requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy token to clipboard
  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Revoke reset token
  const revokeToken = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke this reset token?')) return;

    try {
      const response = await fetch('/api/admin/password-resets/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchPasswordResets();
      } else {
        alert(data.error || 'Failed to revoke token');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revoke token');
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate time remaining
  const getTimeRemaining = (expiry: string) => {
    const now = new Date();
    const expiryDate = new Date(expiry);
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  // Load data on mount
  useEffect(() => {
    fetchPasswordResets();
  }, []);

  // Calculate stats
  const stats = {
    total: users.length,
    urgent: users.filter(u => {
      const expiry = new Date(u.resetTokenExpiry);
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();
      return diff > 0 && diff < 1000 * 60 * 60; // Less than 1 hour
    }).length,
    normal: users.filter(u => {
      const expiry = new Date(u.resetTokenExpiry);
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();
      return diff >= 1000 * 60 * 60 && diff < 1000 * 60 * 60 * 12; // 1-12 hours
    }).length,
    extended: users.filter(u => {
      const expiry = new Date(u.resetTokenExpiry);
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();
      return diff >= 1000 * 60 * 60 * 12; // More than 12 hours
    }).length,
  };

  // Skeleton loading
  if (isLoading) {
    return (
      <div className="min-h-screen">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-[#2A2438] rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-[#2A2438] rounded-lg animate-pulse" />
          <div className="h-8 w-px bg-[#2A2438]" />
          <div className="w-10 h-10 bg-[#2A2438] rounded-lg animate-pulse" />
          <div className="h-8 w-px bg-[#2A2438]" />
          <div className="h-8 w-48 bg-[#2A2438] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[#2A2438] rounded animate-pulse mt-1" />
        </div>
        
        <StatsSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#F87171]/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-[#F87171]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">Access Denied</h3>
          <p className="text-[#A79C8C]">{error}</p>
          <button
            onClick={() => router.push('/dashboard/super-admin')}
            className="mt-4 px-6 py-2 bg-[#E8A33D] text-[#0B0912] rounded-lg hover:bg-[#C97F1F] transition-colors"
          >
            Return to Dashboard
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
        
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E8A33D]/20 to-[#C97F1F]/10 border border-[#E8A33D]/20">
          <Key className="w-6 h-6 text-[#E8A33D]" />
        </div>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
            Password Reset Requests
          </h1>
          <p className="text-sm text-[#A79C8C]">Manage user password reset tokens</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Requests"
          value={stats.total}
          icon={<Key className="w-6 h-6" />}
          color="E8A33D"
        />
        <StatsCard
          title="Urgent (&lt;1h)"
          value={stats.urgent}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="F87171"
        />
        <StatsCard
          title="Normal (1-12h)"
          value={stats.normal}
          icon={<Clock className="w-6 h-6" />}
          color="34D399"
        />
        <StatsCard
          title="Extended (&gt;12h)"
          value={stats.extended}
          icon={<Calendar className="w-6 h-6" />}
          color="6366F1"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-[#A79C8C] text-sm">
          {users.length === 0 
            ? 'No active password reset requests' 
            : `${users.length} user${users.length > 1 ? 's' : ''} waiting for password reset`}
        </p>
        <button
          onClick={fetchPasswordResets}
          className="px-4 py-2 bg-[#2A2438] text-[#A79C8C] rounded-lg hover:bg-[#3A3448] hover:text-[#F5F0E8] transition-colors duration-200 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#2A2438] flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-[#6B6358]" />
          </div>
          <h3 className="text-xl font-semibold text-[#F5F0E8] mb-2">No Active Requests</h3>
          <p className="text-[#A79C8C]">There are currently no users waiting for password reset codes.</p>
        </div>
      ) : (
        <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl overflow-hidden">
          <div className="hidden lg:block">
            {/* Desktop Table */}
            <table className="w-full">
              <thead className="bg-[#0B0912]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#A79C8C] uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#A79C8C] uppercase tracking-wider">Reset Token</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#A79C8C] uppercase tracking-wider">Tech Center</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#A79C8C] uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#A79C8C] uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#A79C8C] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2438]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#2A2438]/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size={40} />
                        <div>
                          <p className="font-medium text-[#F5F0E8]">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-[#A79C8C]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-1 bg-[#0B0912] rounded-lg text-[#E8A33D] font-mono text-sm">
                          {user.resetToken}
                        </code>
                        <button
                          onClick={() => copyToken(user.resetToken)}
                          className="p-1.5 rounded-lg bg-[#2A2438] hover:bg-[#3A3448] text-[#A79C8C] hover:text-[#F5F0E8] transition-colors"
                        >
                          {copiedToken === user.resetToken ? (
                            <Check className="w-4 h-4 text-[#34D399]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#6B6358]" />
                        <span className="text-[#F5F0E8]">{user.techCenter?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6B6358]" />
                        <span className="text-[#F5F0E8]">
                          {user.techCenter?.country?.name || 'N/A'}
                          {user.techCenter?.city && `, ${user.techCenter.city}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#6B6358]" />
                        <span className="text-[#F5F0E8] text-sm">
                          {getTimeRemaining(user.resetTokenExpiry)}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6358] mt-1">
                        {formatDate(user.resetTokenExpiry)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => revokeToken(user.id)}
                        className="p-2 rounded-lg bg-[#F87171]/10 hover:bg-[#F87171]/20 text-[#F87171] hover:text-[#F87171] transition-colors"
                        title="Revoke token"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 p-4">
            {users.map((user) => (
              <div key={user.id} className="bg-[#0B0912]/50 rounded-xl p-4 border border-[#2A2438]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size={48} />
                    <div>
                      <p className="font-medium text-[#F5F0E8]">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-[#A79C8C]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => revokeToken(user.id)}
                    className="p-2 rounded-lg bg-[#F87171]/10 hover:bg-[#F87171]/20 text-[#F87171] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A79C8C]">Reset Token</span>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-[#150F20] rounded text-[#E8A33D] font-mono text-sm">
                        {user.resetToken}
                      </code>
                      <button
                        onClick={() => copyToken(user.resetToken)}
                        className="p-1 rounded bg-[#2A2438] hover:bg-[#3A3448] text-[#A79C8C] transition-colors"
                      >
                        {copiedToken === user.resetToken ? (
                          <Check className="w-3 h-3 text-[#34D399]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-[#6B6358]" />
                    <span className="text-[#F5F0E8]">{user.techCenter?.name || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-[#6B6358]" />
                    <span className="text-[#F5F0E8]">
                      {user.techCenter?.country?.name || 'N/A'}
                      {user.techCenter?.city && `, ${user.techCenter.city}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#6B6358]" />
                    <span className="text-[#F5F0E8]">{getTimeRemaining(user.resetTokenExpiry)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}