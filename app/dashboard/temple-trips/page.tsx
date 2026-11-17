'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  CalendarDays,
  Landmark,
  User,
  MapPin,
  Check,
  X,
  Loader2,
  Users,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { CreateTripForm, TripFormData } from './components/CreateTripForm';

/* ─────────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────────── */

interface TempleTrip {
  id: string;
  title: string;
  description: string;
  coordinatorName: string;
  dateRange?: string;
  location?: string;
  flag?: string;
  requirements?: string[];
  subtitle?: string;
  closingText?: string;
  createdAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    role: { name: string; displayName: string };
  };
  techCenter: { id: string; name: string } | null;
  registrations: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
      techCenter: { name: string } | null;
    };
  }[];
}

interface TempleTripsQueryData {
  trips: TempleTrip[];
  currentUser: {
    id: string;
    isAdmin: boolean;
    techCenterId: string | null;
  };
}

/* ─────────────────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────────────────── */

export default function TempleTripsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);

  /* ────────────── Queries ────────────── */

  const { data, isLoading, error, refetch } = useQuery<TempleTripsQueryData>({
    queryKey: ['temple-trips'],
    queryFn: async () => {
      const response = await fetch('/api/temple-trips');
      if (!response.ok) throw new Error('Failed to fetch temple trips');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const currentUser = data?.currentUser;
  const trips: TempleTrip[] = data?.trips || [];

  /* ────────────── Mutations ────────────── */

  const createMutation = useMutation({
    mutationFn: async (tripData: TripFormData) => {
      const response = await fetch('/api/temple-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData),
      });
      if (!response.ok) throw new Error('Failed to create temple trip');
      return response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['temple-trips'] });
      const previousData = queryClient.getQueryData(['temple-trips']);
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['temple-trips'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['temple-trips'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const response = await fetch(`/api/temple-trips/${tripId}/register`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to register for trip');
      return response.json();
    },
    onMutate: async (tripId) => {
      await queryClient.cancelQueries({ queryKey: ['temple-trips'] });
      const previousData = queryClient.getQueryData<TempleTripsQueryData>(['temple-trips']);
      queryClient.setQueryData<TempleTripsQueryData>(['temple-trips'], (old) => {
        if (!old) return old;
        return {
          ...old,
          trips: old.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  registrations: [
                    ...trip.registrations,
                    {
                      id: 'temp',
                      user: {
                        id: user?.id || '',
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        profileImageUrl: user?.profileImageUrl || null,
                        techCenter: null,
                      },
                    },
                  ],
                }
              : trip,
          ),
        };
      });
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['temple-trips'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['temple-trips'] });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const response = await fetch(`/api/temple-trips/${tripId}/register`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to unregister from trip');
      return response.json();
    },
    onMutate: async (tripId) => {
      await queryClient.cancelQueries({ queryKey: ['temple-trips'] });
      const previousData = queryClient.getQueryData<TempleTripsQueryData>(['temple-trips']);
      queryClient.setQueryData<TempleTripsQueryData>(['temple-trips'], (old) => {
        if (!old) return old;
        return {
          ...old,
          trips: old.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  registrations: trip.registrations.filter(
                    (reg) => reg.user.id !== user?.id,
                  ),
                }
              : trip,
          ),
        };
      });
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['temple-trips'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['temple-trips'] });
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const response = await fetch(`/api/temple-trips/${tripId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete trip');
      return response.json();
    },
    onMutate: async (tripId) => {
      await queryClient.cancelQueries({ queryKey: ['temple-trips'] });
      const previousData = queryClient.getQueryData<TempleTripsQueryData>(['temple-trips']);
      queryClient.setQueryData<TempleTripsQueryData>(['temple-trips'], (old) => {
        if (!old) return old;
        return { ...old, trips: old.trips.filter((trip) => trip.id !== tripId) };
      });
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['temple-trips'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['temple-trips'] });
    },
  });

  /* ────────────── Handlers ────────────── */

  const handleCreateTrip = async (tripData: TripFormData) => {
    try {
      await createMutation.mutateAsync(tripData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create trip:', error);
    }
  };

  const handleRegister = async (tripId: string) => {
    try {
      await registerMutation.mutateAsync(tripId);
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Failed to register for trip. Please try again.');
    }
  };

  const handleUnregister = async (tripId: string) => {
    try {
      await unregisterMutation.mutateAsync(tripId);
    } catch (error) {
      console.error('Failed to unregister:', error);
      alert('Failed to unregister from trip. Please try again.');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this temple trip? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteTripMutation.mutateAsync(tripId);
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert('Failed to delete trip. Please try again.');
    }
  };

  const canDeleteTrip = (trip: TempleTrip) => {
    if (currentUser?.isAdmin) {
      const userRole = user?.role;
      if (userRole === 'super_admin' || userRole === 'dev') return true;
      return trip.createdBy.id === user?.id;
    }
    return false;
  };

  const isRegistered = (trip: TempleTrip) =>
    trip.registrations.some((reg) => reg.user.id === user?.id);

  /* ────────────── Loading ────────────── */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="mx-auto max-w-4xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
          <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-[#e2e8f0]" />
          <div className="mb-5 h-16 animate-pulse rounded-xl border border-[#e2e8f0] bg-white" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-xl border border-[#e2e8f0] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ────────────── Error ────────────── */

  if (error instanceof Error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
        <div className="w-full max-w-md rounded-xl border border-[#e2e8f0] bg-white p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-[#0f172a]">
            Unable to load temple trips
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#64748b]">
            Something went wrong while loading the temple trips. Please try again.
          </p>
          <button
            onClick={() => void refetch()}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1a365d] px-3 text-xs font-semibold text-white transition hover:bg-[#14294a]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ────────────── Main ────────────── */

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <div className="mx-auto max-w-4xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a67a34]">
            Student Activities
          </p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#1a365d]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Temple Trips
            </h1>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[#64748b]">
            View upcoming temple trips and register for the trips you would like to attend.
          </p>
        </div>

        {/* Create button */}
        {currentUser?.isAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14294a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a365d]/30"
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? 'Close form' : 'Create temple trip'}
          </button>
        )}

        {/* Create form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="mb-5 overflow-hidden"
            >
              <CreateTripForm
                onSubmit={handleCreateTrip}
                onCancel={() => setShowCreateForm(false)}
                isPending={createMutation.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {trips.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#334155]">
              <Landmark className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">No temple trips available</h3>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#64748b]">
              Check back later for upcoming temple trips.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isRegistered={isRegistered(trip)}
                onRegister={() => handleRegister(trip.id)}
                onUnregister={() => handleUnregister(trip.id)}
                isRegistering={registerMutation.isPending}
                isUnregistering={unregisterMutation.isPending}
                canDelete={canDeleteTrip(trip)}
                onDelete={() => handleDeleteTrip(trip.id)}
                isDeleting={deleteTripMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Trip Card
   ───────────────────────────────────────────────────────────────────────────── */

interface TripCardProps {
  trip: TempleTrip;
  isRegistered: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  isRegistering: boolean;
  isUnregistering: boolean;
  canDelete: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}

function TripCard({
  trip,
  isRegistered,
  onRegister,
  onUnregister,
  isRegistering,
  isUnregistering,
  canDelete,
  onDelete,
  isDeleting,
}: TripCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white transition hover:shadow-sm">
      {/* Gold accent bar for flagged trips */}
      {trip.flag && <div className="h-1 w-full bg-[#a67a34]" />}

      <div className="p-5 sm:p-6">
        {/* Coordinator header */}
        <div className="mb-4 flex items-center gap-2.5">
          {trip.createdBy.profileImageUrl ? (
            <Image
              src={trip.createdBy.profileImageUrl}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="h-9 w-9 rounded-full object-cover ring-1 ring-[#e2e8f0]"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2f8] ring-1 ring-[#e2e8f0]">
              <User className="h-4 w-4 text-[#1a365d]" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0f172a]">
              {trip.coordinatorName}
            </p>
            <p className="truncate text-[11px] text-[#64748b]">
              {trip.createdBy.role.displayName} · {trip.techCenter?.name ?? 'Community'}
            </p>
          </div>
        </div>

        {/* Title block */}
        <div className="mb-4">
          {trip.flag && (
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a67a34]">
              {trip.flag} Upcoming trip
            </p>
          )}
          <h2 className="text-lg font-bold leading-snug tracking-tight text-[#0f172a] sm:text-xl">
            {trip.title}
          </h2>
          {trip.subtitle && (
            <p className="mt-0.5 text-sm font-semibold text-[#a67a34]">
              {trip.subtitle}
            </p>
          )}

          {(trip.dateRange || trip.location) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {trip.dateRange && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f8fafc] px-2.5 py-1 text-[11px] font-medium text-[#334155]">
                  <CalendarDays className="h-3 w-3 text-[#1a365d]" />
                  {trip.dateRange}
                </span>
              )}
              {trip.location && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f8fafc] px-2.5 py-1 text-[11px] font-medium text-[#334155]">
                  <MapPin className="h-3 w-3 text-[#1a365d]" />
                  {trip.location}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="whitespace-pre-wrap text-sm leading-6 text-[#64748b]">
          {trip.description}
        </p>

        {/* Requirements */}
        {trip.requirements && trip.requirements.length > 0 && (
          <div className="mt-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
              Requirements for participation
            </h3>
            <ul className="space-y-1.5">
              {trip.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-5 text-[#334155]">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#1a365d]" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Closing text */}
        {trip.closingText && (
          <p className="mt-4 whitespace-pre-wrap text-xs leading-5 text-[#64748b]">
            {trip.closingText}
          </p>
        )}

        {/* Participants */}
        {trip.registrations.length > 0 && (
          <div className="mt-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3.5">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#1a365d]" />
                <h3 className="text-xs font-semibold text-[#0f172a]">
                  Registered participants
                </h3>
                <span className="rounded-full bg-[#1a365d] px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                  {trip.registrations.length}
                </span>
              </div>
            </div>
            <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {trip.registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center gap-2.5 rounded-md bg-white px-2 py-1.5"
                >
                  {reg.user.profileImageUrl ? (
                    <Image
                      src={reg.user.profileImageUrl}
                      alt=""
                      width={28}
                      height={28}
                      unoptimized
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-[#e2e8f0]"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef2f8] text-[10px] font-bold text-[#1a365d]">
                      {reg.user.firstName[0]}
                      {reg.user.lastName[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#0f172a]">
                      {reg.user.firstName} {reg.user.lastName}
                    </p>
                    {reg.user.techCenter && (
                      <p className="truncate text-[10px] text-[#64748b]">
                        {reg.user.techCenter.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[#e2e8f0] pt-4">
          {canDelete && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </button>
          )}

          {isRegistered ? (
            <button
              onClick={onUnregister}
              disabled={isUnregistering}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUnregistering ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              Unregister
            </button>
          ) : (
            <button
              onClick={onRegister}
              disabled={isRegistering}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1a365d] px-4 text-xs font-semibold text-white transition hover:bg-[#14294a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRegistering ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Register for trip
            </button>
          )}
        </div>
      </div>
    </article>
  );
}