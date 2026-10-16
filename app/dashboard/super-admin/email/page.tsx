// app/dashboard/super-admin/email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, Send, TrendingUp, AlertCircle, X } from 'lucide-react';

type TabType = 'stats' | 'compose';

interface EmailStats {
  provider: string;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  lastUpdated: string | Date; // ✅ accept both (JSON gives string, code gives Date)
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
  role?: { displayName: string };
}

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  // Email stats state
  const [stats, setStats] = useState<AllStats>({ resend: null, mailjet: null });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Email composition state
  const [composeForm, setComposeForm] = useState<{
    recipients: string[];
    subject: string;
    message: string;
  }>({
    recipients: [],
    subject: '',
    message: '',
  });
  // ✅ typed instead of any[]
  const [availableUsers, setAvailableUsers] = useState<EmailUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<EmailUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // ✅ Removed: checkProvider useEffect (setProvider/setStatus were never declared and unused)
  // ✅ Removed: duplicate fetchStats useEffect (setEmailStats was never declared and unused)

  // Fetch email stats (for the stats tab)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch('/api/admin/email-stats-both');
        const data = await response.json();

        if (response.ok) {
          setStats(data);
          setStatsError('');
        } else {
          setStatsError(data.error || 'Failed to fetch stats');
        }
      } catch {
        setStatsError('Failed to connect to server');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch available users for email composition
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/email-recipients');
        const data = await response.json();
        if (response.ok) {
          setAvailableUsers(data.users ?? []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Handle recipient selection
  const handleUserSelect = (user: EmailUser) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setComposeForm({
        ...composeForm,
        recipients: [...composeForm.recipients, user.email],
      });
    }
  };

  // Handle recipient removal
  const handleUserRemove = (userId: string) => {
    const updated = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(updated);
    setComposeForm({
      ...composeForm,
      recipients: updated.map((u) => u.email),
    });
  };

  // Handle form submission
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (composeForm.recipients.length === 0) {
      setSendResult({ success: false, message: 'Please select at least one recipient' });
      return;
    }

    if (!composeForm.subject || !composeForm.message) {
      setSendResult({ success: false, message: 'Please fill in subject and message' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: composeForm.recipients,
          subject: composeForm.subject,
          message: composeForm.message,
          recipientName: selectedUsers[0]?.firstName || 'User',
          isBulk: composeForm.recipients.length > 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({
          success: true,
          message: data.isBulk
            ? `Successfully sent ${data.successCount} of ${data.total} emails`
            : 'Email sent successfully',
        });
        setComposeForm({ recipients: [], subject: '', message: '' });
        setSelectedUsers([]);
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Failed to send email',
        });
      }
    } catch {
      setSendResult({
        success: false,
        message: 'Failed to send email. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  // Filter users based on search
  const filteredUsers = availableUsers.filter(
    (user) =>
      !selectedUsers.find((u) => u.id === user.id) &&
      (user.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // Stats helper functions
  const getUsagePercentage = (used: number, limit: number) => {
    if (!limit || limit === 0) return 0;
    return Math.round((used / limit) * 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertCircle className="w-5 h-5" />;
    if (percentage >= 70) return <TrendingUp className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const renderStatsCard = (providerStats: EmailStats | null, providerName: string) => {
    if (!providerStats) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-600">{providerName} not configured</p>
        </div>
      );
    }

    const dailyPercentage = getUsagePercentage(providerStats.dailyUsed, providerStats.dailyLimit);
    const monthlyPercentage = getUsagePercentage(providerStats.monthlyUsed, providerStats.monthlyLimit);

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{providerName} Usage</h3>
              <p className="text-xs text-gray-500">{providerStats.provider}</p>
            </div>
          </div>
        </div>

        {/* Daily Usage */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Daily Usage</span>
            <div className={`flex items-center gap-1 ${getStatusColor(dailyPercentage)}`}>
              {getStatusIcon(dailyPercentage)}
              <span className="text-sm font-semibold">{dailyPercentage}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                dailyPercentage >= 90
                  ? 'bg-red-500'
                  : dailyPercentage >= 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${dailyPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{providerStats.dailyUsed} used</span>
            <span>{providerStats.dailyRemaining} remaining</span>
          </div>
        </div>

        {/* Monthly Usage */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
            <div className={`flex items-center gap-1 ${getStatusColor(monthlyPercentage)}`}>
              {getStatusIcon(monthlyPercentage)}
              <span className="text-sm font-semibold">{monthlyPercentage}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                monthlyPercentage >= 90
                  ? 'bg-red-500'
                  : monthlyPercentage >= 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${monthlyPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{providerStats.monthlyUsed} used</span>
            <span>{providerStats.monthlyRemaining} remaining</span>
          </div>
        </div>

        {/* Limits Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500">Daily Limit</p>
              <p className="font-semibold text-gray-900">{providerStats.dailyLimit}</p>
            </div>
            <div>
              <p className="text-gray-500">Monthly Limit</p>
              <p className="font-semibold text-gray-900">{providerStats.monthlyLimit}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Last updated: {new Date(providerStats.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Center</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage email communications and track usage
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{availableUsers.length} Users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Email Stats
            </div>
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'compose'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Compose Email
            </div>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'stats' ? (
            <div className="space-y-6">
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ) : statsError ? (
                <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Error</span>
                  </div>
                  <p className="text-sm text-gray-600">{statsError}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Email Usage by Provider</h3>
                    <button
                      onClick={() => {
                        setStatsLoading(true);
                        fetch('/api/admin/email-stats-both')
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.resend || data.mailjet) {
                              setStats(data);
                              setStatsError('');
                            } else {
                              setStatsError(data.error || 'Failed to fetch stats');
                            }
                          })
                          .catch(() => setStatsError('Failed to connect to server'))
                          .finally(() => setStatsLoading(false));
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderStatsCard(stats.resend, 'Resend (Password Resets)')}
                    {renderStatsCard(stats.mailjet, 'Mailjet (Notifications)')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Email Composition Form */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    <Send className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Compose Email</h2>
                    <p className="text-xs text-gray-500">Send emails to users</p>
                  </div>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-6">
                  {/* Recipients Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients ({selectedUsers.length} selected)
                    </label>

                    {/* User Search */}
                    <div className="relative mb-3">
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* User List */}
                    {userSearch && filteredUsers.length > 0 && (
                      <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-3 shadow-sm">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleUserSelect(user)}
                            className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {user.firstName[0]}
                                    {user.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {user.role?.displayName}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Recipients */}
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5"
                          >
                            <span className="text-sm text-gray-700">
                              {user.firstName} {user.lastName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUserRemove(user.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                      placeholder="Email subject..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={composeForm.message}
                      onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                      placeholder="Write your message here..."
                      rows={8}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  {/* Send Result */}
                  {sendResult && (
                    <div
                      className={`p-4 rounded-lg flex items-center gap-2 ${
                        sendResult.success
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}
                    >
                      {sendResult.success ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      {sendResult.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={sending || selectedUsers.length === 0}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {sending ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {composeForm.recipients.length > 1
                          ? `Send to ${composeForm.recipients.length} recipients`
                          : 'Send Email'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}