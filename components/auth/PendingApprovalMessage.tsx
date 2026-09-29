'use client';

import {
  CheckCircle2,
  Clock3,
  Building2,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
  Mail,
  ShieldCheck,
} from 'lucide-react';

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

export default function PendingApprovalMessage({
  user,
}: PendingApprovalMessageProps) {
  const initials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`;

  const location = [user.city, user.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="mx-auto w-full max-w-lg px-3 sm:px-0">
      <div className="relative max-h-[90vh] overflow-y-auto rounded-2xl border border-[#DADCD3] bg-[#FFFFFF] shadow-[0_16px_45px_rgba(18,32,59,0.10)]">

        {/* Confirmation header */}
        <div className="border-b border-[#DADCD3] bg-[#F7F6F2] px-6 py-8 text-center sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#B8DDC9] bg-[#EDF7F2]">
            <CheckCircle2
              className="h-8 w-8 text-[#17734B]"
              strokeWidth={2}
            />
          </div>

          <div className="mb-2 flex justify-center">
            <span className="rounded-full bg-[#E5F2E9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#17734B]">
              Registration complete
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[#12203B] sm:text-2xl">
            Welcome, {user.firstName}!
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6B7268]">
            Your account has been created successfully. It is now awaiting
            approval from your Tech Center administrator.
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-7">

          {/* Account information */}
          <section aria-labelledby="account-heading">
            <div className="mb-3 flex items-center justify-between">
              <h3
                id="account-heading"
                className="text-sm font-bold text-[#12203B]"
              >
                Account information
              </h3>
              <span className="text-xs text-[#8A9088]">
                Registration details
              </span>
            </div>

            <div className="rounded-xl border border-[#DADCD3] bg-white p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#12203B] text-base font-bold uppercase text-white">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#12203B]">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#6B7268]">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>

              {(user.phoneNumber || user.techCenter || location) && (
                <div className="mt-4 space-y-3 border-t border-[#E8E9E3] pt-4">
                  {user.phoneNumber && (
                    <div className="flex items-start gap-3 text-sm">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#8A9088]" />
                      <div className="min-w-0">
                        <p className="text-xs text-[#8A9088]">Phone number</p>
                        <p className="mt-0.5 break-words font-medium text-[#4B564C]">
                          {user.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.techCenter && (
                    <div className="flex items-start gap-3 text-sm">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8A9088]" />
                      <div className="min-w-0">
                        <p className="text-xs text-[#8A9088]">Tech Center</p>
                        <p className="mt-0.5 font-medium text-[#4B564C]">
                          {user.techCenter.name}
                        </p>
                        {user.techCenter.code && (
                          <p className="mt-0.5 text-xs text-[#8A9088]">
                            Center code: {user.techCenter.code}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {location && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8A9088]" />
                      <div className="min-w-0">
                        <p className="text-xs text-[#8A9088]">Location</p>
                        <p className="mt-0.5 font-medium text-[#4B564C]">
                          {location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Approval status */}
          <section
            aria-labelledby="approval-heading"
            className="rounded-xl border border-[#E8D5A9] bg-[#FFFAED] p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F9EBCB]">
                <Clock3 className="h-5 w-5 text-[#A87920]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="approval-heading"
                    className="text-sm font-bold text-[#12203B]"
                  >
                    Awaiting administrator approval
                  </h3>
                  <span className="rounded-full bg-[#F5E6BF] px-2 py-0.5 text-[10px] font-semibold text-[#876016]">
                    Pending
                  </span>
                </div>

                <p className="mt-1.5 text-xs leading-5 text-[#6B7268]">
                  Your registration is awaiting review. You will be able to
                  access your student dashboard once your account has been
                  approved.
                </p>
              </div>
            </div>
          </section>

          {/* Next steps */}
          <section aria-labelledby="next-steps-heading">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F1EC]">
                <ShieldCheck className="h-4 w-4 text-[#55705B]" />
              </div>
              <h3
                id="next-steps-heading"
                className="text-sm font-bold text-[#12203B]"
              >
                What happens next?
              </h3>
            </div>

            <ol className="space-y-4 pl-1">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8EEE7] text-xs font-bold text-[#55705B]">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#12203B]">
                    Registration review
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#6B7268]">
                    Your Tech Center administrator will review your
                    registration details.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8EEE7] text-xs font-bold text-[#55705B]">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#12203B]">
                    Account approval
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#6B7268]">
                    Contact your Tech Center administrator if you need
                    assistance with your approval.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8EEE7] text-xs font-bold text-[#55705B]">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#12203B]">
                    Access your dashboard
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#6B7268]">
                    Once approved, sign in to access your student portal
                    and its available features.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* Processing note */}
          <div className="flex items-start gap-2 border-t border-[#DADCD3] pt-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8A9088]" />
            <p className="text-xs leading-5 text-[#6B7268]">
              Approval times may vary. If your registration has not been
              reviewed within 24 hours, please contact your Tech Center
              administrator.
            </p>
          </div>

          {/* Return button */}
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#12203B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#0D182C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2"
          >
            Return to Home
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

