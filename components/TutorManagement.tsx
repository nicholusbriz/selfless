'use client';

import { useState } from 'react';
import { useTutors, useAddTutor, useRemoveTutor } from '@/hooks/adminHooks';

interface TutorManagementProps {
  adminId: string;
  adminEmail: string;
  adminName: string;
}

export default function TutorManagement({ }: TutorManagementProps) {
  // Use API hooks
  const { data: tutors = [], isLoading: loading } = useTutors();
  const addTutor = useAddTutor();
  const removeTutor = useRemoveTutor();

  // Local state for UI only
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTutorEmail, setNewTutorEmail] = useState('');
  const [newTutorPermissions, setNewTutorPermissions] = useState({
    canViewAnnouncements: true,
    canPostAnnouncements: true,
    canManageUsers: false
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  // Add tutor
  const handleAddTutor = async () => {
    if (!newTutorEmail.trim()) {
      setMessage('Please enter a valid email');
      setMessageType('error');
      return;
    }

    try {
      await addTutor.mutateAsync({
        email: newTutorEmail.trim(),
        permissions: newTutorPermissions,
      });

      setMessage('Tutor added successfully');
      setMessageType('success');
      setNewTutorEmail('');
      setNewTutorPermissions({
        canViewAnnouncements: true,
        canPostAnnouncements: true,
        canManageUsers: false
      });
      setShowAddForm(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error adding tutor';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  // Remove tutor
  const handleRemoveTutor = async (tutorId: string) => {
    try {
      await removeTutor.mutateAsync(tutorId);
      setMessage('Tutor removed successfully');
      setMessageType('success');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error removing tutor';
      setMessage(errorMessage);
      setMessageType('error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading tutors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Tutor Management</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Tutor'}
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
        <form onSubmit={handleAddTutor} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Email
            </label>
            <input
              type="email"
              value={newTutorEmail}
              onChange={(e) => setNewTutorEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Permissions</label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newTutorPermissions.canViewAnnouncements}
                onChange={(e) => setNewTutorPermissions({
                  ...newTutorPermissions,
                  canViewAnnouncements: e.target.checked
                })}
                className="mr-2"
              />
              <span className="text-sm">Can View Announcements</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newTutorPermissions.canPostAnnouncements}
                onChange={(e) => setNewTutorPermissions({
                  ...newTutorPermissions,
                  canPostAnnouncements: e.target.checked
                })}
                className="mr-2"
              />
              <span className="text-sm">Can Post Announcements</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newTutorPermissions.canManageUsers}
                onChange={(e) => setNewTutorPermissions({
                  ...newTutorPermissions,
                  canManageUsers: e.target.checked
                })}
                className="mr-2"
              />
              <span className="text-sm">Can Manage Users</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
          >
            Add Tutor
          </button>
        </form>
      )}

      <div className="space-y-3">
        {tutors.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tutors added yet.</p>
        ) : (
          tutors.map((tutor) => (
            <div key={tutor.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800">{tutor.fullName}</h4>
                  <p className="text-sm text-gray-600">{tutor.email}</p>
                  <p className="text-xs text-gray-500">Added: {tutor.addedAt ? new Date(tutor.addedAt).toLocaleDateString() : 'Unknown'}</p>

                  <div className="mt-2 space-y-1">
                    {tutor.permissions?.canViewAnnouncements && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Can View Announcements
                      </span>
                    )}
                    {tutor.permissions?.canPostAnnouncements && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-1">
                        Can Post Announcements
                      </span>
                    )}
                    {tutor.permissions?.canManageSchedule && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded ml-1">
                        Can Manage Schedule
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveTutor(tutor.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Remove tutor permanently"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
