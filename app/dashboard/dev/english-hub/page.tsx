'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface TechCenter {
  id: string;
  name: string;
  code: string;
}

interface EnglishHubRegistration {
  id: string;
  userId: string;
  sessionDate: string;
  attendanceStatus: 'REGISTERED' | 'ATTENDED' | 'NO_SHOW';
  registeredAt: string;
  markedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    role: { name: string; displayName?: string } | null;
  };
  markedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function EnglishHubMonitorPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role;

  const [techCenters, setTechCenters] = useState<TechCenter[]>([]);
  const [selectedTechCenter, setSelectedTechCenter] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [registrations, setRegistrations] = useState<EnglishHubRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTechCenters, setIsLoadingTechCenters] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRegistrations = useRef(false);

  const loadTechCenters = useCallback(async () => {
    setIsLoadingTechCenters(true);
    try {
      const response = await fetch('/api/admin/tech-centers');
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setTechCenters(data);
      } else {
        setError('Failed to load tech centers');
      }
    } catch (err) {
      console.error('Error loading tech centers:', err);
      setError('Failed to load tech centers');
    } finally {
      setIsLoadingTechCenters(false);
    }
  }, []);

  const loadAvailableDates = useCallback(async () => {
    if (!selectedTechCenter) return;

    setIsLoadingDates(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/dev/english-hub/registrations?techCenterId=${selectedTechCenter}`
      );
      const data = await response.json() as { success: boolean; availableDates?: string[]; error?: string };
      if (response.ok && data.availableDates) {
        setAvailableDates(data.availableDates);
      } else {
        setError(data.error || 'Failed to load available dates');
      }
    } catch (err) {
      console.error('Error loading available dates:', err);
      setError('Failed to load available dates');
    } finally {
      setIsLoadingDates(false);
    }
  }, [selectedTechCenter]);

  const loadRegistrations = useCallback(async () => {
    if (!selectedTechCenter || !selectedDate) return;

    if (!hasLoadedRegistrations.current) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const response = await fetch(
        `/api/dev/english-hub/registrations?techCenterId=${selectedTechCenter}&date=${selectedDate}`
      );
      const data = await response.json() as { success: boolean; registrations?: EnglishHubRegistration[]; error?: string };
      if (response.ok) {
        setRegistrations(data.registrations || []);
        hasLoadedRegistrations.current = true;
      } else {
        setError(data.error || 'Failed to load registrations');
      }
    } catch (err) {
      console.error('Error loading registrations:', err);
      setError('Failed to load registrations');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTechCenter, selectedDate]);

  // Load tech centers on mount
  useEffect(() => {
    loadTechCenters();
  }, [loadTechCenters]);

  // Load available dates when tech center is selected
  useEffect(() => {
    if (selectedTechCenter) {
      loadAvailableDates();
      setSelectedDate(''); // Reset date when tech center changes
      setRegistrations([]); // Clear registrations when tech center changes
      hasLoadedRegistrations.current = false; // Reset loading flag
    } else {
      setAvailableDates([]);
      setSelectedDate('');
      setRegistrations([]);
      hasLoadedRegistrations.current = false;
    }
  }, [selectedTechCenter, loadAvailableDates]);

  // Load registrations when date is selected (auto-fetch)
  useEffect(() => {
    if (selectedTechCenter && selectedDate) {
      hasLoadedRegistrations.current = false;
      loadRegistrations();
    }
  }, [selectedDate, loadRegistrations]);

  const formatRegistrationDate = (date: string) => {
    return new Date(`${date}T00:00:00.000Z`).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  if (!['super_admin', 'dev'].includes(currentUserRole ?? '')) {
    return (
      <div className="min-h-screen bg-[#F1F1EC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#12203B] mb-2">Access Denied</h1>
          <p className="text-[#6B7268]">This page is only accessible to super admins and developers.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F1F1EC]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DADCD3] bg-white text-[#6B7268] hover:bg-[#F7F6F2] hover:text-[#12203B]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#12203B]">English Class</h1>
              <p className="text-sm text-[#6B7268]">Monitor English class attendance across all tech centers</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-[#DADCD3] bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Tech Center Selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#12203B]">
                Tech Center
              </label>
              <select
                value={selectedTechCenter}
                onChange={(e) => setSelectedTechCenter(e.target.value)}
                disabled={isLoadingTechCenters}
                className="w-full rounded-lg border border-[#DADCD3] bg-white px-3 py-2 text-sm text-[#12203B] focus:border-[#B98A3E] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20 disabled:opacity-50"
              >
                <option value="">
                  {isLoadingTechCenters ? 'Loading tech centers...' : 'Select a tech center...'}
                </option>
                {techCenters.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.name} ({tc.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selector - Only show when tech center is selected */}
            {selectedTechCenter && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#12203B]">
                  Date
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isLoadingDates}
                  className="w-full rounded-lg border border-[#DADCD3] bg-white px-3 py-2 text-sm text-[#12203B] focus:border-[#B98A3E] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/20 disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingDates ? 'Loading dates...' : 'Select a date...'}
                  </option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {formatRegistrationDate(date)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                loadAvailableDates();
                if (selectedDate) {
                  loadRegistrations();
                }
              }}
              disabled={!selectedTechCenter || isLoading || isLoadingDates}
              className="inline-flex items-center gap-2 rounded-lg bg-[#12203B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#9A7333] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading || isLoadingDates ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Registrations List */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2 lg:gap-y-4 xl:grid-cols-3" aria-label="Loading registrations">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg bg-[#FBFBF8] p-3 sm:gap-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#E7E9E5] sm:h-12 sm:w-12" />
                <div className="min-w-0 flex-1 space-y-2 py-1">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#E7E9E5]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#E7E9E5]" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[#E7E9E5]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-[#A4462F]" role="alert">
            {error}
          </div>
        ) : registrations.length === 0 && selectedTechCenter && selectedDate ? (
          <div className="py-8 text-center text-sm text-[#687268]">
            No registrations yet for {formatRegistrationDate(selectedDate)}.
          </div>
        ) : registrations.length > 0 ? (
          <>
            {/* Stats */}
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-xs font-semibold text-[#142B46]">
                Total registered: {registrations.length}
              </span>
              <span className="text-xs font-semibold text-[#55705B]">
                Attended ({registrations.filter((r) => r.attendanceStatus === 'ATTENDED').length})
              </span>
              <span className="text-xs font-semibold text-[#A4462F]">
                No Show ({registrations.filter((r) => r.attendanceStatus === 'NO_SHOW').length})
              </span>
            </div>

            {/* Registrations Grid */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2 lg:gap-y-4 xl:grid-cols-3">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-start gap-3 rounded-lg bg-[#FBFBF8] p-3 transition sm:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    {registration.user.profileImageUrl ? (
                      <Image
                        src={registration.user.profileImageUrl}
                        alt={`${registration.user.firstName} ${registration.user.lastName}`}
                        width={48}
                        height={48}
                        unoptimized
                        className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-[#D9DDD7] sm:h-12 sm:w-12"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#142B46] text-sm font-bold text-white ring-1 ring-[#D9DDD7] sm:h-12 sm:w-12">
                        {registration.user.firstName?.[0] ?? '?'}
                        {registration.user.lastName?.[0] ?? ''}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="break-words text-sm font-semibold leading-5 text-[#172033]">
                          {registration.user.firstName} {registration.user.lastName}
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#687268]">
                        <span>
                          {new Date(registration.registeredAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Africa/Nairobi',
                          })}
                        </span>
                        <span aria-hidden="true">·</span>
                        {registration.attendanceStatus === 'REGISTERED' && (
                          <span className="font-semibold text-[#687268]">Registered</span>
                        )}
                        {registration.attendanceStatus === 'ATTENDED' && (
                          <span className="font-semibold text-[#55705B]">Attended</span>
                        )}
                        {registration.attendanceStatus === 'NO_SHOW' && (
                          <span className="font-semibold text-[#A4462F]">No Show</span>
                        )}
                      </div>
                      {registration.markedBy && (
                        <p className="mt-0.5 text-[10px] leading-4 text-[#687268]">
                          Attendance marked by {registration.markedBy.firstName} {registration.markedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
