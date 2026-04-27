'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';
import { isAdminEmail } from '@/config/admin';

interface Course {
  name: string;
  credits: string | number;
}

interface CourseRegistration {
  id?: string;
  userId: string;
  courses: Course[];
  totalCredits: number;
  takesReligion: boolean;
  registrationDate: string;
  lastUpdated?: string;
  semester?: string;
  academicYear?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function CreditsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([]);
  const router = useRouter();

  // Check if user is admin (URL-based authentication)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      const email = urlParams.get('email');

      if (!userId || !email) {
        router.push('/');
        return;
      }

      // Admin check - only authorized emails can access admin dashboard
      if (!isAdminEmail(email)) {
        router.push('/form');
        return;
      }

      // Set current user for dashboard
      const firstName = urlParams.get('firstName') || '';
      const lastName = urlParams.get('lastName') || '';
      
      setCurrentUser({
        adminId: userId,
        adminEmail: email,
        adminName: `${firstName} ${lastName}`.trim() || 'Admin'
      });
    }
  }, [router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-white hover:text-purple-200 transition-colors mb-4"
          >
            ← Back to Admin Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">Course Credits Management</h1>
          <p className="text-purple-200">Manage and view student course credits and registrations</p>
        </div>

        <AdminDashboard
          adminId={currentUser.adminId}
          adminEmail={currentUser.adminEmail}
          adminName={currentUser.adminName}
          initialSection="courses"
          showOnlySection={true}
        />
      </div>
    </div>
  );
}
