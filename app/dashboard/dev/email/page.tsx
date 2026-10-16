// app/dashboard/dev/email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Mail, Settings, RefreshCw, CheckCircle, AlertTriangle, Info, Send, Users, X } from 'lucide-react';

type TabType = 'stats' | 'compose';

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  // Email composition state
  const [composeForm, setComposeForm] = useState({
    recipients: [] as string[],
    subject: '',
    message: '',
  });
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emailStats, setEmailStats] = useState<any>(null);

  useEffect(() => {
    // Check if email provider is configured
    const checkProvider = async () => {
      try {
        const response = await fetch('/api/admin/email-stats');
        if (response.ok) {
          const data = await response.json();
          setProvider('Mailjet'); // Email page always uses Mailjet
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch {
        setStatus('disconnected');
      }
    };

    checkProvider();
  }, []);

  // Fetch available users for email composition
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/email-recipients');
        const data = await response.json();
        if (response.ok) {
          setAvailableUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch email stats for provider info
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/email-stats');
        const data = await response.json();
        if (response.ok) {
          setEmailStats(data);
        }
      } catch (error) {
        console.error('Error fetching email stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Handle recipient selection
  const handleUserSelect = (user: any) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setComposeForm({
        ...composeForm,
        recipients: [...composeForm.recipients, user.email],
      });
    }
  };

  // Handle recipient removal
  const handleUserRemove = (userId: string) => {
    const updated = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(updated);
    setComposeForm({
      ...composeForm,
      recipients: updated.map(u => u.email),
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        // Reset form
        setComposeForm({ recipients: [], subject: '', message: '' });
        setSelectedUsers([]);
      } else {
        setSendResult({
          success: false,
          message: data.error || 'Failed to send email',
        });
      }
    } catch (error) {
      setSendResult({
        success: false,
        message: 'Failed to send email. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  // Filter users based on search
  const filteredUsers = availableUsers.filter(user =>
    !selectedUsers.find(u => u.id === user.id) &&
    (user.firstName.toLowerCase().includes(userSearch.toLowerCase()) ||
     user.lastName.toLowerCase().includes(userSearch.toLowerCase()) ||
     user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A2B4C]">Email Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage email service and send communications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              status === 'connected'
                ? 'bg-green-100 text-green-700'
                : status === 'disconnected'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {status === 'loading' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : status === 'connected' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span>
                {status === 'loading' ? 'Checking...' : status === 'connected' ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-[#E8A33D] text-[#E8A33D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Email Stats
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'compose'
                ? 'border-[#E8A33D] text-[#E8A33D]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Compose Email
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'stats' ? (
            <div className="space-y-6">
              {/* Current Provider Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#E8A33D]/12 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#E8A33D]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Current Provider</h2>
                    <p className="text-xs text-gray-500">Email service in use</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Provider</p>
                    <p className="font-semibold text-gray-900">Mailjet</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Daily Limit</p>
                    <p className="font-semibold text-gray-900">{emailStats?.dailyLimit || '200'} emails</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Monthly Limit</p>
                    <p className="font-semibold text-gray-900">{emailStats?.monthlyLimit || '6,000'} emails</p>
                  </div>
                </div>
              </div>

    

              {/* Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">About Email Providers</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Password reset emails</strong> are sent via Resend (100/day, 3,000/month)</li>
                      <li>• <strong>This email page</strong> uses Mailjet for sending notifications (200/day, 6,000/month)</li>
                      <li>• Both providers are tracked independently with separate usage statistics</li>
                      <li>• When limits are reached for a provider, emails will not be sent until the next period</li>
                      <li>• Consider upgrading to a paid plan for higher volume</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Alternative Providers Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#E8A33D]/12 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#E8A33D]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Alternative Providers</h2>
                    <p className="text-xs text-gray-500">Other email services with free tiers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-[#E8A33D] transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">Resend</h3>
                    <p className="text-sm text-gray-600 mb-2">100 emails/day</p>
                    <p className="text-xs text-gray-500">Simple API, modern service</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-[#E8A33D] transition-colors">
                    <h3 className="font-semibold text-gray-900 mb-2">Mailjet</h3>
                    <p className="text-sm text-gray-600 mb-2">200 emails/day</p>
                    <p className="text-xs text-gray-500">Reliable, good documentation</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> To switch providers, update your environment variables and contact your developer.
                    See <code className="bg-gray-100 px-2 py-1 rounded text-xs">docs/email-providers.md</code> for details.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Email Composition Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#E8A33D]/12 flex items-center justify-center">
                    <Send className="w-5 h-5 text-[#E8A33D]" />
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
                      />
                    </div>

                    {/* User List */}
                    {userSearch && filteredUsers.length > 0 && (
                      <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-3">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleUserSelect(user)}
                            className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                              <div className="text-xs text-gray-400">
                                {user.role?.displayName}
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
                            className="flex items-center gap-2 bg-[#E8A33D]/10 border border-[#E8A33D]/30 rounded-full px-3 py-1.5"
                          >
                            <span className="text-sm text-gray-700">
                              {user.firstName} {user.lastName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUserRemove(user.id)}
                              className="text-gray-400 hover:text-red-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E8A33D] focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  {/* Send Result */}
                  {sendResult && (
                    <div className={`p-4 rounded-lg ${
                      sendResult.success
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      {sendResult.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={sending || selectedUsers.length === 0}
                    className="w-full bg-[#E8A33D] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#F0B85C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

              {/* Bulk Email Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Bulk Email Information</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• You can select multiple recipients to send bulk emails via Mailjet</li>
                      <li>• Each email is sent individually with a small delay to avoid rate limiting</li>
                      <li>• Track delivery status for each recipient in the results</li>
                      <li>• Be mindful of your daily (200) and monthly (6,000) Mailjet limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
