'use client';

import { useState } from 'react';
import { useAdmins, useAddAdmin, useRemoveAdmin } from '@/hooks/adminHooks';

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

export default function AdminManagement() {
  // Use API hooks
  const { data: admins = [], isLoading: loading } = useAdmins();
  const addAdmin = useAddAdmin();
  const removeAdmin = useRemoveAdmin();

  // Local state for UI only
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Add admin
  const handleAddAdmin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!newAdminEmail.trim()) {
      setMessage('Please enter a valid email');
      setMessageType('error');
      return;
    }

    try {
      await addAdmin.mutateAsync({
        email: newAdminEmail.trim(),
        firstName: '',
        lastName: '',
      });

      setMessage('Admin added successfully');
      setMessageType('success');
      setNewAdminEmail('');
      setShowAddForm(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error adding admin';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  // Remove admin
  const handleRemoveAdmin = async (adminId: string) => {
    try {
      await removeAdmin.mutateAsync(adminId);
      setMessage('Admin removed successfully');
      setMessageType('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error removing admin';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

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
                  <p className="text-xs text-gray-500">Added: {admin.addedAt ? new Date(admin.addedAt).toLocaleDateString() : 'Unknown'}</p>

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
