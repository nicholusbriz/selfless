// app/dashboard/super-admin/email/page.tsx
// Visible to: super_admin and dev roles
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Mail,
  RefreshCw,
  CheckCircle,
  Send,
  TrendingUp,
  AlertCircle,
  X,
  Shield,
  GraduationCap,
  Building2,
  ChevronDown,
  AlertTriangle,
  Info,
  Power,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = 'compose' | 'stats';

interface EmailStats {
  provider: string;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  lastUpdated: string | Date;
}

interface AllStats {
  resend: EmailStats | null;
  mailjet: EmailStats | null;
}

interface EmailUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: { name: string; displayName: string };
  techCenter?: { name: string; code: string };
}

interface TechCenter {
  id: string;
  name: string;
  code: string;
}

// ─── Audience presets ─────────────────────────────────────────────────────────

const AUDIENCE_PRESETS = [
  {
    id: 'super_admin',
    label: 'Directors',
    icon: Shield,
    role: 'super_admin',
    color: 'purple',
  },
  {
    id: 'teacher',
    label: 'Tutors',
    icon: GraduationCap,
    role: 'teacher',
    color: 'green',
  },
  {
    id: 'admin',
    label: 'Tech Center Managers',
    icon: Building2,
    role: 'admin',
    color: 'blue',
  },
] as const;

const presetColors: Record<string, string> = {
  purple: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 ring-purple-400',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 ring-blue-400',
  green: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 ring-green-400',
};

// ─── Role label map ───────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Director',
  admin: 'Tech Center Manager',
  teacher: 'Tutor',
  student: 'Student',
  dev: 'Developer',
};

function roleLabel(user: EmailUser): string {
  if (!user.role) return '';
  return ROLE_LABELS[user.role.name] ?? user.role.displayName;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('compose');
  const [emailSendingEnabled, setEmailSendingEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('emailSendingEnabled');
      return saved !== 'false'; // Default to true
    }
    return true;
  });

  // Stats
  const [stats, setStats] = useState<AllStats>({ resend: null, mailjet: null });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Compose
  const [composeForm, setComposeForm] = useState({ subject: '', message: '' });
  const [availableUsers, setAvailableUsers] = useState<EmailUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<EmailUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Audience filters
  const [techCenters, setTechCenters] = useState<TechCenter[]>([]);
  const [selectedTechCenter, setSelectedTechCenter] = useState('');
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Gmail filter always on
  const displayedSelected = selectedUsers.filter((u) =>
    u.email.toLowerCase().endsWith('@gmail.com')
  );

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const res = await fetch('/api/admin/email-stats-both');
      const data = await res.json();
      if (res.ok) setStats(data);
      else setStatsError(data.error || 'Failed to fetch stats');
    } catch {
      setStatsError('Failed to connect to server');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchTechCenters = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/all-tech-centers');
      if (res.ok) setTechCenters(await res.json());
    } catch { /* non-fatal */ }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/email-recipients');
      const data = await res.json();
      if (res.ok) setAvailableUsers(data.users ?? []);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTechCenters();
    fetchAllUsers();
  }, [fetchStats, fetchTechCenters, fetchAllUsers]);

  // ── Audience helpers ──────────────────────────────────────────────────────────

  const loadAudience = useCallback(async (opts: { role?: string; techCenterId?: string }) => {
    setAudienceLoading(true);
    try {
      const params = new URLSearchParams();
      if (opts.role) params.set('role', opts.role);
      if (opts.techCenterId) params.set('techCenterId', opts.techCenterId);
      const res = await fetch(`/api/admin/email-recipients?${params}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedUsers(data.users ?? []);
        setSendResult(null);
      }
    } catch { /* non-fatal */ }
    finally { setAudienceLoading(false); }
  }, []);

  const handlePresetClick = async (presetId: string, role: string) => {
    if (activePreset === presetId) {
      setActivePreset(null);
      setSelectedUsers([]);
      return;
    }
    setActivePreset(presetId);
    setSelectedTechCenter('');
    await loadAudience({ role });
  };

  const handleTechCenterChange = async (id: string) => {
    setSelectedTechCenter(id);
    setActivePreset(null);
    if (!id) { setSelectedUsers([]); return; }
    await loadAudience({ techCenterId: id });
  };

  const handleUserSelect = (user: EmailUser) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers((p) => [...p, user]);
      setSendResult(null);
    }
  };

  const handleUserRemove = (id: string) =>
    setSelectedUsers((p) => p.filter((u) => u.id !== id));

  const clearAll = () => {
    setSelectedUsers([]);
    setActivePreset(null);
    setSelectedTechCenter('');
    setSendResult(null);
  };

  // ── Usage guard ───────────────────────────────────────────────────────────────

  const mailjetStats = stats.mailjet;
  const recipientCount = displayedSelected.length;

  type UsageState = 'LIMIT_REACHED' | 'INSUFFICIENT' | 'DISABLED' | 'OK';
  const usageState: UsageState = (() => {
    // Dev users are not affected by the toggle
    if (user?.role !== 'dev' && !emailSendingEnabled) return 'DISABLED';
    if (!mailjetStats) return 'OK';
    if (mailjetStats.dailyRemaining === 0) return 'LIMIT_REACHED';
    if (recipientCount > 0 && recipientCount > mailjetStats.dailyRemaining) return 'INSUFFICIENT';
    return 'OK';
  })();

  const canSend = usageState === 'OK' && recipientCount > 0 && !sending && (user?.role === 'dev' || emailSendingEnabled);

  // ── Send ──────────────────────────────────────────────────────────────────────

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    if (!composeForm.subject || !composeForm.message) {
      setSendResult({ success: false, message: 'Please fill in subject and message.' });
      return;
    }
    setSending(true);
    setSendResult(null);
    const recipients = displayedSelected.map((u) => u.email);
    const recipientDetails = displayedSelected.map((u) => ({
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
    }));
    const isBulk = recipients.length > 1;
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          recipientDetails,
          subject: composeForm.subject,
          message: composeForm.message,
          recipientName: displayedSelected[0]?.firstName || 'User',
          isBulk,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult({
          success: true,
          message: isBulk
            ? `Successfully sent ${data.successCount} of ${data.total} emails`
            : 'Email sent successfully',
        });
        setComposeForm({ subject: '', message: '' });
        setSelectedUsers([]);
        setActivePreset(null);
        setSelectedTechCenter('');
        fetchStats();
      } else {
        setSendResult({ success: false, message: data.message || data.error || 'Failed to send email' });
      }
    } catch {
      setSendResult({ success: false, message: 'Failed to send email. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  // ── Stats helpers ─────────────────────────────────────────────────────────────

  const pct = (used: number, limit: number) =>
    limit > 0 ? Math.round((used / limit) * 100) : 0;

  const barCol = (p: number) =>
    p >= 90 ? 'bg-red-500' : p >= 70 ? 'bg-yellow-500' : 'bg-green-500';

  const textCol = (p: number) =>
    p >= 90 ? 'text-red-500' : p >= 70 ? 'text-yellow-500' : 'text-green-500';

  const statIcon = (p: number) =>
    p >= 90 ? <AlertCircle className="w-5 h-5" /> :
      p >= 70 ? <TrendingUp className="w-5 h-5" /> :
        <CheckCircle className="w-5 h-5" />;

  const renderStatsCard = (s: EmailStats | null, name: string) => {
    if (!s)
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">{name} not configured</p>
        </div>
      );
    const dp = pct(s.dailyUsed, s.dailyLimit);
    const mp = pct(s.monthlyUsed, s.monthlyLimit);
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{s.provider}</p>
          </div>
        </div>
        {[{ label: 'Daily', used: s.dailyUsed, remaining: s.dailyRemaining, limit: s.dailyLimit, p: dp },
        { label: 'Monthly', used: s.monthlyUsed, remaining: s.monthlyRemaining, limit: s.monthlyLimit, p: mp }
        ].map(({ label, used, remaining, limit, p }) => (
          <div key={label} className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-gray-600">{label}</span>
              <div className={`flex items-center gap-1 text-xs font-semibold ${textCol(p)}`}>
                {statIcon(p)}
                {p}%
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
              <div className={`h-1.5 rounded-full ${barCol(p)}`} style={{ width: `${p}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{used} used</span>
              <span>{remaining} of {limit} remaining</span>
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-400 pt-3 border-t border-gray-100">
          Updated {new Date(s.lastUpdated).toLocaleString()}
        </p>
      </div>
    );
  };

  // ── Filtered search ───────────────────────────────────────────────────────────

  const filteredSearch = availableUsers.filter(
    (u) =>
      !selectedUsers.find((s) => s.id === u.id) &&
      (u.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between max-w-4xl">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Email Center</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Send official messages from the Selfless CE domain · Directors only
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-0 max-w-4xl">
          {([
            { key: 'compose', label: 'Compose', icon: Send },
            { key: 'stats', label: 'Usage Stats', icon: TrendingUp },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${activeTab === key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">

          {/* ════════════════════════════════════════
              COMPOSE TAB
          ════════════════════════════════════════ */}
          {activeTab === 'compose' && (
            <div className="space-y-5">

              {/* Info note */}
              <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4">
                <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-500 leading-relaxed">
                  Each selected recipient will receive this message{' '}
                  <span className="font-semibold text-gray-700">directly in their personal email inbox</span>
                  {' '}— sent from the official{' '}
                  <span className="font-medium text-gray-700">selflessstudentportal.org</span> domain.
                  {' '}Only their Gmail addresses are used. This page is restricted to Directors.
                </p>
              </div>

              {/* Usage warning banners */}
              {usageState === 'DISABLED' && user?.role !== 'dev' && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                  <Power className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-800">Email sending disabled by the Development team for now</p>
                </div>
              )}

              {usageState === 'LIMIT_REACHED' && mailjetStats && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Daily limit reached — sending disabled</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {mailjetStats.dailyUsed}/{mailjetStats.dailyLimit} emails sent today. Resets at 4:00 AM UTC.
                    </p>
                  </div>
                </div>
              )}

              {usageState === 'INSUFFICIENT' && mailjetStats && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Not enough quota for {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Only {mailjetStats.dailyRemaining} email{mailjetStats.dailyRemaining !== 1 ? 's' : ''} left today
                      ({mailjetStats.dailyUsed}/{mailjetStats.dailyLimit} used). Reduce recipients or wait for the 4:00 AM UTC reset.
                    </p>
                  </div>
                </div>
              )}

              {/* Main compose card */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                {/* Daily quota bar at top of card */}
                {mailjetStats ? (
                  <div className={`px-6 py-3.5 border-b flex items-center justify-between gap-4 ${mailjetStats.dailyRemaining === 0 ? 'bg-red-50 border-red-200' :
                    mailjetStats.dailyRemaining <= 20 ? 'bg-orange-50 border-orange-200' :
                      mailjetStats.dailyRemaining <= 60 ? 'bg-amber-50 border-amber-200' :
                        'bg-emerald-50 border-emerald-200'
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`text-2xl font-bold tabular-nums ${mailjetStats.dailyRemaining === 0 ? 'text-red-600' :
                        mailjetStats.dailyRemaining <= 20 ? 'text-orange-600' :
                          mailjetStats.dailyRemaining <= 60 ? 'text-amber-700' :
                            'text-emerald-700'
                        }`}>
                        {mailjetStats.dailyRemaining}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold leading-tight ${mailjetStats.dailyRemaining === 0 ? 'text-red-700' :
                          mailjetStats.dailyRemaining <= 20 ? 'text-orange-700' :
                            mailjetStats.dailyRemaining <= 60 ? 'text-amber-800' :
                              'text-emerald-800'
                          }`}>
                          {mailjetStats.dailyRemaining === 0
                            ? 'No emails remaining today'
                            : `email${mailjetStats.dailyRemaining !== 1 ? 's' : ''} remaining today`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {mailjetStats.dailyUsed} of {mailjetStats.dailyLimit} used · resets 4:00 AM UTC
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="hidden sm:block w-32">
                      <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${mailjetStats.dailyRemaining === 0 ? 'bg-red-500' :
                            mailjetStats.dailyRemaining <= 20 ? 'bg-orange-500' :
                              mailjetStats.dailyRemaining <= 60 ? 'bg-amber-500' :
                                'bg-emerald-500'
                            }`}
                          style={{ width: `${pct(mailjetStats.dailyUsed, mailjetStats.dailyLimit)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-right mt-1">
                        {pct(mailjetStats.dailyUsed, mailjetStats.dailyLimit)}% used
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-400" />
                    <span className="text-xs text-gray-400">Loading usage…</span>
                  </div>
                )}

                <form onSubmit={handleSend} className="p-6 space-y-6">

                  {/* Audience quick-select */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Select audience
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {AUDIENCE_PRESETS.map(({ id, label, icon: Icon, role, color }, idx) => {
                        const isActive = activePreset === id;
                        // "Tech Center Managers" is last (idx 2) — spans both columns
                        const spanClass = idx === 2 ? 'col-span-2' : '';
                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={audienceLoading}
                            onClick={() => handlePresetClick(id, role)}
                            className={`${spanClass} flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 ${isActive
                              ? `${presetColors[color]} ring-2 ring-offset-1`
                              : presetColors[color]
                              }`}
                          >
                            {audienceLoading && isActive
                              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              : <Icon className="w-3.5 h-3.5 shrink-0" />
                            }
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tech center filter */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Filter by tech center
                    </p>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        value={selectedTechCenter}
                        onChange={(e) => handleTechCenterChange(e.target.value)}
                        disabled={audienceLoading}
                        className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none disabled:opacity-50 text-gray-700"
                      >
                        <option value="">All tech centers</option>
                        {techCenters.map((tc) => (
                          <option key={tc.id} value={tc.id}>
                            {tc.name} ({tc.code})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Individual search */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Add individual recipients
                    </p>
                    <input
                      type="text"
                      placeholder="Search by name or email…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                    {userSearch && filteredSearch.length > 0 && (
                      <div className="border border-gray-200 rounded-lg max-h-44 overflow-y-auto mt-2 shadow-sm divide-y divide-gray-100">
                        {filteredSearch.slice(0, 20).map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => { handleUserSelect(user); setUserSearch(''); }}
                            className="w-full px-4 py-2.5 hover:bg-gray-50 text-left transition-colors flex items-center gap-3"
                          >
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-gray-600">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                            {user.role && (
                              <span className="shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                {roleLabel(user)}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {userSearch && filteredSearch.length === 0 && (
                      <p className="text-xs text-gray-400 mt-2">No users found for "{userSearch}"</p>
                    )}
                  </div>

                  {/* Recipients summary */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Recipients
                        <span className="ml-2 normal-case bg-gray-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {displayedSelected.length}
                        </span>
                        {selectedUsers.length > displayedSelected.length && (
                          <span className="ml-1.5 normal-case text-gray-400 font-normal">
                            ({selectedUsers.length - displayedSelected.length} non-Gmail filtered out)
                          </span>
                        )}
                      </p>
                      {selectedUsers.length > 0 && (
                        <button
                          type="button"
                          onClick={clearAll}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {displayedSelected.length === 0 ? (
                      <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg px-4 py-3">
                        No recipients selected yet
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {displayedSelected.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-3 pr-1.5 py-1"
                          >
                            <span className="text-sm text-gray-700">
                              {user.firstName} {user.lastName}
                            </span>
                            {user.role && (
                              <span className="text-xs text-gray-400">· {roleLabel(user)}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUserRemove(user.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors rounded-full p-0.5"
                              aria-label={`Remove ${user.firstName}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm((f) => ({ ...f, subject: e.target.value }))}
                      placeholder="Email subject…"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Message
                    </label>
                    <textarea
                      value={composeForm.message}
                      onChange={(e) => setComposeForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Write your message here…"
                      rows={7}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-sm"
                      required
                    />
                  </div>

                  {/* Send result */}
                  {sendResult && (
                    <div className={`flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm ${sendResult.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                      }`}>
                      {sendResult.success
                        ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      }
                      {sendResult.message}
                    </div>
                  )}

                  {/* Dev-only email sending toggle */}
                  {user?.role === 'dev' && (
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Power className={`w-4 h-4 ${emailSendingEnabled ? 'text-green-600' : 'text-red-500'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Super Admin Email Sending</p>
                          <p className="text-xs text-gray-500">
                            {emailSendingEnabled ? 'Enabled - Super admins can send emails' : 'Disabled - Super admins cannot send emails (Dev unaffected)'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newState = !emailSendingEnabled;
                          setEmailSendingEnabled(newState);
                          localStorage.setItem('emailSendingEnabled', String(newState));
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailSendingEnabled ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailSendingEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSend}
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {sending ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : usageState !== 'OK' && user?.role !== 'dev' ? (
                      <><AlertCircle className="w-4 h-4" />
                        {usageState === 'DISABLED' ? 'Sending disabled' :
                          usageState === 'LIMIT_REACHED' ? 'Daily limit reached' : 'Insufficient quota'}</>
                    ) : (
                      <><Send className="w-4 h-4" />
                        {displayedSelected.length > 1
                          ? `Send to ${displayedSelected.length} recipients`
                          : 'Send Email'}</>
                    )}
                  </button>

                </form>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              STATS TAB
          ════════════════════════════════════════ */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Email provider usage</p>
                <button
                  onClick={fetchStats}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[0, 1].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : statsError ? (
                <div className="bg-white rounded-xl border border-red-100 p-6 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{statsError}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {renderStatsCard(stats.resend, 'Resend — Password Resets')}
                  {renderStatsCard(stats.mailjet, 'Mailjet — Notifications')}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div >
  );
}
