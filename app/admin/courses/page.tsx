'use client';

import { useState, useEffect } from 'react';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminCoursesPage() {
  const [adminInfo, setAdminInfo] = useState({
    adminId: '',
    adminEmail: '',
    adminName: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get admin info from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const adminId = urlParams.get('adminId') || '';
    const adminEmail = urlParams.get('email') || '';
    const adminName = urlParams.get('adminName') || 'Admin';

    setAdminInfo({
      adminId,
      adminEmail,
      adminName
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Course Submissions Management</h1>
            <button
              onClick={() => window.close()}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
        </div>
      </div>
      <AdminDashboard {...adminInfo} initialSection="courses" />
    </div>
  );
}
