'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Home, LayoutDashboard, Users, Shield, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
  profileImageUrl?: string;
  techCenter?: {
    id: string;
    name: string;
    code: string;
  };
}

interface TechCenterData {
  users: AdminUser[];
  techCenter: {
    id: string;
    name: string;
    code: string;
  };
}

export default function AdminOverviewPage() {
  const router = useRouter();

  const { data: techCenterData, isLoading, error } = useQuery({
    queryKey: ['admin-tech-center-admins'],
    queryFn: async () => {
      const response = await fetch('/api/admin/tech-centers/users?role=admin');
      if (!response.ok) {
        throw new Error('Failed to fetch admin users');
      }
      return response.json() as Promise<TechCenterData>;
    },
  });

  const adminUsers = techCenterData?.users || [];

  return (
    <div className="min-h-screen">
      {/* Header with navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-lg bg-[#2A2438]/50 hover:bg-[#2A2438] text-[#A79C8C] hover:text-[#F5F0E8] transition-all duration-200"
          aria-label="Go home"
        >
          <Home className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-[#2A2438]" />
        
        <h1 className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: 'var(--font-display)' }}>
          Admin Overview
        </h1>
      </div>

      {/* Tech Center Administration Section */}
      <div className="bg-[#150F20] border border-[#2A2438] rounded-2xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#E8A33D]/10 border border-[#E8A33D]/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#E8A33D]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#F5F0E8]">
              {adminUsers.length > 0 && adminUsers[0].techCenter ? 
                `${adminUsers[0].techCenter.name} - Administrators` : 
                'Tech Center Administrators'}
            </h2>
            <p className="text-[#A79C8C] text-sm">
              {adminUsers.length > 0 && adminUsers[0].techCenter ? 
                `People who are administrators on ${adminUsers[0].techCenter.name}` : 
                'Manage administrators for your tech center'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#E8A33D] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error instanceof Error ? error.message : 'Failed to load admin users'}</p>
          </div>
        ) : adminUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[#A79C8C] mx-auto mb-4 opacity-50" />
            <p className="text-[#A79C8C]">No admin users found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {adminUsers.map((admin) => (
              <div
                key={admin.id}
                className="bg-[#2A2438]/30 border border-[#2A2438] rounded-xl p-6 hover:border-[#E8A33D]/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {admin.profileImageUrl ? (
                        <Image
                          src={admin.profileImageUrl}
                          alt={`${admin.firstName} ${admin.lastName}`}
                          width={40}
                          height={40}
                          unoptimized
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#E8A33D]/30"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#E8A33D]/20 flex items-center justify-center">
                          <span className="text-[#E8A33D] font-semibold">
                            {admin.firstName[0]}{admin.lastName[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-[#F5F0E8]">
                          {admin.firstName} {admin.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          {admin.isActive ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#A79C8C]">
                        <Mail className="w-4 h-4" />
                        <span>{admin.email}</span>
                      </div>
                      {admin.phoneNumber && (
                        <div className="flex items-center gap-2 text-[#A79C8C]">
                          <Phone className="w-4 h-4" />
                          <span>{admin.phoneNumber}</span>
                        </div>
                      )}
                      {(admin.city || admin.country) && (
                        <div className="flex items-center gap-2 text-[#A79C8C]">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {admin.city && `${admin.city}, `}
                            {admin.country}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[#A79C8C]">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {admin.techCenter && (
                    <div className="px-3 py-1.5 bg-[#E8A33D]/10 border border-[#E8A33D]/20 rounded-full">
                      <span className="text-[#E8A33D] text-sm font-medium">
                        {admin.techCenter.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
