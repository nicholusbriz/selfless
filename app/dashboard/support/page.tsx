'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  LifeBuoy,
  LoaderCircle,
  MessageSquareText,
  MoreVertical,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/lib/hooks/useAuth';
import { getResponseError, isRecord } from '../response-guards';

type SupportCategory = 'ISSUE' | 'FEATURE_REQUEST';
type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

interface SupportRequest {
  id: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface SupportQueryData {
  requests: SupportRequest[];
  canManage: boolean;
}

const CATEGORIES: Record<SupportCategory, string> = {
  ISSUE: 'Report an issue',
  FEATURE_REQUEST: 'Request a feature',
};

const STATUSES: Record<SupportStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
};

const INITIAL_FORM = {
  category: 'ISSUE' as SupportCategory,
  subject: '',
  message: '',
};

function isSupportRequest(value: unknown): value is SupportRequest {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    (value.category === 'ISSUE' || value.category === 'FEATURE_REQUEST') &&
    typeof value.subject === 'string' &&
    typeof value.message === 'string' &&
    (value.status === 'OPEN' ||
      value.status === 'IN_PROGRESS' ||
      value.status === 'RESOLVED') &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string' &&
    (value.user === undefined ||
      (isRecord(value.user) &&
        typeof value.user.firstName === 'string' &&
        typeof value.user.lastName === 'string' &&
        typeof value.user.email === 'string'))
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function SupportPage() {
  const { isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const menu = document.getElementById(
        `support-report-options-${openMenuId}`,
      );
      if (event.target instanceof Node && !menu?.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuId(null);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openMenuId]);

  const { data, isLoading, error } = useQuery<SupportQueryData>({
    queryKey: ['support-requests'],
    queryFn: async () => {
      const response = await fetch('/api/support');
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getResponseError(result, 'Failed to load reports'));
      }

      if (
        !isRecord(result) ||
        !Array.isArray(result.requests) ||
        typeof result.canManage !== 'boolean'
      ) {
        throw new Error('The server returned an invalid reports response');
      }

      return {
        requests: result.requests.filter(isSupportRequest),
        canManage: result.canManage,
      };
    },
    enabled: !authLoading,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getResponseError(result, 'Could not submit your report'));
      }
    },
    onSuccess: () => {
      setFormData(INITIAL_FORM);
      setFormError('');
      setFormSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
    },
    onError: (mutationError: Error) => {
      setFormError(mutationError.message);
      setFormSuccess(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: SupportStatus;
    }) => {
      const response = await fetch(`/api/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getResponseError(result, 'Could not update report'));
      }
    },
    onSuccess: () => {
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
    },
    onError: (mutationError: Error) => {
      setStatusError(mutationError.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/support/${id}`, {
        method: 'DELETE',
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        throw new Error(getResponseError(result, 'Could not delete report'));
      }
    },
    onSuccess: () => {
      setStatusError('');
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
    },
    onError: (mutationError: Error) => {
      setStatusError(mutationError.message);
    },
  });

  const requests = data?.requests ?? [];

  return (
    <main className="min-h-screen bg-[#F3F4F1] text-[#12203B]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        <section className="relative overflow-hidden bg-[#12203B] px-5 py-8 shadow-sm sm:px-8 sm:py-10">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-12 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
              <LifeBuoy className="h-4 w-4 text-[#E8A33D]" />
              IT Support
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              How can we help?
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Report a problem or suggest a feature. Your reports are visible
              to you and the support team.
            </p>
          </div>
        </section>

        <section className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="border border-[#E0E2DD] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#F5F1E8] text-[#9A702D]">
                <MessageSquareText className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Send a report</h2>
                <p className="mt-1 text-sm leading-5 text-[#667085]">
                  Include enough detail for the team to understand what you need.
                </p>
              </div>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setFormError('');
                setFormSuccess(false);
                createMutation.mutate();
              }}
            >
              <label className="block text-sm font-medium text-[#25344D]">
                What would you like to do?
                <select
                  value={formData.category}
                  onChange={(event) => {
                    setFormData({
                      ...formData,
                      category: event.target.value as SupportCategory,
                    });
                    setFormSuccess(false);
                  }}
                  className="mt-1.5 block w-full border border-[#CDD1CB] bg-white px-3 py-2.5 text-sm text-[#12203B] outline-none focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/15"
                >
                  <option value="ISSUE">Report an issue</option>
                  <option value="FEATURE_REQUEST">Request a feature</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#25344D]">
                Subject
                <input
                  required
                  maxLength={120}
                  value={formData.subject}
                  onChange={(event) => {
                    setFormData({ ...formData, subject: event.target.value });
                    setFormSuccess(false);
                  }}
                  placeholder="A short summary"
                  className="mt-1.5 block w-full border border-[#CDD1CB] bg-white px-3 py-2.5 text-sm text-[#12203B] outline-none placeholder:text-[#9A9F98] focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/15"
                />
              </label>

              <label className="block text-sm font-medium text-[#25344D]">
                Details
                <textarea
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  value={formData.message}
                  onChange={(event) => {
                    setFormData({ ...formData, message: event.target.value });
                    setFormSuccess(false);
                  }}
                  placeholder="Describe the issue or feature you would like to see."
                  className="mt-1.5 block w-full resize-y border border-[#CDD1CB] bg-white px-3 py-2.5 text-sm leading-6 text-[#12203B] outline-none placeholder:text-[#9A9F98] focus:border-[#B98A3E] focus:ring-2 focus:ring-[#B98A3E]/15"
                />
                <span className="mt-1 block text-right text-xs font-normal text-[#7A8495]">
                  {formData.message.length}/5000
                </span>
              </label>

              {formError && (
                <p role="alert" className="border border-[#E7C5BF] bg-[#FCF4F2] px-3 py-2.5 text-sm text-[#8D3E32]">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p role="status" className="border border-[#C7D9C9] bg-[#F1F7F1] px-3 py-2.5 text-sm text-[#365C3D]">
                  Your report was submitted. You can follow its status below.
                </p>
              )}

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 bg-[#12203B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2C49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createMutation.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {createMutation.isPending ? 'Submitting…' : 'Submit report'}
              </button>
            </form>
          </div>

          <aside className="border-l-2 border-[#B98A3E] pl-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#55705B]" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A8495]">
                Your privacy
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#596579]">
              Your reports are visible only to you and the support team.
              Do not include passwords, verification codes, or other sensitive
              account details.
            </p>
          </aside>
        </section>

        <section className="mt-10">
          <div className="flex flex-col gap-2 border-b border-[#D9DCD6] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A8495]">
                {data?.canManage ? 'Support inbox' : 'Your activity'}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                {data?.canManage ? 'User reports' : 'My reports'}
              </h2>
            </div>
            {!isLoading && !error && (
              <p className="text-xs text-[#7A8495]">
                {requests.length} {requests.length === 1 ? 'report' : 'reports'}
              </p>
            )}
          </div>

          {statusError && (
            <p role="alert" className="mt-4 border border-[#E7C5BF] bg-[#FCF4F2] px-4 py-3 text-sm text-[#8D3E32]">
              {statusError}
            </p>
          )}

          {error && (
            <p role="alert" className="mt-4 border border-[#E7C5BF] bg-[#FCF4F2] px-4 py-3 text-sm text-[#8D3E32]">
              {error instanceof Error ? error.message : 'Could not load reports.'}
            </p>
          )}

          {isLoading && (
            <div className="mt-5 space-y-3" aria-label="Loading reports">
              <div className="h-28 animate-pulse bg-white" />
              <div className="h-28 animate-pulse bg-white" />
            </div>
          )}

          {!isLoading && !error && requests.length === 0 && (
            <div className="mt-5 border border-dashed border-[#D3D6D0] bg-white px-5 py-8">
              <p className="text-sm font-medium text-[#25344D]">
                {data?.canManage
                  ? 'There are no user reports yet.'
                  : 'You have not submitted a report yet.'}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#70786F]">
                Reports you submit will appear here with their latest status.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {requests.map((request) => (
              <article
                key={request.id}
                className="border border-[#E0E2DD] bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#8B641F]">
                        {CATEGORIES[request.category]}
                      </span>
                      <span className="text-xs text-[#9A9F98]">·</span>
                      <span className="inline-flex items-center gap-1 text-xs text-[#667085]">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatDate(request.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-2 break-words text-base font-semibold text-[#12203B]">
                      {request.subject}
                    </h3>
                    {data?.canManage && request.user && (
                      <p className="mt-1 text-xs text-[#667085]">
                        {request.user.firstName} {request.user.lastName} ·{' '}
                        {request.user.email}
                      </p>
                    )}
                  </div>

                  {data?.canManage ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <label className="text-xs font-medium text-[#596579]">
                        Status
                        <select
                          value={request.status}
                          onChange={(event) => {
                            setStatusError('');
                            statusMutation.mutate({
                              id: request.id,
                              status: event.target.value as SupportStatus,
                            });
                          }}
                          disabled={statusMutation.isPending}
                          aria-label={`Status for ${request.subject}`}
                          className="ml-2 border border-[#CDD1CB] bg-white px-2 py-1.5 text-xs text-[#25344D] outline-none focus:border-[#B98A3E] disabled:opacity-60"
                        >
                          {Object.entries(STATUSES).map(([status, label]) => (
                            <option key={status} value={status}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div
                        id={`support-report-options-${request.id}`}
                        className="relative"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((current) =>
                              current === request.id ? null : request.id,
                            )
                          }
                          aria-label={`More options for ${request.subject}`}
                          aria-haspopup="menu"
                          aria-expanded={openMenuId === request.id}
                          className="inline-flex h-8 w-8 items-center justify-center text-[#596579] hover:bg-[#F3F4F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === request.id && (
                          <div
                            role="menu"
                            className="absolute right-0 top-full z-10 mt-1 min-w-36 border border-[#E0E2DD] bg-white p-1 shadow-lg"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                if (
                                  window.confirm(
                                    `Delete "${request.subject}"? This cannot be undone.`,
                                  )
                                ) {
                                  setStatusError('');
                                  deleteMutation.mutate(request.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-[#8D3E32] hover:bg-[#FCF4F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deleteMutation.isPending ? (
                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Delete report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${
                        request.status === 'RESOLVED'
                          ? 'bg-[#EEF5EF] text-[#365C3D]'
                          : request.status === 'IN_PROGRESS'
                            ? 'bg-[#F5F1E8] text-[#8B641F]'
                            : 'bg-[#EEF1F5] text-[#435066]'
                      }`}
                    >
                      {request.status === 'RESOLVED' ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock3 className="h-3.5 w-3.5" />
                      )}
                      {STATUSES[request.status]}
                    </span>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#596579]">
                  {request.message}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
