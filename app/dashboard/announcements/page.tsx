'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Home,
  Plus,
  Trash2,
  Edit,
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';

interface Announcement {
  id: string;
  title: string;
  content: string;
  deadline: string | null;
  isGlobal: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    role: {
      name: string;
      displayName: string;
    };
  };
  techCenter: {
    id: string;
    name: string;
  } | null;
}

const INITIAL_FORM = {
  title: '',
  content: '',
  deadline: '',
  isGlobal: false,
};

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] =
    useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [formData, setFormData] = useState(INITIAL_FORM);

  // ---------------------------------------------------------
  // FETCH ANNOUNCEMENTS
  // ---------------------------------------------------------

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const currentUser = data?.currentUser;
  const announcements: Announcement[] = data?.announcements || [];

  // ---------------------------------------------------------
  // ANNOUNCEMENT COUNT
  // ---------------------------------------------------------

  useQuery({
    queryKey: ['announcements', 'count'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/announcements');

        if (!response.ok) {
          return 0;
        }

        const result = await response.json();
        return result.announcements?.length || 0;
      } catch (error) {
        console.error('Error fetching announcement count:', error);
        return 0;
      }
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: async (announcementData: typeof INITIAL_FORM) => {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcementData),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      return response.json();
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['announcements'],
      });

      const previousData = queryClient.getQueryData([
        'announcements',
      ]);

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['announcements'],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['announcements'],
      });

      queryClient.invalidateQueries({
        queryKey: ['announcements', 'count'],
      });
    },
  });

  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------

  const updateMutation = useMutation({
    mutationFn: async ({
      announcementId,
      data,
    }: {
      announcementId: string;
      data: typeof INITIAL_FORM;
    }) => {
      const response = await fetch(
        `/api/announcements/${announcementId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update announcement');
      }

      return response.json();
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ['announcements'],
      });

      const previousData = queryClient.getQueryData([
        'announcements',
      ]);

      queryClient.setQueryData(
        ['announcements'],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            announcements: old.announcements.map(
              (announcement: Announcement) =>
                announcement.id === variables.announcementId
                  ? {
                      ...announcement,
                      title:
                        variables.data.title ||
                        announcement.title,
                      content:
                        variables.data.content ||
                        announcement.content,
                      deadline: variables.data.deadline
                        ? new Date(
                            variables.data.deadline
                          ).toISOString()
                        : announcement.deadline,
                      isGlobal:
                        variables.data.isGlobal !== undefined
                          ? variables.data.isGlobal
                          : announcement.isGlobal,
                    }
                  : announcement
            ),
          };
        }
      );

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['announcements'],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['announcements'],
      });

      queryClient.invalidateQueries({
        queryKey: ['announcements', 'count'],
      });
    },
  });

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------

  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await fetch(
        `/api/announcements/${announcementId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }

      return response.json();
    },

    onMutate: async (announcementId) => {
      await queryClient.cancelQueries({
        queryKey: ['announcements'],
      });

      const previousData = queryClient.getQueryData([
        'announcements',
      ]);

      queryClient.setQueryData(
        ['announcements'],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            announcements: old.announcements.filter(
              (announcement: Announcement) =>
                announcement.id !== announcementId
            ),
          };
        }
      );

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['announcements'],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['announcements'],
      });

      queryClient.invalidateQueries({
        queryKey: ['announcements', 'count'],
      });
    },
  });

  // ---------------------------------------------------------
  // CREATE HANDLER
  // ---------------------------------------------------------

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and description');
      return;
    }

    try {
      await createMutation.mutateAsync(formData);

      setShowCreateForm(false);
      setFormData(INITIAL_FORM);
    } catch (error) {
      console.error(
        'Failed to create announcement:',
        error
      );
    }
  };

  // ---------------------------------------------------------
  // EDIT HANDLER
  // ---------------------------------------------------------

  const handleEditAnnouncement = (
    announcement: Announcement
  ) => {
    setEditingAnnouncement(announcement);

    setFormData({
      title: announcement.title,
      content: announcement.content,
      deadline: announcement.deadline
        ? new Date(announcement.deadline)
            .toISOString()
            .slice(0, 16)
        : '',
      isGlobal: announcement.isGlobal,
    });

    setShowCreateForm(false);
    setShowEditForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // ---------------------------------------------------------
  // UPDATE HANDLER
  // ---------------------------------------------------------

  const handleUpdateAnnouncement = async () => {
    if (
      !editingAnnouncement ||
      !formData.title.trim() ||
      !formData.content.trim()
    ) {
      alert('Please fill in title and description');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        announcementId: editingAnnouncement.id,
        data: formData,
      });

      setShowEditForm(false);
      setEditingAnnouncement(null);
      setFormData(INITIAL_FORM);
    } catch (error) {
      console.error(
        'Failed to update announcement:',
        error
      );
    }
  };

  // ---------------------------------------------------------
  // DELETE HANDLER
  // ---------------------------------------------------------

  const handleDeleteAnnouncement = async (
    announcementId: string
  ) => {
    if (
      !confirm(
        'Are you sure you want to delete this announcement?'
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(announcementId);
    } catch (error) {
      console.error(
        'Failed to delete announcement:',
        error
      );
    }
  };

  // ---------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------

  const toggleExpand = (announcementId: string) => {
    setExpandedAnnouncement(
      expandedAnnouncement === announcementId
        ? null
        : announcementId
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwner = (announcement: Announcement) => {
    return announcement.author.id === user?.id;
  };

  const canDelete = (announcement: Announcement) => {
    return (
      isOwner(announcement) ||
      currentUser?.isAdmin
    );
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    setFormData(INITIAL_FORM);
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingAnnouncement(null);
    setFormData(INITIAL_FORM);
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white border border-[#E2E8F0]" />
            <div className="h-10 w-10 animate-pulse rounded-xl bg-white border border-[#E2E8F0]" />
            <div className="h-10 w-48 animate-pulse rounded-lg bg-[#E2E8F0]" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <Bell className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="text-lg font-semibold text-[#1E293B]">
            Unable to load announcements
          </h2>

          <p className="mt-2 text-sm text-[#64748B]">
            Something went wrong while loading the announcements.
          </p>

          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ['announcements'],
              })
            }
            className="mt-5 rounded-xl bg-[#1A365D] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153475]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN PAGE
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#1E293B]">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#1A365D]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              aria-label="Go to dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition-all hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#1A365D]"
            >
              <Home className="h-5 w-5" />
            </button>

            <div className="mx-1 hidden h-7 w-px bg-[#E2E8F0] sm:block" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4FB]">
                <Bell className="h-5 w-5 text-[#1A365D]" />
              </div>

              <div className="min-w-0">
                <h1
                  className="truncate text-xl font-bold text-[#1A365D] sm:text-2xl"
                  style={{
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  Announcements
                </h1>

                <p className="text-sm text-[#64748B]">
                  {announcements.length}{' '}
                  {announcements.length === 1
                    ? 'announcement'
                    : 'announcements'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page intro */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3182CE]">
              Communication
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#1E293B] sm:text-2xl">
              Stay informed
            </h2>

            <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
              Important updates, deadlines and information
              from your tech center.
            </p>
          </div>

          <div className="hidden rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm text-[#64748B] shadow-sm sm:block">
            <span className="font-semibold text-[#1A365D]">
              {announcements.length}
            </span>{' '}
            active announcements
          </div>
        </div>

        {/* =================================================
            CREATE BUTTON
        ================================================== */}

        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowEditForm(false);
            setEditingAnnouncement(null);
            setFormData(INITIAL_FORM);
          }}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A365D] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#153475] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#3182CE]/30 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          {showCreateForm
            ? 'Close Announcement Form'
            : 'Create Announcement'}
        </button>

        {/* =================================================
            CREATE FORM
        ================================================== */}

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              className="mb-6 overflow-hidden"
            >
              <AnnouncementForm
                title="Create Announcement"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateAnnouncement}
                onCancel={closeCreateForm}
                isPending={createMutation.isPending}
                submitLabel="Create Announcement"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            EDIT FORM
        ================================================== */}

        <AnimatePresence>
          {showEditForm && editingAnnouncement && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              className="mb-6 overflow-hidden"
            >
              <AnnouncementForm
                title="Edit Announcement"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateAnnouncement}
                onCancel={closeEditForm}
                isPending={updateMutation.isPending}
                submitLabel="Save Changes"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            ANNOUNCEMENTS
        ================================================== */}

        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1F5F9]">
              <Bell className="h-7 w-7 text-[#64748B]" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-[#1E293B]">
              No announcements yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B]">
              There are currently no announcements available.
              Create the first announcement to keep students
              informed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(
              (
                announcement: Announcement,
                index: number
              ) => (
                <motion.article
                  key={announcement.id}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(index * 0.04, 0.2),
                  }}
                  className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Announcement header */}
                  <div
                    className="cursor-pointer p-4 sm:p-5"
                    onClick={() =>
                      toggleExpand(announcement.id)
                    }
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Author avatar */}
                      {announcement.author
                        .profileImageUrl ? (
                        <img
                          src={
                            announcement.author
                              .profileImageUrl
                          }
                          alt={`${announcement.author.firstName} ${announcement.author.lastName}`}
                          className="h-11 w-11 shrink-0 rounded-full border-2 border-[#E2E8F0] object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A365D] text-sm font-bold text-white">
                          {announcement.author.firstName.charAt(
                            0
                          )}
                          {announcement.author.lastName.charAt(
                            0
                          )}
                        </div>
                      )}

                      {/* Main information */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {announcement.isGlobal && (
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#1A365D]">
                              Global
                            </span>
                          )}

                          {announcement.techCenter && (
                            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              {announcement.techCenter.name}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold leading-6 text-[#1E293B] sm:text-lg">
                          {announcement.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-[#64748B] sm:text-sm">
                          <span className="font-medium text-[#475569]">
                            {announcement.author.firstName}{' '}
                            {announcement.author.lastName}
                          </span>

                          <span className="hidden text-[#CBD5E1] sm:inline">
                            •
                          </span>

                          <span>
                            {announcement.author.role
                              .displayName}
                          </span>

                          {announcement.deadline && (
                            <>
                              <span className="hidden text-[#CBD5E1] sm:inline">
                                •
                              </span>

                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-[#3182CE]" />
                                Deadline:{' '}
                                {formatDate(
                                  announcement.deadline
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className="flex shrink-0 items-center gap-1"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          onClick={() =>
                            toggleExpand(
                              announcement.id
                            )
                          }
                          aria-label={
                            expandedAnnouncement ===
                            announcement.id
                              ? 'Collapse announcement'
                              : 'Expand announcement'
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#1A365D]"
                        >
                          {expandedAnnouncement ===
                          announcement.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>

                        {isOwner(announcement) && (
                          <button
                            onClick={() =>
                              handleEditAnnouncement(
                                announcement
                              )
                            }
                            aria-label="Edit announcement"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#3182CE] transition-colors hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}

                        {canDelete(announcement) && (
                          <button
                            onClick={() =>
                              handleDeleteAnnouncement(
                                announcement.id
                              )
                            }
                            disabled={
                              deleteMutation.isPending
                            }
                            aria-label="Delete announcement"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable content */}
                  <AnimatePresence initial={false}>
                    {expandedAnnouncement ===
                      announcement.id && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: 'auto',
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.22,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5 sm:px-5">
                          <div className="sm:pl-[3.75rem]">
                            <p className="whitespace-pre-wrap text-sm leading-6 text-[#475569] sm:text-[15px]">
                              {announcement.content}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#94A3B8]">
                              <span>
                                Published{' '}
                                {formatDate(
                                  announcement.createdAt
                                )}
                              </span>

                              {announcement.deadline && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium text-[#64748B]">
                                    Deadline{' '}
                                    {formatDate(
                                      announcement.deadline
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// =============================================================
// ANNOUNCEMENT FORM
// =============================================================

interface AnnouncementFormProps {
  title: string;
  formData: {
    title: string;
    content: string;
    deadline: string;
    isGlobal: boolean;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      content: string;
      deadline: string;
      isGlobal: boolean;
    }>
  >;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

function AnnouncementForm({
  title,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: AnnouncementFormProps) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
      {/* Form heading */}
      <div className="mb-6 border-b border-[#E2E8F0] pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF4FB]">
            <Bell className="h-5 w-5 text-[#1A365D]" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1E293B]">
              {title}
            </h3>

            <p className="text-sm text-[#64748B]">
              Share important information with students.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="announcement-title"
            className="mb-2 block text-sm font-semibold text-[#334155]"
          >
            Title
          </label>

          <input
            id="announcement-title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none transition-all focus:border-[#3182CE] focus:ring-4 focus:ring-blue-50"
            placeholder="Enter announcement title"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="announcement-content"
            className="mb-2 block text-sm font-semibold text-[#334155]"
          >
            Description
          </label>

          <textarea
            id="announcement-content"
            value={formData.content}
            onChange={(e) =>
              setFormData({
                ...formData,
                content: e.target.value,
              })
            }
            className="min-h-[130px] w-full resize-y rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm leading-6 text-[#1E293B] placeholder-[#94A3B8] outline-none transition-all focus:border-[#3182CE] focus:ring-4 focus:ring-blue-50"
            placeholder="Write the announcement details..."
          />
        </div>

        {/* Deadline */}
        <div>
          <label
            htmlFor="announcement-deadline"
            className="mb-2 block text-sm font-semibold text-[#334155]"
          >
            Deadline{' '}
            <span className="font-normal text-[#94A3B8]">
              (Optional)
            </span>
          </label>

          <div className="relative">
            <input
              id="announcement-deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deadline: e.target.value,
                })
              }
              min={new Date()
                .toISOString()
                .slice(0, 16)}
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 pr-11 text-sm text-[#1E293B] outline-none transition-all focus:border-[#3182CE] focus:ring-4 focus:ring-blue-50"
            />

            <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
          </div>

          <p className="mt-1.5 text-xs text-[#94A3B8]">
            Select a date and time if this announcement has
            a deadline.
          </p>
        </div>

        {/* Global */}
        <label
          htmlFor={`global-${title}`}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors hover:bg-[#F1F5F9]"
        >
          <input
            id={`global-${title}`}
            type="checkbox"
            checked={formData.isGlobal}
            onChange={(e) =>
              setFormData({
                ...formData,
                isGlobal: e.target.checked,
              })
            }
            className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#1A365D] focus:ring-[#3182CE]"
          />

          <span>
            <span className="block text-sm font-semibold text-[#334155]">
              Global announcement
            </span>

            <span className="mt-0.5 block text-xs leading-5 text-[#64748B]">
              Make this announcement visible to all tech
              centers.
            </span>
          </span>
        </label>

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A365D] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#153475] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}