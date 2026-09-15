'use client';

import { useState } from 'react';
import {
  Check,
  Copy,
  Headphones,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/lib/hooks/useAuth';

interface SupportResource {
  id: string;
  title: string;
  link: string;
  description: string;
  createdAt: string;
}

interface SupportQueryData {
  resources: SupportResource[];
  canManage: boolean;
}

const INITIAL_FORM = {
  title: '',
  link: '',
  description: '',
};

function SupportResourceSkeleton() {
  return (
    <div className="animate-pulse border-b border-[#E3E5E0] py-5 first:border-t">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-5 w-48 rounded bg-[#E5E7E3]" />
          <div className="mt-3 h-4 w-full max-w-xl rounded bg-[#ECEDE9]" />
          <div className="mt-2 h-4 w-3/4 max-w-lg rounded bg-[#ECEDE9]" />
        </div>

        <div className="h-8 w-8 rounded bg-[#ECEDE9]" />
      </div>

      <div className="mt-4 h-10 w-full rounded-lg bg-[#F0F1EE]" />
    </div>
  );
}

export default function SupportPage() {
  const { isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // <-- NEW

  const { data, isLoading, error } = useQuery<SupportQueryData>({
    queryKey: ['support-resources'],
    queryFn: async () => {
      const response = await fetch('/api/support');

      if (!response.ok) {
        throw new Error('Failed to load support resources');
      }

      return response.json();
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add support resource');
      }

      return result;
    },
    onSuccess: () => {
      setFormData(INITIAL_FORM);
      setFormError('');
      setShowForm(false); // <-- hide form on success

      queryClient.invalidateQueries({
        queryKey: ['support-resources'],
      });
    },
    onError: (mutationError: Error) => {
      setFormError(mutationError.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await fetch(`/api/support/${resourceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete support resource');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['support-resources'],
      });
    },
  });

  const handleCopy = async (id: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2000);
    } catch {
      // Ignore clipboard failures.
    }
  };

  const handleCancelForm = () => {
    setFormData(INITIAL_FORM);
    setFormError('');
    setShowForm(false);
  };

  const resources = data?.resources ?? [];

  return (
    <main className="min-h-screen bg-[#F3F4F1] text-[#12203B]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* ============================================================
            HERO
        ============================================================ */}
        <section className="relative isolate overflow-hidden rounded-xl bg-[#12203B] shadow-sm">
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label="IT support video"
          >
            <source src="/support.mp4" type="video/mp4" />
          </video>

          {/* Controlled overlay for readability */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[#07111D]/60" />
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#07111D]/85 via-[#07111D]/55 to-[#07111D]/25" />

          <div className="relative z-20 flex min-h-[270px] items-end px-5 py-7 sm:min-h-[310px] sm:px-8 sm:py-9 lg:px-10">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <Headphones className="h-3.5 w-3.5 text-[#E8A33D]" />
                IT Help Desk
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Need technical help?
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
                Use the support resources below to report an issue, find
                guidance, or get assistance with the systems you use for your
                studies.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            INTRODUCTION
        ============================================================ */}
        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A8495]">
              Support centre
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#12203B] sm:text-3xl">
              IT support and useful resources
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#596579] sm:text-base">
              Find the support services and guidance provided for students and
              staff. When reporting a problem, provide enough detail for the
              support team to understand what is happening and assist you
              efficiently.
            </p>
          </div>

          <aside className="border-l-2 border-[#B98A3E] pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A8495]">
              Before contacting support
            </p>

            <p className="mt-2 text-sm leading-6 text-[#596579]">
              Have your name, the affected service, and a brief description of
              the problem ready.
            </p>
          </aside>
        </section>

        {/* ============================================================
            SUPPORT RESOURCES
        ============================================================ */}
        <section className="mt-9">
          <div className="flex flex-col gap-2 border-b border-[#D9DCD6] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A8495]">
                Resources
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#12203B] sm:text-2xl">
                Support resources
              </h2>
            </div>

            {!isLoading && !error && resources.length > 0 && (
              <p className="text-xs text-[#7A8495]">
                {resources.length}{' '}
                {resources.length === 1 ? 'resource' : 'resources'} available
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 border border-[#E7C5BF] bg-[#FCF4F2] px-4 py-3 text-sm text-[#8D3E32]"
            >
              We could not load the support resources. Please try again later.
            </div>
          )}

          {isLoading && (
            <div>
              <SupportResourceSkeleton />
              <SupportResourceSkeleton />
              <SupportResourceSkeleton />
            </div>
          )}

          {!isLoading && !error && resources.length === 0 && (
            <div className="mt-5 border border-dashed border-[#D3D6D0] bg-white px-5 py-8">
              <p className="text-sm font-medium text-[#25344D]">
                No support resources are currently available.
              </p>

              <p className="mt-1 text-sm leading-6 text-[#70786F]">
                Please check again later or contact your designated support
                team if you need immediate assistance.
              </p>
            </div>
          )}

          {!isLoading && !error && resources.length > 0 && (
            <div className="mt-1">
              {resources.map((resource) => {
                const isCopied = copiedId === resource.id;

                return (
                  <article
                    key={resource.id}
                    className="group border-b border-[#E0E2DD] py-5 first:border-t"
                  >
                    <div className="flex items-start gap-4">
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center bg-[#F0F1ED] text-[#55705B] sm:flex">
                        <Headphones className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-[#12203B] sm:text-lg">
                              {resource.title}
                            </h3>

                            {resource.description && (
                              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#626B64]">
                                {resource.description}
                              </p>
                            )}
                          </div>

                          {data?.canManage && (
                            <button
                              type="button"
                              title="Delete support resource"
                              aria-label={`Delete ${resource.title}`}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Delete this support resource?'
                                  )
                                ) {
                                  deleteMutation.mutate(resource.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="shrink-0 rounded-md p-2 text-[#8A9088] transition-colors hover:bg-[#FCF4F2] hover:text-[#A4462F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="mt-4 flex min-w-0 items-center gap-2">
                          <div className="min-w-0 flex-1 border border-[#D9DCD6] bg-[#F7F8F5] px-3 py-2.5">
                            <code className="block truncate font-mono text-xs text-[#435066]">
                              {resource.link}
                            </code>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(resource.id, resource.link)
                            }
                            title={
                              isCopied ? 'Link copied' : 'Copy support link'
                            }
                            aria-label={
                              isCopied
                                ? 'Link copied'
                                : `Copy link for ${resource.title}`
                            }
                            className={`inline-flex h-10 shrink-0 items-center gap-1.5 border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2 ${
                              isCopied
                                ? 'border-[#55705B] bg-[#55705B] text-white'
                                : 'border-[#CDD1CB] bg-white text-[#25344D] hover:border-[#B98A3E] hover:text-[#8B641F]'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  Copied
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  Copy
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================
            ADMIN RESOURCE MANAGEMENT
        ============================================================ */}
        {data?.canManage && (
          <section className="mt-10 border-t border-[#D9DCD6] pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A8495]">
                  Administration
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#12203B]">
                  Manage support resources
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  Add a trusted support resource that should be available to
                  users across the dashboard.
                </p>
              </div>

              {/* Toggle button – only shown when form is hidden */}
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="inline-flex shrink-0 items-center gap-2 bg-[#12203B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2C49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2"
                >
                  <Plus className="h-4 w-4" />
                  Add resource
                </button>
              )}
            </div>

            {/* Form – only shown when toggled open */}
            {showForm && (
              <form
                className="mt-6 grid max-w-4xl gap-5 rounded-lg border border-[#D9DCD6] bg-white p-5 sm:p-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  setFormError('');
                  createMutation.mutate();
                }}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-medium text-[#25344D]">
                    Resource name
                    <input
                      required
                      value={formData.title}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          title: event.target.value,
                        })
                      }
                      className="mt-2 block w-full border border-[#CDD1CB] bg-white px-3 py-2.5 text-sm font-normal text-[#12203B] outline-none transition-colors placeholder:text-[#9A9F98] focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                      placeholder="e.g. Student IT Help Desk"
                    />
                  </label>

                  <label className="text-sm font-medium text-[#25344D]">
                    Resource link
                    <input
                      required
                      type="url"
                      value={formData.link}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          link: event.target.value,
                        })
                      }
                      className="mt-2 block w-full border border-[#CDD1CB] bg-white px-3 py-2.5 text-sm font-normal text-[#12203B] outline-none transition-colors placeholder:text-[#9A9F98] focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                      placeholder="https://example.com"
                    />
                  </label>
                </div>

                <label className="text-sm font-medium text-[#25344D]">
                  Description
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                    className="mt-2 block w-full resize-y border border-[#CDD1CB] bg-white px-3 py-2.5 text-sm font-normal text-[#12203B] outline-none transition-colors placeholder:text-[#9A9F98] focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                    placeholder="Briefly explain what users can do or find through this resource."
                  />
                </label>

                {formError && (
                  <div
                    role="alert"
                    className="border border-[#E7C5BF] bg-[#FCF4F2] px-4 py-3 text-sm text-[#8D3E32]"
                  >
                    {formError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 bg-[#12203B] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1B2C49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {createMutation.isPending
                      ? 'Adding resource...'
                      : 'Add resource'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelForm}
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 border border-[#CDD1CB] bg-white px-4 py-2.5 text-sm font-medium text-[#25344D] transition-colors hover:border-[#B98A3E] hover:text-[#8B641F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* ============================================================
            SECURITY NOTICE
        ============================================================ */}
        <section className="mt-9 border-t border-[#D9DCD6] pt-6 pb-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#55705B]" />

            <div>
              <p className="text-sm font-semibold text-[#25344D]">
                Keep your account secure
              </p>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-[#667085]">
                Never share your password, verification codes, or other
                account credentials with anyone, including support staff.
                When reporting an issue, provide your name and a clear
                description of the problem.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}