'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Bell,
  Calendar,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { isJsonObject } from '@/lib/api-response';
import VerifiedBadge from '@/components/VerifiedBadge';
import { AnnouncementComments } from './components/AnnouncementComments';

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
    hasVerifiedBadge: boolean;
    techCenter: {
      id: string;
      name: string;
    } | null;
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

interface AnnouncementsQueryData {
  announcements: Announcement[];
  currentUser: {
    id: string;
    isAdmin: boolean;
    techCenterId: string | null;
  };
}

const INITIAL_FORM = {
  title: '',
  content: '',
  deadline: '',
  isGlobal: false,
};

function getRoleLabel(role?: { name: string; displayName: string } | null): string {
  if (!role) return '';
  switch (role.name) {
    case 'admin': return 'Manager';
    case 'super_admin': return 'Director';
    case 'teacher': return 'Tutor';
    case 'dev': return 'Selfless Support';
    default: return role.displayName || '';
  }
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [collapsedAnnouncements, setCollapsedAnnouncements] =
    useState<Set<string>>(new Set());
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [formData, setFormData] = useState(INITIAL_FORM);

  // ---------------------------------------------------------
  // FETCH ANNOUNCEMENTS
  // ---------------------------------------------------------

  const { data, isLoading, error } = useQuery<AnnouncementsQueryData>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await fetch('/api/announcements');
      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }
      return response.json();
    },
    staleTime: 0,
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
        if (!response.ok) return 0;
        const result: unknown = await response.json();
        return isJsonObject(result) && Array.isArray(result.announcements)
          ? result.announcements.length
          : 0;
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementData),
      });
      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }
      return response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previousData = queryClient.getQueryData(['announcements']);
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['announcements'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', 'count'] });
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
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update announcement');
      }
      return response.json();
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previousData = queryClient.getQueryData<AnnouncementsQueryData>([
        'announcements',
      ]);
      queryClient.setQueryData<AnnouncementsQueryData>(['announcements'], (old) => {
        if (!old) return old;
        return {
          ...old,
          announcements: old.announcements.map((announcement: Announcement) =>
            announcement.id === variables.announcementId
              ? {
                  ...announcement,
                  title: variables.data.title || announcement.title,
                  content: variables.data.content || announcement.content,
                  deadline: variables.data.deadline
                    ? new Date(variables.data.deadline).toISOString()
                    : announcement.deadline,
                  isGlobal:
                    variables.data.isGlobal !== undefined
                      ? variables.data.isGlobal
                      : announcement.isGlobal,
                }
              : announcement,
          ),
        };
      });
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['announcements'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', 'count'] });
    },
  });

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------

  const deleteMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }
      return response.json();
    },
    onMutate: async (announcementId) => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] });
      const previousData = queryClient.getQueryData<AnnouncementsQueryData>([
        'announcements',
      ]);
      queryClient.setQueryData<AnnouncementsQueryData>(['announcements'], (old) => {
        if (!old) return old;
        return {
          ...old,
          announcements: old.announcements.filter(
            (announcement: Announcement) => announcement.id !== announcementId,
          ),
        };
      });
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['announcements'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements', 'count'] });
    },
  });

  // ---------------------------------------------------------
  // HANDLERS
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
      console.error('Failed to create announcement:', error);
    }
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      deadline: announcement.deadline
        ? new Date(announcement.deadline).toISOString().slice(0, 16)
        : '',
      isGlobal: announcement.isGlobal,
    });
    setShowCreateForm(false);
    setShowEditForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      console.error('Failed to update announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(announcementId);
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const toggleExpand = (announcementId: string) => {
    setCollapsedAnnouncements((current) => {
      const next = new Set(current);
      if (next.has(announcementId)) {
        next.delete(announcementId);
      } else {
        next.add(announcementId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    return isOwner(announcement) || currentUser?.isAdmin;
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
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="mx-auto max-w-5xl px-3 py-4 sm:px-5">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="h-9 w-9 animate-pulse rounded-md border border-[#E5E7EB] bg-white" />
            <div className="h-5 w-px bg-[#E5E7EB]" />
            <div className="h-4 w-40 animate-pulse rounded bg-[#E5E7EB]" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-lg border border-[#E5E7EB] bg-white"
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
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-5">
        <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <Bell className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-[15px] font-semibold text-[#1A2B4C]">
            Unable to load announcements
          </h2>
          <p className="mt-1 text-[12.5px] text-[#6B7280]">
            Something went wrong while loading the announcements.
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['announcements'] })
            }
            className="mt-4 rounded-md bg-[#1A2B4C] px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#263D66]"
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]">
      {/* =====================================================
          PAGE HEADER — Home button removed
      ====================================================== */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-5xl px-3 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:border-[#C59B4C] hover:text-[#1A2B4C]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="mx-1 hidden h-5 w-px bg-[#E5E7EB] sm:block" />

            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EEF1F5]">
                <Bell className="h-4 w-4 text-[#1A2B4C]" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C59B4C]">
                  Communication
                </p>
                <h1 className="mt-0.5 truncate text-[17px] font-bold leading-tight text-[#1A2B4C] sm:text-[18px]">
                  Announcements
                </h1>
                <p className="text-[11.5px] text-[#6B7280]">
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

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-5 sm:py-5">
        {/* Create controls — admins only */}
        {currentUser?.isAdmin && (
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowEditForm(false);
              setEditingAnnouncement(null);
              setFormData(INITIAL_FORM);
            }}
            className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1A2B4C] px-4 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#263D66] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B4C] focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Close Announcement Form' : 'Create Announcement'}
          </button>
        )}

        {/* CREATE FORM */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="mb-4 overflow-hidden"
            >
              <AnnouncementForm
                title="Create Announcement"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateAnnouncement}
                onCancel={closeCreateForm}
                isPending={createMutation.isPending}
                submitLabel="Create Announcement"
                allowGlobal={currentUser?.isAdmin === true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* EDIT FORM */}
        <AnimatePresence>
          {showEditForm && editingAnnouncement && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="mb-4 overflow-hidden"
            >
              <AnnouncementForm
                title="Edit Announcement"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateAnnouncement}
                onCancel={closeEditForm}
                isPending={updateMutation.isPending}
                submitLabel="Save Changes"
                allowGlobal={currentUser?.isAdmin === true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ANNOUNCEMENTS */}
        {announcements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E7EB] bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6]">
              <Bell className="h-5 w-5 text-[#9CA3AF]" />
            </div>
            <h3 className="mt-3 text-[13.5px] font-semibold text-[#1A2B4C]">
              No announcements yet
            </h3>
            <p className="mx-auto mt-1 max-w-md text-[12px] text-[#6B7280]">
              There are currently no announcements available. Create the first
              announcement to keep students informed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement: Announcement, index: number) => (
              <motion.article
                key={announcement.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  delay: Math.min(index * 0.03, 0.18),
                }}
                className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(26,43,76,0.04)] transition-colors hover:border-[#C59B4C]/40"
              >
                {/* Announcement header */}
                <div
                  className="cursor-pointer p-3.5 sm:p-4"
                  onClick={() => toggleExpand(announcement.id)}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    {/* Author avatar */}
                    {announcement.author.profileImageUrl ? (
                      <Image
                        src={announcement.author.profileImageUrl}
                        alt={`${announcement.author.firstName} ${announcement.author.lastName}`}
                        width={36}
                        height={36}
                        unoptimized
                        className="h-9 w-9 shrink-0 rounded-full border border-[#E5E7EB] object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A2B4C] text-[11px] font-bold text-white">
                        {announcement.author.firstName.charAt(0)}
                        {announcement.author.lastName.charAt(0)}
                      </div>
                    )}

                    {/* Main information */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        {announcement.isGlobal && (
                          <span className="rounded border border-[#EEF1F5] bg-[#EEF1F5] px-1.5 py-0.5 text-[10px] font-semibold text-[#1A2B4C]">
                            Global
                          </span>
                        )}
                        {announcement.techCenter && (
                          <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {announcement.techCenter.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-[13.5px] font-semibold leading-5 text-[#1A2B4C] sm:text-[14.5px]">
                        {announcement.title}
                      </h3>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[#6B7280]">
                        <span className="font-medium text-[#4B5646]">
                          {announcement.author.firstName}{' '}
                          {announcement.author.lastName}
                        </span>
                        {announcement.author.hasVerifiedBadge && (
                          <VerifiedBadge className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden text-[#D1D5DB] sm:inline">·</span>
                        <span>{getRoleLabel(announcement.author.role)}</span>
                        {announcement.author.role.name === 'super_admin' &&
                          announcement.author.techCenter && (
                            <>
                              <span className="hidden text-[#D1D5DB] sm:inline">
                                ·
                              </span>
                              <span>
                                {announcement.author.techCenter.name}
                              </span>
                            </>
                          )}
                        {announcement.deadline && (
                          <>
                            <span className="hidden text-[#D1D5DB] sm:inline">
                              ·
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-[#C59B4C]" />
                              Deadline: {formatDate(announcement.deadline)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex shrink-0 items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => toggleExpand(announcement.id)}
                        aria-label={
                          !collapsedAnnouncements.has(announcement.id)
                            ? 'Collapse announcement'
                            : 'Expand announcement'
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F8F9FA] hover:text-[#1A2B4C]"
                      >
                        {!collapsedAnnouncements.has(announcement.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {(isOwner(announcement) || canDelete(announcement)) && (
                        <AnnouncementMenu
                          canEdit={isOwner(announcement)}
                          canDelete={Boolean(canDelete(announcement))}
                          isDeleting={deleteMutation.isPending}
                          onEdit={() => handleEditAnnouncement(announcement)}
                          onDelete={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable content */}
                <AnimatePresence initial={false}>
                  {!collapsedAnnouncements.has(announcement.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#E5E7EB] bg-[#F8F9FA] px-3.5 py-3.5 sm:px-4">
                        <div className="sm:pl-[3rem]">
                          <p className="whitespace-pre-wrap text-[12.5px] leading-6 text-[#4B5646] sm:text-[13px]">
                            {announcement.content}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10.5px] text-[#9CA3AF]">
                            <span>
                              Published {formatDate(announcement.createdAt)}
                            </span>
                            {announcement.deadline && (
                              <>
                                <span>·</span>
                                <span className="font-medium text-[#6B7280]">
                                  Deadline {formatDate(announcement.deadline)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <AnnouncementComments
                        announcementId={announcement.id}
                        currentUserId={currentUser?.id}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            ))}
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
  allowGlobal: boolean;
}

function AnnouncementForm({
  title,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
  allowGlobal,
}: AnnouncementFormProps) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      {/* Form heading */}
      <div className="mb-4 border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF1F5]">
            <Bell className="h-4 w-4 text-[#1A2B4C]" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-[#1A2B4C]">{title}</h3>
            <p className="text-[11.5px] text-[#6B7280]">
              Share important information with students.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="announcement-title"
            className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#4B5646]"
          >
            Title
          </label>
          <input
            id="announcement-title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] text-[#1A2B4C] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
            placeholder="Enter announcement title"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="announcement-content"
            className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#4B5646]"
          >
            Description
          </label>
          <textarea
            id="announcement-content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="min-h-[120px] w-full resize-y rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[13px] leading-6 text-[#1A2B4C] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
            placeholder="Write the announcement details..."
          />
        </div>

        {/* Deadline */}
        <div>
          <label
            htmlFor="announcement-deadline"
            className="mb-1.5 block text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#4B5646]"
          >
            Deadline{' '}
            <span className="font-normal normal-case tracking-normal text-[#9CA3AF]">
              (Optional)
            </span>
          </label>
          <div className="relative">
            <input
              id="announcement-deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 pr-10 text-[13px] text-[#1A2B4C] outline-none transition-colors focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15"
            />
            <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
          <p className="mt-1 text-[11px] text-[#9CA3AF]">
            Select a date and time if this announcement has a deadline.
          </p>
        </div>

        {allowGlobal ? (
          <label
            htmlFor={`global-${title}`}
            className="flex cursor-pointer items-start gap-2.5 rounded-md border border-[#E5E7EB] bg-[#F8F9FA] p-3 transition-colors hover:bg-[#F3F4F6]"
          >
            <input
              id={`global-${title}`}
              type="checkbox"
              checked={formData.isGlobal}
              onChange={(e) =>
                setFormData({ ...formData, isGlobal: e.target.checked })
              }
              className="mt-0.5 h-3.5 w-3.5 rounded border-[#D1D5DB] text-[#1A2B4C] focus:ring-[#C59B4C]"
            />
            <span>
              <span className="block text-[12.5px] font-semibold text-[#1A2B4C]">
                Global announcement
              </span>
              <span className="mt-0.5 block text-[11.5px] leading-5 text-[#6B7280]">
                Mark this to show the announcement to all students and teachers
                across every tech center.
              </span>
            </span>
          </label>
        ) : (
          <p className="rounded-md border border-[#E5E7EB] bg-[#F8F9FA] p-3 text-[11.5px] leading-5 text-[#6B7280]">
            This announcement will be visible to users in your tech center.
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-[#E5E7EB] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#4B5646] transition-colors hover:border-[#C59B4C] hover:bg-[#F8F9FA] disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#1A2B4C] px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#263D66] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
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

/* =========================================================
   ANNOUNCEMENT ACTIONS MENU
========================================================= */

function AnnouncementMenu({
  canEdit,
  canDelete,
  isDeleting,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Announcement options"
        aria-expanded={isOpen}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] transition-colors hover:bg-[#F8F9FA] hover:text-[#1A2B4C]"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg"
          >
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-medium text-[#1A2B4C] transition-colors hover:bg-[#F8F9FA]"
              >
                <Edit className="h-3 w-3 text-[#C59B4C]" />
                Edit
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setIsOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
                Delete
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}