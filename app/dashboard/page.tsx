'use client';

/* ============================================================
   DASHBOARD PAGE
   ------------------------------------------------------------
   Premium, cohesive dashboard experience with enhanced 
   visual hierarchy, spacing, and micro-interactions.
   Videos are served from the Azure-backed Media model.
   Only the video's owner can delete their own upload.
============================================================ */

import {
  Trophy,
  Users,
  BookOpen,
  Briefcase,
  Clock,
  ArrowRight,
  User,
  MapPin,
  Video,
  Camera,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Library,
  Star,
  MessageCircle,
  Sparkles,
  Trash2,
  Loader2,
  Send,
  MoreVertical,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DiscoverStudents, type DiscoverStudent } from './components/DiscoverStudents';
import { VideoPlayer } from './components/VideoPlayer';

/* ============================================================
   DESIGN TOKENS
============================================================ */

const COLORS = {
  ink: '#1A2B4C',
  inkLight: '#2C3E5A',
  paper: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSoft: '#F3F4F6',
  surfaceHover: '#F8F9FA',
  line: '#E5E7EB',
  lineStrong: '#D1D5DB',
  muted: '#6B7280',
  mutedLight: '#9CA3AF',
  brass: '#C59B4C',
  brassHover: '#B08A3E',
  moss: '#55705B',
  rust: '#A4462F',
  slate: '#3E5C76',
  purple: '#7C3AED',
};

/* ============================================================
   TYPES
============================================================ */

interface TechCenter {
  id: string;
  name: string;
  city?: string | null;
}

interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  email: string;
  techCenter?: { id: string; name: string };
  role?: { name: string };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  status: string;
  isActive: boolean;
}

interface AssignmentData {
  isTeacher: boolean;
  hasTutor?: boolean;
  tutor?: Tutor | null;
  studentCount?: number;
  students?: Student[];
}

interface ActivityItem {
  id: string;
  action: string;
  createdAt: string | Date;
  details?: Record<string, string | number> | null;
  user?: {
    firstName: string;
    lastName: string;
    profileImageUrl?: string | null;
  } | null;
  techCenter?: { id: string; name: string } | null;
}

interface QuickLink {
  icon: React.ReactNode;
  label: string;
  description: string;
  path: string;
}

interface MediaItem {
  id: string;
  publicUrl: string;
  blobName: string;
  contentType: string;
  size: number;
  title: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  } | null;
}

interface VideoRequest {
  id: string;
  request: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
  techCenter?: {
    id: string;
    name: string;
    country?: {
      name: string;
    };
  } | null;
}

/* ============================================================
   MEDIA LIBRARY (Azure-backed)
   ------------------------------------------------------------
   Fetches from /api/media/list, plays videos with 
   play / pause / next / previous controls.
   Delete is only shown to the uploader.
============================================================ */

function MediaLibrary() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery<MediaItem[]>({
    queryKey: ['dashboard-media'],
    queryFn: async () => {
      const response = await fetch('/api/media/list');
      if (!response.ok) throw new Error('Failed to fetch media');
      const data = await response.json();
      if (!data.success) throw new Error(data?.error ?? 'Failed');
      return (data.items ?? []) as MediaItem[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: videoRequests = [] } = useQuery<VideoRequest[]>({
    queryKey: ['video-requests'],
    queryFn: async () => {
      const response = await fetch('/api/video-requests');
      if (!response.ok) throw new Error('Failed to fetch video requests');
      const data = await response.json();
      if (!data.success) throw new Error(data?.error ?? 'Failed');
      return data.data as VideoRequest[];
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!user?.id,
  });

  const videos = useMemo(
    () => items.filter((item) => item.contentType.startsWith('video/')),
    [items],
  );

  const [rawIndex, setRawIndex] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentVideoKey, setCurrentVideoKey] = useState<string>("");
  const [requestInput, setRequestInput] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const videoPlayerRef = useRef<{ play: () => void } | null>(null);

  const currentIndex =
    videos.length === 0 ? 0 : Math.min(rawIndex, videos.length - 1);

  const current = videos[currentIndex] ?? null;

  // Update video key when current video changes to force re-render
  useEffect(() => {
    if (current) {
      setCurrentVideoKey(`video-${current.id}`);
    }
  }, [current?.id]);

  // Only the uploader can delete their own video
  const canDeleteCurrent =
    !!user?.id && !!current?.user?.id && current.user.id === user.id;

  const goNext = useCallback(() => {
    if (videos.length <= 1) return;
    setRawIndex((prev) => (prev + 1) % videos.length);
    setTimeout(() => videoPlayerRef.current?.play(), 100);
  }, [videos.length]);

  const goPrevious = useCallback(() => {
    if (videos.length <= 1) return;
    setRawIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setTimeout(() => videoPlayerRef.current?.play(), 100);
  }, [videos.length]);

  const selectVideo = useCallback((index: number) => {
    setRawIndex(index);
    setTimeout(() => videoPlayerRef.current?.play(), 100);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video permanently?')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/media/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error ?? 'Delete failed');
      }
      queryClient.setQueryData<MediaItem[]>(['dashboard-media'], (prev) =>
        (prev ?? []).filter((item) => item.id !== id),
      );
      setRawIndex(0);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleRequestSubmit = async (request: string) => {
    try {
      const response = await fetch('/api/video-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Request failed');
      }
      // Clear input immediately
      setRequestInput("");
      // Invalidate requests query to refresh the list instantly
      queryClient.invalidateQueries({ queryKey: ['video-requests'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit request');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Delete this request?')) return;
    
    try {
      const response = await fetch(`/api/video-requests/${requestId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.error ?? 'Delete failed');
      }
      // Invalidate requests query to refresh the list instantly
      queryClient.invalidateQueries({ queryKey: ['video-requests'] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-12 text-sm text-[#6B7280] shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading media…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Could not load media'}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white px-6 py-8 text-center">
          <Video className="mx-auto mb-2 h-6 w-6 text-[#9CA3AF]" />
          <p className="text-xs font-medium text-[#1A2B4C]">
            No videos in the library yet
          </p>
        </div>

        {/* Compact Request Section */}
        <div className="border-t border-[#E5E7EB] bg-white">
          <div className="px-4 py-2 border-b border-[#E5E7EB] bg-[#1A2B4C]">
            <h4 className="text-[10px] font-semibold text-white uppercase tracking-wider">
              Video Requests
            </h4>
          </div>
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={requestInput}
                onChange={(e) => setRequestInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleRequestSubmit(requestInput)}
                placeholder="Request what you need to watch today..."
                className="flex-1 h-8 px-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-[11px] text-[#1A2B4C] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C59B4C] focus:bg-white transition-colors"
                disabled={isSubmittingRequest}
              />
              <button
                onClick={() => handleRequestSubmit(requestInput)}
                disabled={!requestInput.trim() || isSubmittingRequest}
                className="inline-flex items-center justify-center gap-1 h-8 px-3 bg-[#C59B4C] text-white text-[10px] font-medium rounded hover:bg-[#B08A3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingRequest ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Recent Requests */}
            {videoRequests.length > 0 && (
              <div className="h-24 overflow-y-auto bg-[#F8F9FA] rounded border border-[#E5E7EB] p-2">
                <div className="space-y-1">
                  {videoRequests.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[10px] text-[#1A2B4C] border-b border-[#E5E7EB] pb-1 last:border-0">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="font-medium text-[#C59B4C] shrink-0">
                          {item.user.firstName} {item.user.lastName.charAt(0)}.
                        </span>
                        <span className="text-[#6B7280] shrink-0">•</span>
                        <span className="ml-1 truncate">{item.request}</span>
                      </div>
                      {item.user.id === user?.id && (
                        <button
                          onClick={() => handleDeleteRequest(item.id)}
                          className="shrink-0 text-[#6B7280] hover:text-red-600 transition-colors ml-2"
                          aria-label="Delete request"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
      {/* Player */}
      <div className="relative aspect-video w-full bg-black">
        {current && (
          <VideoPlayer
            key={currentVideoKey}
            src={current.publicUrl}
            title={current.title}
            description={current.description || undefined}
            className="w-full h-full"
            playRef={videoPlayerRef}
            onEnded={() => {
              if (videos.length > 1) {
                goNext();
              }
            }}
          />
        )}

        {/* Top-right counter */}
        {current && (
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm z-10">
            {currentIndex + 1} / {videos.length}
          </div>
        )}
      </div>

      {/* Compact Controls */}
      <div className="flex items-center justify-between gap-2 border-t border-[#E5E7EB] bg-[#F8F9FA] px-4 py-2">
        <button
          type="button"
          onClick={goPrevious}
          disabled={videos.length <= 1}
          aria-label="Previous video"
          className="inline-flex items-center gap-1 rounded border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-medium text-[#1A2B4C] hover:border-[#C59B4C] hover:text-[#C59B4C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3 w-3" />
          Prev
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={videos.length <= 1}
          aria-label="Next video"
          className="inline-flex items-center gap-1 rounded border border-[#E5E7EB] bg-white px-2 py-1 text-[10px] font-medium text-[#1A2B4C] hover:border-[#C59B4C] hover:text-[#C59B4C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3 w-3" />
        </button>

        {/* Delete button - only for video owner */}
        {canDeleteCurrent && (
          <button
            type="button"
            onClick={() => handleDelete(current.id)}
            disabled={deletingId === current.id}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {deletingId === current.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            Delete
          </button>
        )}
      </div>

      {/* Compact Video Library - Music Style */}
      {videos.length > 0 && (
        <div className="border-t border-[#E5E7EB] bg-white">
          <div className="px-4 py-2 border-b border-[#E5E7EB] bg-[#1A2B4C]">
            <h4 className="text-[10px] font-semibold text-white uppercase tracking-wider">
              Media Library
            </h4>
          </div>
          <div className="h-32 overflow-y-auto">
            {videos.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectVideo(idx)}
                className={`w-full text-left px-4 py-1.5 border-b border-[#E5E7EB] transition-all text-[11px] ${
                  idx === currentIndex
                    ? 'bg-[#C59B4C]/10 text-[#C59B4C] font-medium border-l-2 border-l-[#C59B4C]'
                    : 'hover:bg-[#F8F9FA] text-[#1A2B4C] border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compact Request Section - Music Style */}
      <div className="border-t border-[#E5E7EB] bg-white">
        <div className="px-4 py-2 border-b border-[#E5E7EB] bg-[#1A2B4C]">
          <h4 className="text-[10px] font-semibold text-white uppercase tracking-wider">
            Request what you want to watch
          </h4>
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={requestInput}
              onChange={(e) => setRequestInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleRequestSubmit(requestInput)}
              placeholder="Request what you need to watch today..."
              className="flex-1 h-8 px-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-[11px] text-[#1A2B4C] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#C59B4C] focus:bg-white transition-colors"
              disabled={isSubmittingRequest}
            />
            <button
              onClick={() => handleRequestSubmit(requestInput)}
              disabled={!requestInput.trim() || isSubmittingRequest}
              className="inline-flex items-center justify-center gap-1 h-8 px-3 bg-[#C59B4C] text-white text-[10px] font-medium rounded hover:bg-[#B08A3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingRequest ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Recent Requests - Scrollable Text */}
          {videoRequests.length > 0 && (
            <div className="h-24 overflow-y-auto bg-[#F8F9FA] rounded border border-[#E5E7EB] p-2">
              <div className="space-y-1">
                {videoRequests.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[10px] text-[#1A2B4C] border-b border-[#E5E7EB] pb-1 last:border-0">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className="font-medium text-[#C59B4C] shrink-0">
                        {item.user.firstName} {item.user.lastName.charAt(0)}.
                      </span>
                      <span className="text-[#6B7280] shrink-0">•</span>
                      <span className="ml-1 truncate">{item.request}</span>
                    </div>
                    {item.user.id === user?.id && (
                      <button
                        onClick={() => handleDeleteRequest(item.id)}
                        className="shrink-0 text-[#6B7280] hover:text-red-600 transition-colors ml-2"
                        aria-label="Delete request"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}



/* ============================================================
   MAIN PAGE
============================================================ */

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [techCenter, setTechCenter] = useState<TechCenter | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentTime] = useState(() => Date.now());

  /* ============================================================
     FETCH FUNCTIONS
  ============================================================ */

  const fetchTechCenter = useCallback(async (techCenterId: string) => {
    try {
      const response = await fetch(`/api/tech-centers/${techCenterId}`);
      if (response.ok) {
        const data = await response.json();
        setTechCenter(data);
      }
    } catch (error) {
      console.error('Error fetching tech center:', error);
    }
  }, []);

  const fetchRecentActivity = useCallback(async (techCenterId: string) => {
    try {
      const response = await fetch(
        `/api/tech-centers/${techCenterId}/activity?limit=all`,
      );
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }, []);

  const fetchAllActivity = useCallback(async () => {
    try {
      const techCentersResponse = await fetch('/api/admin/tech-centers');
      if (techCentersResponse.ok) {
        const techCenters: TechCenter[] = await techCentersResponse.json();

        const activityPromises = techCenters.map(async (tc) => {
          try {
            const activityResponse = await fetch(
              `/api/tech-centers/${tc.id}/activity?limit=all`,
            );
            if (activityResponse.ok) {
              const activities: ActivityItem[] =
                await activityResponse.json();
              return (activities || []).map((activity) => ({
                ...activity,
                techCenter: { id: tc.id, name: tc.name },
              }));
            }
            return [];
          } catch (error) {
            console.error(`Error fetching activity for ${tc.name}:`, error);
            return [];
          }
        });

        const allActivities = await Promise.all(activityPromises);
        const flattenedActivities = allActivities
          .flat()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );
        setRecentActivity(flattenedActivities);
      }
    } catch (error) {
      console.error('Error fetching all activity:', error);
    }
  }, []);

  /* ============================================================
     DATA FETCHING
  ============================================================ */

  useEffect(() => {
    const loadData = async () => {
      if (user?.techCenterId) {
        await fetchTechCenter(user.techCenterId);
      }
      if (user?.role === 'super_admin') {
        await fetchAllActivity();
      } else if (user?.techCenterId) {
        await fetchRecentActivity(user.techCenterId);
      }
    };
    loadData();
  }, [
    user?.techCenterId,
    user?.role,
    fetchTechCenter,
    fetchRecentActivity,
    fetchAllActivity,
  ]);

  /* ============================================================
     TUTORS
  ============================================================ */

  const { data: tutorsData, isLoading: tutorsLoading } = useQuery({
    queryKey: ['tutors', user?.techCenterId],
    queryFn: async () => {
      const response = await fetch('/api/tech-centers/tutors?limit=100');
      if (!response.ok) throw new Error('Failed to fetch tutors');
      const data = await response.json();
      const allTutors = data.tutors || [];
      if (user?.techCenterId) {
        return allTutors.filter(
          (tutor: Tutor) => tutor.techCenter?.id === user.techCenterId,
        );
      }
      return allTutors;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!user?.techCenterId,
  });

  const tutors = tutorsData || [];

  const { data: discoverStudents = [], isLoading: discoverStudentsLoading } =
    useQuery<DiscoverStudent[]>({
      queryKey: ['dashboard-discover-students'],
      queryFn: async () => {
        const response = await fetch('/api/dashboard/discover-students');
        if (!response.ok) throw new Error('Failed to fetch discover students');
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!user?.id,
    });

  /* ============================================================
     TUTOR ASSIGNMENT
  ============================================================ */

  const { data: assignmentData, isLoading: loadingAssignment } = useQuery({
    queryKey: ['assignment-info', user?.id, user?.role],
    queryFn: async () => {
      const response = await fetch('/api/user/tutor');
      if (!response.ok)
        throw new Error('Failed to fetch assignment information');
      return response.json() as Promise<AssignmentData>;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled:
      !!user?.id && (user?.role === 'student' || user?.role === 'teacher'),
  });

  const isTeacher = assignmentData?.isTeacher || false;
  const tutorInfo = assignmentData?.tutor || null;
  const studentCount = assignmentData?.studentCount || 0;

  /* ============================================================
     ROTATING MESSAGES
  ============================================================ */

  const motivationMessages = useMemo(
    () => [
      'Learn with purpose. Build with confidence.',
      'Every lesson is another step toward your future.',
      'Use your time well. Keep learning and keep building.',
      'Your skills grow through practice, patience and consistency.',
      'Stay curious. Ask questions. Keep moving forward.',
      'Small progress today can create meaningful opportunities tomorrow.',
    ],
    [],
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) =>
        current === motivationMessages.length - 1 ? 0 : current + 1,
      );
    }, 5000);
    return () => window.clearInterval(interval);
  }, [motivationMessages.length]);

  /* ============================================================
     ACTIVITY HELPERS
  ============================================================ */

  const ACTIVITY_META: Record<string, { label: string; color: string }> = {
    course_submission: { label: 'submitted a course', color: COLORS.moss },
    cleaning_registration: {
      label: 'registered for cleaning day',
      color: COLORS.brass,
    },
    cleaning_day_change: {
      label: 'changed cleaning day',
      color: COLORS.slate,
    },
    cleaning_week_created: {
      label: 'created cleaning week',
      color: COLORS.rust,
    },
    cleaning_day_created: {
      label: 'created cleaning day',
      color: COLORS.ink,
    },
    change_user_role: { label: 'changed user role', color: COLORS.purple },
    create_user: { label: 'created new user', color: COLORS.moss },
    delete_user: { label: 'deleted user', color: COLORS.rust },
    create_tech_center: { label: 'created tech center', color: COLORS.brass },
    update_tech_center: { label: 'updated tech center', color: COLORS.slate },
  };

  const getActivityMeta = (action: string) =>
    ACTIVITY_META[action.toLowerCase()] ?? {
      label: action.replace(/_/g, ' '),
      color: COLORS.mutedLight,
    };

  const formatTimeAgo = (date: Date | string) => {
    const timestamp = new Date(date).getTime();
    if (Number.isNaN(timestamp)) return '';
    const diffInMs = currentTime - timestamp;
    const mins = Math.floor(diffInMs / 60000);
    const hours = Math.floor(diffInMs / 3600000);
    const days = Math.floor(diffInMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getGreeting();
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const avatarUrl = user?.profileImageUrl || null;

  /* ============================================================
     QUICK LINKS
  ============================================================ */

  const quickLinks: QuickLink[] = useMemo(() => {
    const userRole = user?.role;

    if (userRole === 'super_admin') {
      return [
        {
          icon: <Users className="h-5 w-5" />,
          label: 'Tech Centers',
          description: 'Manage all tech centers',
          path: '/dashboard/super-admin/centers',
        },
        {
          icon: <Users className="h-5 w-5" />,
          label: 'All Users',
          description: 'Manage system users',
          path: '/dashboard/super-admin/users',
        },
        {
          icon: <Briefcase className="h-5 w-5" />,
          label: 'Internships',
          description: 'Discover opportunities',
          path: '/dashboard/internships',
        },
        {
          icon: <Library className="h-5 w-5" />,
          label: 'Policy Book',
          description: 'Read Selfless CE policies',
          path: '/dashboard/policies',
        },
        {
          icon: <BookOpen className="h-5 w-5" />,
          label: 'Tuition',
          description: 'View tuition and course information',
          path: '/dashboard/courses',
        },
        {
          icon: <MessageCircle className="h-5 w-5" />,
          label: 'Support',
          description: 'Meet the IT support team',
          path: '/dashboard/support',
        },
      ];
    }

    if (userRole === 'admin') {
      return [
        {
          icon: <GraduationCap className="h-5 w-5" />,
          label: 'Tutor Assignments',
          description: 'Assign students to tutors',
          path: '/dashboard/admin/teachers',
        },
        {
          icon: <BookOpen className="h-5 w-5" />,
          label: 'My Courses',
          description: 'Access your enrolled courses',
          path: '/dashboard/courses',
        },
        {
          icon: <Users className="h-5 w-5" />,
          label: 'Students',
          description: 'Connect with your peers',
          path: '/dashboard/students',
        },
        {
          icon: <Briefcase className="h-5 w-5" />,
          label: 'Internships',
          description: 'Discover opportunities',
          path: '/dashboard/internships',
        },
        {
          icon: <Clock className="h-5 w-5" />,
          label: 'Cleaning Rota',
          description: 'View your schedule',
          path: '/dashboard/cleaning',
        },
        {
          icon: <Library className="h-5 w-5" />,
          label: 'Policy Book',
          description: 'Read Selfless CE policies',
          path: '/dashboard/policies',
        },
        {
          icon: <BookOpen className="h-5 w-5" />,
          label: 'Tuition',
          description: 'View tuition and course information',
          path: '/dashboard/courses',
        },
        {
          icon: <MessageCircle className="h-5 w-5" />,
          label: 'Support',
          description: 'Meet the IT support team',
          path: '/dashboard/support',
        },
      ];
    }

    return [
      {
        icon: <BookOpen className="h-5 w-5" />,
        label: 'My Courses',
        description: 'Access your enrolled courses',
        path: '/dashboard/courses',
      },
      {
        icon: <Users className="h-5 w-5" />,
        label: 'Students',
        description: 'Connect with your peers',
        path: '/dashboard/students',
      },
      {
        icon: <Briefcase className="h-5 w-5" />,
        label: 'Internships',
        description: 'Discover opportunities',
        path: '/dashboard/internships',
      },
      {
        icon: <Clock className="h-5 w-5" />,
        label: 'Cleaning Rota',
        description: 'View your schedule',
        path: '/dashboard/cleaning',
      },
      {
        icon: <Library className="h-5 w-5" />,
        label: 'Policy Book',
        description: 'Read Selfless CE policies',
        path: '/dashboard/policies',
      },
      {
        icon: <BookOpen className="h-5 w-5" />,
        label: 'Tuition',
        description: 'View tuition and course information',
        path: '/dashboard/courses',
      },
      {
        icon: <MessageCircle className="h-5 w-5" />,
        label: 'Support',
        description: 'Meet the IT support team',
        path: '/dashboard/support',
      },
      {
        icon: <Trophy className="h-5 w-5" />,
        label: 'Football Team',
        description: 'Join activities',
        path: '/dashboard/football-team',
      },
    ];
  }, [user?.role]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute h-full w-full animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#1A2B4C]" />
            <div className="h-2 w-2 rounded-full bg-[#C59B4C]" />
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#6B7280]">
            Loading Workspace
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A2B4C]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HERO */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
        >
          <div className="relative h-[200px] overflow-hidden sm:h-[240px] md:h-[260px]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1152px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1A2B4C]">
                <User className="h-20 w-20 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4C]/90 via-[#1A2B4C]/40 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#C59B4C]"
                  >
                    {greeting}
                  </motion.p>
                  <motion.h1
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl"
                  >
                    {userName}
                  </motion.h1>
                  {techCenter && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-white/80"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C59B4C]" />
                      <span className="truncate">
                        {techCenter.name}
                        {techCenter.city ? ` · ${techCenter.city}` : ''}
                      </span>
                    </motion.p>
                  )}
                </div>
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => router.push('/dashboard/profile')}
                  className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:self-auto"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Edit Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#E5E7EB] bg-[#F8F9FA] px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#55705B] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#55705B]" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6B7280]">
                  Active
                </span>
              </div>
              {user?.role && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#9CA3AF]">
                  {user.role.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#9CA3AF]">
              {user?.role === 'super_admin'
                ? 'Super Admin Portal'
                : 'Student Portal'}
            </span>
          </div>
        </motion.header>

        {/* DISCOVER STUDENTS */}
        {discoverStudents.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-[#C59B4C]" />
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7280]">
                Student Community
              </h2>
            </div>
            <DiscoverStudents
              students={discoverStudents}
              isLoading={discoverStudentsLoading}
            />
          </motion.section>
        )}

        {/* MOTIVATION STRIP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-6"
        >
          <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C59B4C]/10">
              <Sparkles className="h-4 w-4 text-[#C59B4C]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C59B4C] mb-0.5">
                Today&apos;s Focus
              </p>
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-[#1A2B4C] truncate"
              >
                {motivationMessages[messageIndex]}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* MEDIA LIBRARY (Azure) */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-4 w-4 text-[#C59B4C]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7280]">
              Media Library
            </h2>
          </div>
          <MediaLibrary />
        </motion.section>



        {/* QUICK LINKS */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#C59B4C]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7280]">
              Quick Access
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {quickLinks.map((link, idx) => (
              <motion.button
                key={`${link.label}-${link.path}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                whileHover={{
                  y: -2,
                  boxShadow: '0 8px 20px rgba(26,43,76,0.06)',
                }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => router.push(link.path)}
                className="group flex flex-col items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white p-4 transition-all duration-200 hover:border-[#C59B4C]/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FA] text-[#1A2B4C] transition-colors group-hover:bg-[#C59B4C]/10 group-hover:text-[#C59B4C]">
                  {link.icon}
                </span>
                <span className="text-xs font-semibold text-[#1A2B4C] text-center">
                  {link.label}
                </span>
                <span className="text-[10px] text-[#9CA3AF] text-center leading-tight">
                  {link.description}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ADMIN BANNER */}
        {user?.role === 'admin' && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-6"
          >
            <div className="flex flex-col gap-4 rounded-xl border border-[#C59B4C]/30 bg-gradient-to-r from-[#FBF7EE] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C59B4C]/15 text-[#8A6328]">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8A6328]">
                    Action Needed
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-[#1A2B4C] sm:text-lg">
                    Assign students to tutors
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-[#6B7280]">
                    Help students receive regular support by assigning them to
                    tutors who can follow up on their progress.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => router.push('/dashboard/admin/teachers')}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#1A2B4C] px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#C59B4C]"
              >
                Open Tutors Page
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* TUTORS LIST */}
        {(tutorsLoading || tutors.length > 0) && user?.role !== 'super_admin' && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-[#C59B4C]" />
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7280]">
                {techCenter?.name || 'Your'} Tutors ({tutors.length})
              </h2>
            </div>

            {tutorsLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5"
                  >
                    <div className="h-6 w-6 animate-pulse rounded-full bg-[#E5E7EB]" />
                    <div className="h-3 w-24 animate-pulse rounded bg-[#E5E7EB]" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="mb-3 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                  <MessageCircle className="h-3 w-3" />
                  Reach out to them whenever you need more guidance and help
                </p>

                <div className="flex flex-wrap gap-2">
                  {tutors.map((tutor: Tutor) => (
                    <motion.div
                      key={tutor.id}
                      whileHover={{ y: -1 }}
                      className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      {tutor.profileImageUrl ? (
                        <Image
                          src={tutor.profileImageUrl}
                          alt={`${tutor.firstName} ${tutor.lastName}`}
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full object-cover border border-[#E5E7EB]"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white bg-[#1A2B4C]">
                          {tutor.firstName.charAt(0)}
                          {tutor.lastName.charAt(0)}
                        </div>
                      )}
                      <span className="text-[12px] font-medium text-[#1A2B4C]">
                        {tutor.firstName} {tutor.lastName}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.section>
        )}

        {/* ASSIGNMENT STATUS */}
        {(user?.role === 'student' || user?.role === 'teacher') && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-[#C59B4C]" />
              <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7280]">
                {isTeacher ? 'Student Assignment' : 'Tutor Assignment'}
              </h2>
            </div>

            {loadingAssignment ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-[#E5E7EB]" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-48 max-w-full animate-pulse rounded bg-[#E5E7EB]" />
                    <div className="h-3 w-64 max-w-full animate-pulse rounded bg-[#F3F4F6]" />
                  </div>
                </div>
              </div>
            ) : isTeacher ? (
              studentCount > 0 ? (
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#55705B]/10">
                      <Users className="h-6 w-6 text-[#55705B]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1A2B4C]">
                        You are assigned to {studentCount} student
                        {studentCount > 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        {studentCount} student
                        {studentCount > 1 ? 's are' : ' is'} under your
                        mentorship
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          router.push('/dashboard/admin/teachers')
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C59B4C] hover:text-[#B08A3E] transition-colors"
                      >
                        View Tutors Page <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#55705B]/10 px-3 py-1 text-[10px] font-medium text-[#55705B]">
                      <Users className="h-3 w-3" /> {studentCount}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#A4462F]/10">
                      <GraduationCap className="h-6 w-6 text-[#A4462F]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1A2B4C]">
                        You are a tutor but you are not assigned to students
                        yet
                      </p>
                      <p className="text-[11px] text-[#6B7280] mt-1">
                        Contact your tech center administration so that you are
                        assigned to the students you will follow up on.
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          router.push('/dashboard/admin/teachers')
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C59B4C] hover:text-[#B08A3E] transition-colors"
                      >
                        View Tutors Page <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : tutorInfo ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  {tutorInfo.profileImageUrl ? (
                    <Image
                      src={tutorInfo.profileImageUrl}
                      alt={`${tutorInfo.firstName} ${tutorInfo.lastName}`}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover border-2 border-[#E5E7EB]"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white bg-[#1A2B4C]">
                      {tutorInfo.firstName.charAt(0)}
                      {tutorInfo.lastName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1A2B4C]">
                      You are assigned to tutor
                    </p>
                    <p className="text-[13px] font-medium text-[#55705B]">
                      {tutorInfo.firstName} {tutorInfo.lastName}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      {tutorInfo.email}
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/admin/teachers')}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C59B4C] hover:text-[#B08A3E] transition-colors"
                    >
                      View Tutors Page <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#55705B]/10 px-3 py-1 text-[10px] font-medium text-[#55705B]">
                    <GraduationCap className="h-3 w-3" /> Assigned
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#A4462F]/10">
                    <GraduationCap className="h-6 w-6 text-[#A4462F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1A2B4C]">
                      You are not yet assigned to a tutor
                    </p>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Contact your tech center administration so that you are
                      assigned to a tutor for better learning support.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/admin/teachers')}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#C59B4C] hover:text-[#B08A3E] transition-colors"
                    >
                      View Tutors Page <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* ACTIVITY LOG */}
        {recentActivity.length > 0 &&
          (user?.role === 'super_admin' || techCenter) && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[#C59B4C]" />
                <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7280]">
                  Activity Log
                </h2>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm max-h-[300px] overflow-y-auto">
                {recentActivity.map((item, index) => {
                  const meta = getActivityMeta(item.action);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F8F9FA] ${
                        index < recentActivity.length - 1
                          ? 'border-b border-[#E5E7EB]'
                          : ''
                      }`}
                    >
                      <span className="shrink-0 font-mono text-[11px] text-[#9CA3AF] min-w-[70px]">
                        {formatTimeAgo(item.createdAt)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#1A2B4C]">
                          <span className="font-semibold">
                            {item.user
                              ? `${item.user.firstName} ${item.user.lastName}`
                              : 'System'}
                          </span>
                          <span className="text-[#6B7280]">
                            {' '}
                            {meta.label}
                          </span>
                          {item.techCenter &&
                            user?.role === 'super_admin' && (
                              <span className="text-[#9CA3AF] ml-2 text-xs">
                                · {item.techCenter.name}
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

        {/* LEARNING RESOURCES */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-[#C59B4C]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-[#6B7280]">
              Learning Resources
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {
                icon: <BookOpen className="h-5 w-5" />,
                label: 'Courses',
                path: '/dashboard/live-streaming',
                color: '#55705B',
              },
              {
                icon: <Video className="h-5 w-5" />,
                label: 'Videos',
                path: '/dashboard/live-streaming',
                color: '#3E5C76',
              },
              {
                icon: <Library className="h-5 w-5" />,
                label: 'Tutorials',
                path: '/dashboard/live-streaming',
                color: '#C59B4C',
              },
            ].map((item, idx) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                whileHover={{
                  y: -2,
                  boxShadow: '0 8px 20px rgba(26,43,76,0.06)',
                }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white p-4 transition-all hover:border-[#C59B4C]/40"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F8F9FA]"
                  style={{ color: item.color }}
                >
                  {item.icon}
                </span>
                <span className="text-xs font-semibold text-[#1A2B4C]">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* AI ASSISTANT */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mt-6"
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#1A2B4C] p-6 shadow-lg sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C59B4C]/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#55705B]/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#C59B4C]" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
                    AI Assistant
                  </p>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  Atbriz AI
                </h3>
                <p className="mt-1.5 text-sm text-white/60 max-w-lg">
                  Ask questions, get study guidance, and accelerate your
                  learning journey with your personal AI assistant.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => router.push('/dashboard/ai')}
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-white px-6 py-3 font-mono text-xs uppercase tracking-widest text-[#1A2B4C] transition-colors hover:bg-[#C59B4C] hover:text-white sm:self-auto"
              >
                Open Assistant
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.section>

        <div className="h-8" />
      </div>
    </div>
  );
}