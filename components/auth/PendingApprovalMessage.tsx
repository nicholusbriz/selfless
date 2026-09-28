'use client';

import { CheckCircle, Clock, Building2, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';

interface PendingApprovalMessageProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    techCenter?: {
      name: string;
      code: string;
    };
    country?: string;
    city?: string;
  };
}

const COLORS = {
  navy: '#12203B',
  navyDeep: '#0D182C',
  brass: '#B98A3E',
  brassLight: '#E8A33D',
  white: '#FFFFFF',
  softWhite: '#F7F6F2',
  page: '#F1F1EC',
  border: '#DADCD3',
  muted: '#6B7268',
  subtle: '#8A9088',
};

export default function PendingApprovalMessage({ user }: PendingApprovalMessageProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="bg-[#F1F1EC] rounded-2xl border border-[#DADCD3] p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative shadow-[0_24px_60px_rgba(13,24,44,0.35)]"
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#EDF7F2] flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-[#17734B]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#12203B] mb-2">
            Account Created Successfully
          </h2>
          <p className="text-[#4B564C] text-sm leading-5">
            Your account has been created and is pending admin approval
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-xl border border-[#DADCD3] p-4 mb-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#DADCD3]">
            <div className="w-12 h-12 rounded-full bg-[#E8A33D] flex items-center justify-center text-white font-bold text-lg">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-[#12203B]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-[#6B7268]">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            {user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-[#4B564C]">
                <Phone className="w-4 h-4 text-[#8A9088]" />
                <span>{user.phoneNumber}</span>
              </div>
            )}

            {user.techCenter && (
              <div className="flex items-center gap-2 text-sm text-[#4B564C]">
                <Building2 className="w-4 h-4 text-[#8A9088]" />
                <span>{user.techCenter.name}</span>
              </div>
            )}

            {(user.city || user.country) && (
              <div className="flex items-center gap-2 text-sm text-[#4B564C]">
                <MapPin className="w-4 h-4 text-[#8A9088]" />
                <span>
                  {user.city && user.country
                    ? `${user.city}, ${user.country}`
                    : user.city || user.country}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pending Status */}
        <div className="bg-[#FFF8E7] rounded-lg border border-[#E8A33D]/30 p-4 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#E8A33D] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#12203B] text-sm mb-1">
                Pending Admin Approval
              </p>
              <p className="text-xs text-[#6B7268] leading-5">
                Your registration request has been sent to the admin for review.
                You will be able to access the dashboard once your account is
                verified and approved.
              </p>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-[#F1F5F9] rounded-lg border border-[#DADCD3] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#6B7268] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#12203B] text-sm mb-1">
                What happens next?
              </p>
              <ul className="text-xs text-[#6B7268] leading-5 space-y-1">
                <li>• An admin will review your registration</li>
                <li>• Contact your Tech Center Admin and let them know so that they can approve your account immediately</li>
                <li>• Once approved, you can log in to access the dashboard</li>
                <li>• This typically takes not morethan 24 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="w-full mt-6 py-3 bg-[#12203B] hover:bg-[#0D182C] rounded-lg font-bold text-white transition-all duration-200 shadow-[0_4px_14px_rgba(18,32,59,0.25)] hover:shadow-[0_6px_20px_rgba(18,32,59,0.35)]"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}