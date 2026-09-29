'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Home,
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
} from 'lucide-react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { CreateTripForm, TripFormData } from './components/CreateTripForm';

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
    role: {
      name: string;
      displayName: string;
    };
  };
  techCenter: {
    id: string;
    name: string;
  } | null;
  registrations: {
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
      techCenter: {
        name: string;
      } | null;
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

export default function TempleTripsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showCreateForm, setShowCreateForm] = useState(false);

  // ---------------------------------------------------------
  // FETCH TEMPLE TRIPS
  // ---------------------------------------------------------

  const {
    data,
    isLoading,
    error,
  } = useQuery<TempleTripsQueryData>({
    queryKey: ['temple-trips'],
    queryFn: async () => {
      const response = await fetch('/api/temple-trips');

      if (!response.ok) {
        throw new Error('Failed to fetch temple trips');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const currentUser = data?.currentUser;
  const trips: TempleTrip[] = data?.trips || [];

  // ---------------------------------------------------------
  // CREATE TRIP MUTATION
  // ---------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: async (tripData: TripFormData) => {
      const response = await fetch('/api/temple-trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });

      if (!response.ok) {
        throw new Error('Failed to create temple trip');
      }

      return response.json();
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['temple-trips'],
      });

      const previousData = queryClient.getQueryData([
        'temple-trips',
      ]);

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['temple-trips'],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['temple-trips'],
      });
    },
  });

  // ---------------------------------------------------------
  // REGISTER MUTATION
  // ---------------------------------------------------------

  const registerMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const response = await fetch(`/api/temple-trips/${tripId}/register`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to register for trip');
      }

      return response.json();
    },

    onMutate: async (tripId) => {
      await queryClient.cancelQueries({
        queryKey: ['temple-trips'],
      });

      const previousData = queryClient.getQueryData<TempleTripsQueryData>([
        'temple-trips',
      ]);

      queryClient.setQueryData<TempleTripsQueryData>(
        ['temple-trips'],
        (old) => {
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
                : trip
            ),
          };
        }
      );

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['temple-trips'],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['temple-trips'],
      });
    },
  });

  // ---------------------------------------------------------
  // UNREGISTER MUTATION
  // ---------------------------------------------------------

  const unregisterMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const response = await fetch(`/api/temple-trips/${tripId}/register`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unregister from trip');
      }

      return response.json();
    },

    onMutate: async (tripId) => {
      await queryClient.cancelQueries({
        queryKey: ['temple-trips'],
      });

      const previousData = queryClient.getQueryData<TempleTripsQueryData>([
        'temple-trips',
      ]);

      queryClient.setQueryData<TempleTripsQueryData>(
        ['temple-trips'],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            trips: old.trips.map((trip) =>
              trip.id === tripId
                ? {
                    ...trip,
                    registrations: trip.registrations.filter(
                      (reg) => reg.user.id !== user?.id
                    ),
                  }
                : trip
            ),
          };
        }
      );

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['temple-trips'],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['temple-trips'],
      });
    },
  });

  // ---------------------------------------------------------
  // DELETE TRIP MUTATION
  // ---------------------------------------------------------

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const response = await fetch(`/api/temple-trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      return response.json();
    },

    onMutate: async (tripId) => {
      await queryClient.cancelQueries({
        queryKey: ['temple-trips'],
      });

      const previousData = queryClient.getQueryData<TempleTripsQueryData>([
        'temple-trips',
      ]);

      queryClient.setQueryData<TempleTripsQueryData>(
        ['temple-trips'],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            trips: old.trips.filter((trip) => trip.id !== tripId),
          };
        }
      );

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['temple-trips'],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['temple-trips'],
      });
    },
  });

  // ---------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------

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
    // Super admins and dev can delete any trip
    if (currentUser?.isAdmin) {
      const userRole = user?.role;
      if (userRole === 'super_admin' || userRole === 'dev') {
        return true;
      }
      // Admins can only delete their own trips
      return trip.createdBy.id === user?.id;
    }
    return false;
  };

  const isRegistered = (trip: TempleTrip) => {
    return trip.registrations.some((reg) => reg.user.id === user?.id);
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-[#E2E8F0]" />
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
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

  if (error instanceof Error) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[#1E293B]">
            Unable to load temple trips
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Something went wrong while loading the temple trips.
          </p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ['temple-trips'],
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
    <div className="min-h-screen bg-[#F7F8FA] text-[#12203B]">
      {/* Header */}
      <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14">
        <div className="mb-8 flex items-center gap-3">
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
        </div>

        <div className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#7A8495]">
            Student Activities
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#12203B] md:text-3xl">
            Temple Trips
          </h1>

          <p className="mt-3 text-base leading-7 text-[#667085]">
            View upcoming temple trips and register for the trips you would
            like to attend.
          </p>
        </div>

        {/* Create Trip Button - Admins only */}
        {currentUser?.isAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A365D] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#153475] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#3182CE]/30 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            {showCreateForm ? 'Close Create Form' : 'Create Temple Trip'}
          </button>
        )}

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="mb-8 overflow-hidden"
            >
              <CreateTripForm
                onSubmit={handleCreateTrip}
                onCancel={() => setShowCreateForm(false)}
                isPending={createMutation.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trips List */}
        {trips.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-sm">
            <Landmark className="mx-auto mb-4 h-12 w-12 text-[#94A3B8]" />
            <h3 className="text-lg font-semibold text-[#1E293B]">
              No temple trips available
            </h3>
            <p className="mt-2 text-sm text-[#64748B]">
              Check back later for upcoming temple trips.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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

// ---------------------------------------------------------
// TRIP CARD COMPONENT
// ---------------------------------------------------------

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
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      {/* Coordinator Info */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2F7]">
          <User className="h-5 w-5 text-[#1A365D]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#25344D]">
            {trip.coordinatorName}
          </p>
          <p className="text-xs text-[#7A8495]">Trip Coordinator</p>
        </div>
      </div>

      {/* Title Block */}
      <div className="mb-6">
        {trip.flag && (
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#A67A34]">
            {trip.flag} Upcoming Trip
          </p>
        )}
        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#12203B]">
          {trip.title}
        </h2>
        {trip.subtitle && (
          <p className="mt-1 text-lg font-semibold text-[#A67A34]">
            {trip.subtitle}
          </p>
        )}
        {(trip.dateRange || trip.location) && (
          <div className="mt-4 space-y-2 text-sm text-[#667085]">
            {trip.dateRange && (
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 shrink-0 text-[#1A365D]" />
                <span>{trip.dateRange}</span>
              </div>
            )}
            {trip.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#1A365D]" />
                <span>{trip.location}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-base leading-7 text-[#667085] whitespace-pre-wrap">
          {trip.description}
        </p>
      </div>

      {/* Requirements */}
      {trip.requirements && trip.requirements.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.1em] text-[#7A8495]">
            Requirements for Participation
          </h3>
          <div className="text-sm leading-6 text-[#667085] whitespace-pre-wrap">
            {trip.requirements.join('\n')}
          </div>
        </div>
      )}

      {/* Closing Text */}
      {trip.closingText && (
        <div className="mb-6">
          <p className="text-base leading-7 text-[#667085] whitespace-pre-wrap">
            {trip.closingText}
          </p>
        </div>
      )}

      {/* Registered Users */}
      {trip.registrations.length > 0 && (
        <div className="mb-6 rounded-xl bg-[#F8FAFC] p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#1A365D]" />
            <h3 className="text-sm font-semibold text-[#1A365D]">
              Registered Participants ({trip.registrations.length})
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {trip.registrations.map((registration) => (
              <div
                key={registration.id}
                className="flex items-center gap-3 rounded-lg bg-white p-2.5"
              >
                {registration.user.profileImageUrl ? (
                  <img
                    src={registration.user.profileImageUrl}
                    alt={`${registration.user.firstName} ${registration.user.lastName}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2F7]">
                    <User className="h-4 w-4 text-[#1A365D]" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1E293B]">
                    {registration.user.firstName} {registration.user.lastName}
                  </p>
                  {registration.user.techCenter && (
                    <p className="text-xs text-[#64748B]">
                      {registration.user.techCenter.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Register/Unregister Button */}
      <div className="flex items-center justify-end gap-3">
        {canDelete && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        )}
        {isRegistered ? (
          <button
            onClick={onUnregister}
            disabled={isUnregistering}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnregistering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Unregister
          </button>
        ) : (
          <button
            onClick={onRegister}
            disabled={isRegistering}
            className="flex items-center gap-2 rounded-lg bg-[#1A365D] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#153475] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Register for Trip
          </button>
        )}
      </div>
    </div>
  );
}