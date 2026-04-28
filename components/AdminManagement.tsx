'use client';

import { useState, useEffect } from 'react';

interface Admin {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  addedAt: string;
  role: 'super-admin' | 'admin';
}

interface AdminManagementProps {
  adminId: string;
  adminEmail: string;
  adminName: string;
  isSuperAdmin: boolean;
}

export default function AdminManagement({ }: AdminManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins');
      const data = await response.json();

      if (data.success) {
        setAdmins(data.admins);
      } else {
        setMessage('Error fetching admins');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error');
      setMessageType('error');
    }
  };

  useEffect(() => {
    const loadAdmins = async () => {
      await fetchAdmins();
      setLoading(false);
    };

    loadAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminEmail) {
      setMessage('Email is required');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Admin added successfully!');
        setMessageType('success');
        setNewAdminEmail('');
        setShowAddForm(false);
        fetchAdmins();
      } else {
        setMessage(data.message || 'Error adding admin');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error');
      setMessageType('error');
    }
  };


  const handleRemoveAdmin = async (adminId: string) => {
    const admin = admins.find(a => a.id === adminId);
    const adminEmail = admin?.email;

    if (!confirm(`Are you sure you want to permanently remove ${adminEmail} from the admin system? This will completely delete their admin record.`)) return;

    try {
      const response = await fetch('/api/admins', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Admin removed successfully!');
        setMessageType('success');
        fetchAdmins();
      } else {
        setMessage(data.message || 'Error removing admin');
        setMessageType('error');
      }
    } catch {
      setMessage('Network error');
      setMessageType('error');
    }
  };


  // Any admin can manage other admins (except hardcoded super admin)
  // The API will prevent removing the super admin

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading admins...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Admin Management</h3>
          <p className="text-sm text-gray-600">Manage administrators </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Admin'}
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${messageType === 'success'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
          {message}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddAdmin} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Full Admin Access</strong><br />
              This admin will have complete access to all system features including:
              users, courses, announcements, tutors, and admin management.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
          >
            Add Admin
          </button>
        </form>
      )}

      <div className="space-y-3">
        {admins.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No promoted admins yet.</p>
        ) : (
          admins.map((admin) => (
            <div key={admin.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800">{admin.fullName}</h4>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                  <p className="text-xs text-gray-500">Added: {new Date(admin.addedAt).toLocaleDateString()}</p>

                  <div className="mt-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Full Admin Access
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Remove admin permanently"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
