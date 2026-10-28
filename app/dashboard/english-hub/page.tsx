'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Headphones,
  Mic2,
  PlayCircle,
  ShieldCheck,
  Target,
  Users,
  Video,
  AlertTriangle,
  Ban,
  FileText,
  UserCheck,
  ClipboardList,
  Smartphone,
} from 'lucide-react';
import { getRegistrationStatus, RegistrationStatus } from '@/lib/english-hub/registration-status';
import { atEATMinutes, startOfDayEAT } from '@/lib/english-hub/datetime';

// ============================================================
// DATA (unchanged)
// ============================================================

const tracks = [
  {
    number: '01',
    title: 'Watch and listen',
    description:
      'Build listening confidence through guided English lessons, real conversations, and useful everyday language.',
    icon: Headphones,
    href: '/dashboard/live-streaming',
    action: 'Explore videos',
  },
  {
    number: '02',
    title: 'Practice with AI',
    description:
      'Ask questions, work on your writing, and practice expressing ideas with immediate guidance.',
    icon: Brain,
    href: '/dashboard/ai',
    action: 'Open Atbriz AI',
  },
  {
    number: '03',
    title: 'Learn together',
    description:
      'Use your learning community to practice conversations, exchange ideas, and stay connected.',
    icon: Users,
    href: '/dashboard/messages',
    action: 'Connect with classmates',
  },
];

const practiceSteps = [
  { number: '01', icon: PlayCircle, title: 'Listen', description: 'Watch one short English lesson or conversation.' },
  { number: '02', icon: Mic2, title: 'Use the language', description: 'Speak or write five new sentences using what you learned.' },
  { number: '03', icon: CheckCircle2, title: 'Reflect', description: 'Review the words, phrases, and ideas you want to remember.' },
];

const criticalRules = [
  { icon: Clock3, title: 'Sheet closes at 2:00 PM', description: 'Registration opens at 1:30 PM. Sign within the window — no exceptions.' },
  { icon: UserCheck, title: 'Attendance is earned', description: 'You must participate — speak, debate, respond. Silent and present = absent.' },
  { icon: Smartphone, title: 'No phones or laptops', description: 'Prepare points on paper. Using a phone at any time = marked absent without warning.' },
  { icon: Ban, title: 'No special favours', description: 'Do not ask the tutor to add your name or excuse absences after the deadline.' },
];

const conductGroups = [
  {
    id: 'participation',
    label: 'Participation & Attendance',
    icon: UserCheck,
    rules: [
      {
        number: '01',
        title: 'Active Participation — The "Present" Rule',
        text:
          'Attendance must be earned through active participation, not just presence. To be marked present, you must contribute to the session — whether by speaking in debates, responding to questions, or engaging in group work. Simply logging in or arriving on time does not guarantee attendance. If you remain silent and disengaged, your name will not be recorded, regardless of punctuality.',
      },
      {
        number: '02',
        title: 'Attendance Sheet — Strict Deadline',
        text:
          'The official attendance sheet is available from 1:30 PM to 2:00 PM. You must sign your name within this thirty-minute window. If you fail to register within this window, you will automatically be marked absent. Late registration will not be accepted under any circumstances.',
      },
    ],
  },
  {
    id: 'conduct',
    label: 'Classroom Conduct',
    icon: Users,
    rules: [
      {
        number: '03',
        title: 'Respect for Speakers and Turn-Taking',
        text:
          'When a fellow student is sharing, answering, or presenting, you may not interrupt, interject, or distract them. Only the English Tutor has the authority to open the floor for questions or comments. Do not speak unless you are explicitly called upon. Any student who disrupts or speaks out of turn will be marked absent, as this shows a lack of respect for the learning environment.',
      },
      {
        number: '04',
        title: 'One Speaker at a Time',
        text:
          'When the tutor opens the floor for discussion, only one student may speak at a time. Side conversations, whispering, or group chatter are strictly prohibited. All attention must be directed to the current speaker.',
      },
      {
        number: '05',
        title: 'Classroom Space and Usage',
        text:
          'The main English Hub room is reserved strictly for active participants during class hours. If you are not attending the session, please use the adjacent study rooms or common areas.',
      },
    ],
  },
  {
    id: 'preparation',
    label: 'Preparation & Technology',
    icon: ClipboardList,
    rules: [
      {
        number: '06',
        title: 'Technology Policy',
        text:
          'To maintain focus and respect for speakers, phones and personal laptops are not permitted during sessions. On debate or presentation days, prepare your points on paper beforehand so you can present clearly. If you are observed using your phone or visibly distracted at any point, you will be marked absent without warning.',
      },
      {
        number: '07',
        title: 'Preparation Requirement',
        text:
          'Students must come to class with a pen, paper, and any assigned readings or preparatory materials completed. Failure to bring basic writing materials may result in a verbal warning. Repeated offenses will affect your participation record.',
      },
    ],
  },
  {
    id: 'integrity',
    label: 'Academic Integrity & Privacy',
    icon: ShieldCheck,
    rules: [
      {
        number: '08',
        title: 'No Recording Without Permission',
        text:
          'Students are not permitted to audio-record, video-record, or photograph the session — including the attendance sheet — without the tutor\u2019s explicit written consent. This protects the privacy and academic integrity of all participants.',
      },
      {
        number: '09',
        title: 'No Special Requests or Favours',
        text:
          'Do not approach the tutor to manually add your name, request a favour, or excuse an absence after the deadline. The policy is final, non-negotiable, and applies equally to all students.',
      },
    ],
  },
];

// ============================================================
// PAGE
// ============================================================

interface EnglishHubRegistration {
  id: string;
  userId: string;
  sessionDate: string;
  attendanceStatus: string;
  registeredAt: string;
  markedAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    role: { name: string; displayName?: string } | null;
  };
  markedBy?: { id: string; firstName: string; lastName: string };
}

interface EnglishHubDayOverride {
  sessionDate: string;
  manuallyOpened: boolean;
  manuallyClosed: boolean;
  manualOverrideAt: string | null;
  actor: { firstName: string; lastName: string } | null;
}

type AttendanceFilter = 'ALL' | 'REGISTERED' | 'ATTENDED' | 'NO_SHOW';

function todayStr(): string {
  return startOfDayEAT(new Date()).toISOString().slice(0, 10);
}

function formatRegistrationDate(date: string): string {
  return new Date(`${date}T00:00:00.000Z`).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function EnglishHubPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.name;
  const currentUserImage = session?.user?.profileImageUrl ?? session?.user?.image;
  const currentUserFirstName = session?.user?.firstName ?? currentUserName?.split(' ')[0] ?? 'You';
  const currentUserLastName = session?.user?.lastName ?? currentUserName?.split(' ').slice(1).join(' ') ?? '';
  const currentUserRole = session?.user?.role;
  const [activeTrack, setActiveTrack] = useState(0);
  const [registrations, setRegistrations] = useState<EnglishHubRegistration[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>({
    status: 'NOT_YET_OPEN',
    message: 'Registration window: 1:30 PM to 2:00 PM',
    canRegister: false,
  });
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [statusLoadError, setStatusLoadError] = useState<string | null>(null);
  const [registrationClosesAt, setRegistrationClosesAt] = useState<Date | null>(null);
  const [overrideActorName, setOverrideActorName] = useState<string | null>(null);
  const [countdownNow, setCountdownNow] = useState(0);
  const [currentUserRegistration, setCurrentUserRegistration] = useState<EnglishHubRegistration | null>(null);
  const [dayOverrides, setDayOverrides] = useState<EnglishHubDayOverride[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('ALL');
  const hasLoadedRegistrations = useRef(false);
  const currentDayRef = useRef('');
  const isTeacherOrAdmin = ['teacher', 'admin', 'super_admin'].includes(currentUserRole ?? '');
  const isSelectedToday = !todayDate || selectedDate === todayDate;
  const [isLoading, setIsLoading] = useState(true);
  const [registrationLoadError, setRegistrationLoadError] = useState<string | null>(null);

  // Optimistic in-flight flags so action buttons can show feedback
  const [isRegistering, setIsRegistering] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isOverriding, setIsOverriding] = useState(false);

  // Auto-rotate active track
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTrack((current) => (current + 1) % tracks.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const initializeDay = window.setTimeout(() => {
      const today = todayStr();
      currentDayRef.current = today;
      setTodayDate(today);
      setSelectedDate(today);
    }, 0);
    return () => window.clearTimeout(initializeDay);
  }, []);

  useEffect(() => {
    const checkForNewDay = () => {
      const currentDay = todayStr();
      const previousDay = currentDayRef.current;
      if (previousDay === currentDay) {
        return;
      }

      currentDayRef.current = currentDay;
      setTodayDate(currentDay);
      setAvailableDates((dates) => [
        currentDay,
        ...dates.filter((date) => date !== currentDay),
      ]);
      if (!isTeacherOrAdmin || selectedDate === previousDay) {
        setSelectedDate(currentDay);
      }
      hasLoadedRegistrations.current = false;
    };

    const interval = window.setInterval(checkForNewDay, 30000);
    return () => window.clearInterval(interval);
  }, [isTeacherOrAdmin, selectedDate]);

  const updateRegistrationStatus = useCallback(async () => {
    const today = new Date();
    try {
      const response = await fetch(`/api/english-hub/override?date=${todayStr()}`);
      const data = await response.json() as {
        success: boolean;
        data?: {
          manuallyOpened: boolean;
          manuallyClosed: boolean;
          manualOverrideAt: string | null;
          actorName: string | null;
        };
      };
      if (!response.ok || !data.success || !data.data) {
        console.error('Error checking override:', data);
        setStatusLoadError('Could not load registration status.');
        return;
      }

      setStatusLoadError(null);
      setOverrideActorName(data.data.actorName);
      const result = getRegistrationStatus({
        ...data.data,
        manualOverrideAt: data.data.manualOverrideAt ? new Date(data.data.manualOverrideAt) : null,
        sessionDate: startOfDayEAT(today),
      });
      setRegistrationStatus(result);
      setRegistrationClosesAt(
        result.status === 'OPEN' ? result.expiresAt ?? atEATMinutes(today, 14 * 60) : null
      );
      setCountdownNow(Date.now());
      setIsStatusLoading(false);
    } catch (error) {
      console.error('Error checking override:', error);
      setStatusLoadError('Could not load registration status.');
    } finally {
      setIsStatusLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    if (!selectedDate) {
      return;
    }
    if (!hasLoadedRegistrations.current) {
      setIsLoading(true);
    }
    setRegistrationLoadError(null);
    try {
      const params = new URLSearchParams({
        date: isTeacherOrAdmin ? selectedDate : 'today',
      });
      const response = await fetch(`/api/english-hub/registrations?${params.toString()}`);
      const data = await response.json() as {
        success: boolean;
        data: EnglishHubRegistration[];
        dayOverrides?: EnglishHubDayOverride[];
        availableDates?: string[];
        error?: string;
      };
      if (!response.ok || !data.success) {
        const message = data.error ?? 'Request failed';
        console.error('Error fetching registrations:', message);
        setRegistrationLoadError(message);
        return;
      }

      if (data.success) {
        setRegistrations(data.data);
        setDayOverrides(data.dayOverrides ?? []);
        setAvailableDates(data.availableDates ?? []);
        hasLoadedRegistrations.current = true;

        if (currentUserId && isSelectedToday) {
          const userReg = data.data.find((reg) =>
            reg.userId === currentUserId &&
            new Date(reg.sessionDate).toISOString().slice(0, 10) === selectedDate
          );
          setCurrentUserRegistration(userReg || null);
        } else {
          setCurrentUserRegistration(null);
        }
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrationLoadError('Could not load registrations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, isSelectedToday, isTeacherOrAdmin, selectedDate]);

  useEffect(() => {
    if (!currentUserId || !selectedDate) {
      return;
    }

    const initialFetch = window.setTimeout(() => {
      void fetchRegistrations();
    }, 0);
    const refreshInterval = isSelectedToday
      ? window.setInterval(() => void fetchRegistrations(), 120000) // 2 minutes
      : null;
    return () => {
      window.clearTimeout(initialFetch);
      if (refreshInterval !== null) {
        window.clearInterval(refreshInterval);
      }
    };
  }, [currentUserId, isSelectedToday, selectedDate, fetchRegistrations]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const initialStatusFetch = window.setTimeout(() => {
      void updateRegistrationStatus();
    }, 0);
    const interval = window.setInterval(() => {
      void updateRegistrationStatus();
    }, 300000); // 5 minutes
    return () => {
      window.clearTimeout(initialStatusFetch);
      window.clearInterval(interval);
    };
  }, [currentUserId, updateRegistrationStatus]);

  useEffect(() => {
    if (!registrationClosesAt) {
      return;
    }
    // Use requestAnimationFrame for smooth countdown timer instead of setInterval
    let animationFrameId: number;
    const updateCountdown = () => {
      setCountdownNow(Date.now());
      animationFrameId = requestAnimationFrame(updateCountdown);
    };
    animationFrameId = requestAnimationFrame(updateCountdown);
    return () => cancelAnimationFrame(animationFrameId);
  }, [registrationClosesAt]);

  useEffect(() => {
    if (!registrationClosesAt) {
      return;
    }
    const ms = registrationClosesAt.getTime() - Date.now();
    if (ms <= 0) {
      const timeout = window.setTimeout(() => void updateRegistrationStatus(), 0);
      return () => window.clearTimeout(timeout);
    }
    const timeout = window.setTimeout(() => void updateRegistrationStatus(), ms + 1000);
    return () => window.clearTimeout(timeout);
  }, [registrationClosesAt, updateRegistrationStatus]);

  // ------------------------------------------------------------
  // OPTIMISTIC REGISTER
  // ------------------------------------------------------------
  const handleRegister = async () => {
    if (!session?.user || isRegistering) return;

    const sessionDate = todayStr();
    const tempId = `temp-${Date.now()}`;

    const optimistic: EnglishHubRegistration = {
      id: tempId,
      userId: session.user.id,
      sessionDate,
      attendanceStatus: 'REGISTERED',
      registeredAt: new Date().toISOString(),
      user: {
        id: session.user.id,
        firstName: currentUserFirstName,
        lastName: currentUserLastName,
        profileImageUrl: currentUserImage ?? null,
        role: currentUserRole ? { name: currentUserRole } : null,
      },
    };

    // ⚡ Instant UI update
    setRegistrations((prev) => [...prev, optimistic]);
    setCurrentUserRegistration(optimistic);
    setIsRegistering(true);

    try {
      const response = await fetch('/api/english-hub/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionDate }),
      });
      const data = await response.json() as { success: boolean; error?: string };
      if (!response.ok || !data.success) {
        // Rollback
        setRegistrations((prev) => prev.filter((r) => r.id !== tempId));
        setCurrentUserRegistration(null);
        alert(data.error || 'Failed to register');
      } else {
        // Reconcile with server truth
        await fetchRegistrations();
      }
    } catch (error) {
      console.error('Error registering:', error);
      setRegistrations((prev) => prev.filter((r) => r.id !== tempId));
      setCurrentUserRegistration(null);
      alert('Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  // ------------------------------------------------------------
  // OPTIMISTIC CANCEL
  // ------------------------------------------------------------
  const handleCancelRegistration = async (registrationId: string) => {
    if (cancelingId) return;

    // ⚡ Instant UI update
    setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
    setCurrentUserRegistration(null);
    setCancelingId(registrationId);

    try {
      const response = await fetch(`/api/english-hub/registrations/${registrationId}`, {
        method: 'DELETE',
      });
      const data = await response.json() as { success: boolean; error?: string };
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to cancel registration');
        await fetchRegistrations();
      } else {
        await fetchRegistrations();
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      await fetchRegistrations();
    } finally {
      setCancelingId(null);
    }
  };

  // ------------------------------------------------------------
  // OPTIMISTIC ATTENDANCE MARK (teacher/admin)
  // ------------------------------------------------------------
  const handleMarkAttendance = async (registrationId: string, status: 'ATTENDED' | 'NO_SHOW') => {
    if (markingId) return;

    // ⚡ Instant UI update
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              attendanceStatus: status,
              markedAt: new Date().toISOString(),
              markedBy: session?.user
                ? {
                    id: session.user.id,
                    firstName: session.user.name?.split(' ')[0] || 'You',
                    lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
                  }
                : r.markedBy,
            }
          : r
      )
    );
    setMarkingId(registrationId);

    try {
      const response = await fetch(`/api/english-hub/attendance/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceStatus: status }),
      });
      const data = await response.json() as { success: boolean; error?: string };
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to mark attendance');
        await fetchRegistrations();
      } else {
        await fetchRegistrations();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      await fetchRegistrations();
    } finally {
      setMarkingId(null);
    }
  };

  // ------------------------------------------------------------
  // OPTIMISTIC OVERRIDE (teacher/admin)
  // ------------------------------------------------------------
  const handleOverride = async (action: 'open' | 'close') => {
    if (isOverriding) return;

    const now = new Date();
    const result = getRegistrationStatus({
      manuallyOpened: action === 'open',
      manuallyClosed: action === 'close',
      manualOverrideAt: now,
      sessionDate: startOfDayEAT(now),
    });
    setRegistrationStatus(result);
    setRegistrationClosesAt(
      result.status === 'OPEN' ? result.expiresAt ?? atEATMinutes(now, 14 * 60) : null
    );
    setCountdownNow(now.getTime());
    setIsOverriding(true);

    try {
      const response = await fetch('/api/english-hub/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, sessionDate: todayStr() }),
      });
      const data = await response.json() as { success: boolean; error?: string };
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to update registration');
        await updateRegistrationStatus();
      } else {
        await updateRegistrationStatus();
        await fetchRegistrations();
      }
    } catch (error) {
      console.error('Error overriding registration:', error);
      alert('Failed to update registration');
      await updateRegistrationStatus();
    } finally {
      setIsOverriding(false);
    }
  };

  const getRoleDisplayName = (roleName: string | null | undefined) => {
    if (!roleName) return 'student';
    if (roleName === 'teacher') return 'tutor';
    if (roleName === 'admin' || roleName === 'super_admin') return 'manager';
    return roleName;
  };

  const registrationMinutesRemaining = registrationClosesAt
    ? Math.max(0, Math.ceil((registrationClosesAt.getTime() - countdownNow) / 60000))
    : null;
  const attendanceCounts = {
    ALL: registrations.length,
    REGISTERED: registrations.filter((registration) => registration.attendanceStatus === 'REGISTERED').length,
    ATTENDED: registrations.filter((registration) => registration.attendanceStatus === 'ATTENDED').length,
    NO_SHOW: registrations.filter((registration) => registration.attendanceStatus === 'NO_SHOW').length,
  };
  const filteredRegistrations = attendanceFilter === 'ALL'
    ? registrations
    : registrations.filter((registration) => registration.attendanceStatus === attendanceFilter);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F4F5F1] text-[#172033]">

      {/* HEADER */}
      <section className="bg-[#142B46]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B8D7E8]">English Hub</p>
              <h1 className="mt-1 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                English Hub Learning &amp; Attendance
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#B8D7E8]">
                These requirements apply to every English Hub session. Read them carefully before attending.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#B98A3E]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B98A3E]">Status</p>
                <p className="text-xs font-semibold text-white">Mandatory for all students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRITICAL RULES + DEADLINE */}
      <section className="bg-[#F4F5F1]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#A4462F] text-white">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A4462F]">The non-negotiables</p>
              <h2 className="text-base font-bold text-[#172033] sm:text-lg">Four rules that decide attendance</h2>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {criticalRules.map((rule) => {
                const Icon = rule.icon;
                return (
                  <div key={rule.title} className="bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#B98A3E]" />
                      <h3 className="text-sm font-bold leading-snug text-[#172033]">{rule.title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#687268]">{rule.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col justify-center bg-[#142B46] p-5 text-white">
              <Clock3 className="h-5 w-5 text-[#B98A3E]" />
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#B98A3E]">Registration window</p>
              <h3 className="mt-1 text-base font-bold leading-snug">1:30 PM to 2:00 PM — no exceptions.</h3>
              <p className="mt-2 text-xs leading-5 text-[#B8D7E8]">
                Registration opens at 1:30 PM and closes exactly at 2:00 PM. Late registration will not be accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FULL CODE OF CONDUCT */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#55705B]">
                <FileText className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Full policy</span>
              </div>
              <h2 className="mt-1.5 text-xl font-bold leading-tight text-[#172033] sm:text-2xl">Code of Conduct</h2>
            </div>
            <p className="max-w-md text-xs leading-5 text-[#687268]">
              All rules are grouped by theme so you can review them quickly. Not knowing these policies will not be accepted as an excuse.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {conductGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.id} className="bg-[#FBFBF8] p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2.5 pb-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEF2F8] text-[#142B46]">
                      <GroupIcon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-[#142B46]">{group.label}</h3>
                  </div>
                  <div className="space-y-3">
                    {group.rules.map((rule) => (
                      <article key={rule.number} className="grid grid-cols-[36px_1fr] gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#142B46] font-mono text-[11px] font-bold text-white">
                          {rule.number}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#172033]">{rule.title}</h4>
                          <p className="mt-1 text-xs leading-5 text-[#59655C]">{rule.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-start gap-2 bg-[#142B46] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B98A3E]">Final reminder</p>
              <h3 className="mt-0.5 text-sm font-bold sm:text-base">Respect the space. Participate. Come prepared.</h3>
            </div>
            <p className="max-w-xl text-xs leading-5 text-[#B8D7E8]">
              By remaining in the English Hub, you agree to abide by all regulations above.
            </p>
          </div>
        </div>
      </section>

      {/* LEARNING PATH */}
      <section className="bg-[#F4F5F1]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#55705B]">Once you are ready to practice</p>
            <h2 className="mt-1.5 text-xl font-bold leading-tight text-[#172033] sm:text-2xl">Your learning path</h2>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#687268]">
              Three ways to keep improving, once you understand the standard.
            </p>
          </div>

          <div className="space-y-2">
            {tracks.map((track) => (
              <Link
                key={track.title}
                href={track.href}
                className="group flex items-center gap-3 text-sm font-semibold text-[#172033] transition-colors hover:text-[#B98A3E]"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                {track.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY PRACTICE + COMMUNITY */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-[#B98A3E]">
                <Target className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">Daily practice</span>
              </div>
              <h2 className="mt-1.5 text-lg font-bold leading-tight text-[#172033] sm:text-xl">Small practice. Real progress.</h2>
              <p className="mt-1.5 max-w-md text-xs leading-5 text-[#687268]">
                A simple routine beats a long session. Return to it consistently.
              </p>

              <div className="mt-4 divide-y divide-[#E7E9E5]">
                {practiceSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="group grid grid-cols-[28px_20px_1fr] items-center gap-3 py-3">
                      <span className="font-mono text-[10px] font-bold text-[#9A9F97]">{step.number}</span>
                      <Icon className="h-4 w-4 text-[#55705B] transition-transform duration-300 group-hover:scale-110" />
                      <div>
                        <h3 className="text-sm font-bold text-[#172033]">{step.title}</h3>
                        <p className="text-xs leading-5 text-[#687268]">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link href="/dashboard/live-streaming" className="group mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#55705B]">
                Begin today&apos;s practice
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-lg bg-[#EDEFEA] p-5">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#55705B]" />
                  <h2 className="text-sm font-bold text-[#172033]">Keep your momentum</h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#687268]">
                  Consistency matters more than long study sessions. Learn something useful, practice it, and use it with someone.
                </p>
              </div>
              <div className="mt-4 pt-4">
                <p className="text-xs font-semibold text-[#172033]">Learning is better together.</p>
                <p className="mt-0.5 text-xs text-[#687268]">Practice with someone from your community.</p>
                <Link href="/dashboard/messages" className="group mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#55705B]">
                  Open messages
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          {/* Status Banner */}
          <p className="mb-2 text-xs font-semibold text-[#687268]">
            {todayDate ? `Today: ${formatRegistrationDate(todayDate)}` : (
              <span className="inline-block h-3 w-48 animate-pulse rounded bg-[#E7E9E5]" aria-hidden="true" />
            )}
          </p>
          <div
            aria-busy={isStatusLoading}
            className={`flex items-center justify-between rounded-lg p-4 ${
              isStatusLoading || statusLoadError
                ? 'bg-[#E7E9E5] text-[#172033]'
                :
              registrationStatus.status === 'OPEN'
                ? 'bg-[#55705B] text-white'
                : registrationStatus.status === 'NOT_AVAILABLE'
                ? 'bg-[#A4462F] text-white'
                : 'bg-[#E7E9E5] text-[#172033]'
            }`}
          >
            {isStatusLoading ? (
              <div className="w-full space-y-2" aria-hidden="true">
                <div className="h-3 w-56 animate-pulse rounded bg-[#D9DDD7]" />
                <div className="h-4 w-40 animate-pulse rounded bg-[#D9DDD7]" />
              </div>
            ) : statusLoadError ? (
              <p className="text-sm font-semibold text-[#A4462F]" role="alert">
                {statusLoadError}
              </p>
            ) : (
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {session?.user?.techCenter?.name
                      ? `${session.user.techCenter.name} — `
                      : ''}
                    {registrationStatus.status === 'OPEN'
                      ? 'English Hub Registration Open'
                      : 'English Hub Registration Closed'}
                  </p>
                  <p className="text-sm font-semibold">
                    {registrationStatus.status === 'OPEN' &&
                    registrationStatus.message === 'Registration reopened by tutor/manager' &&
                    overrideActorName
                      ? `Registration reopened by ${overrideActorName}`
                      : registrationStatus.message}
                  </p>
                  {registrationStatus.status === 'OPEN' && registrationClosesAt && registrationMinutesRemaining !== null && (
                    <p className="text-xs font-medium">
                      Closing in {registrationMinutesRemaining} min
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Registration controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {isTeacherOrAdmin && isSelectedToday && !isStatusLoading && !statusLoadError && (
              <button
                onClick={() => handleOverride(registrationStatus.status === 'OPEN' ? 'close' : 'open')}
                disabled={isOverriding}
                className={`text-xs font-bold underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 ${
                  registrationStatus.status === 'OPEN' ? 'text-[#A4462F]' : 'text-[#55705B]'
                }`}
              >
                {isOverriding
                  ? 'Updating…'
                  : registrationStatus.status === 'OPEN'
                  ? 'Close registration'
                  : 'Open registration'}
              </button>
            )}
            {isSelectedToday && registrationStatus.canRegister && !currentUserRegistration && (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="ml-auto text-sm font-bold text-[#9A7335] underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRegistering ? 'Registering…' : 'Register now'}
              </button>
            )}
          </div>

          {/* Registrations for selected day */}
          <div className="mt-6">
            <div className="mb-4 flex justify-start">
              {isTeacherOrAdmin && (
                <label className="flex w-full items-center justify-start">
                  <span className="sr-only">Filter registrations by day</span>
                  <select
                    value={selectedDate}
                    aria-label="Filter registrations by day"
                    onChange={(event) => {
                      hasLoadedRegistrations.current = false;
                      setRegistrations([]);
                      setDayOverrides([]);
                      setRegistrationLoadError(null);
                      setIsLoading(true);
                      setSelectedDate(event.target.value);
                    }}
                    className="w-auto min-w-[300px] rounded-lg border border-[#D0D5CE] bg-[#FBFBF8] px-4 py-2.5 pr-10 text-sm font-semibold text-[#172033] shadow-sm outline-none transition focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/20 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23B98A3E'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1rem',
                    }}
                  >
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {date === todayDate ? `Today — ${formatRegistrationDate(date)}` : formatRegistrationDate(date)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {!isSelectedToday && isTeacherOrAdmin && (
              <p className="mb-4 text-xs text-[#687268]">
                Staff will update your status.
              </p>
            )}

            {isLoading ? (
              <div className="mb-4 flex flex-wrap items-center gap-3" aria-hidden="true">
                <div className="h-4 w-40 animate-pulse rounded bg-[#E7E9E5]" />
                <div className="h-4 w-16 animate-pulse rounded bg-[#E7E9E5]" />
                <div className="h-4 w-24 animate-pulse rounded bg-[#E7E9E5]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#E7E9E5]" />
                <div className="h-4 w-20 animate-pulse rounded bg-[#E7E9E5]" />
              </div>
            ) : !registrationLoadError ? (
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  onClick={() => setAttendanceFilter('ALL')}
                  aria-pressed={attendanceFilter === 'ALL'}
                  className={`mr-1 text-xs font-semibold underline-offset-4 transition hover:underline ${
                    attendanceFilter === 'ALL' ? 'text-[#142B46] underline' : 'text-[#687268]'
                  }`}
                >
                  Total registered: {registrations.length}
                </button>
                {([
                  ['ATTENDED', 'Attended'],
                  ['NO_SHOW', 'No Show'],
                ] as const).map(([status, label]) => (
                  <button
                    key={status}
                    onClick={() => setAttendanceFilter(status)}
                    aria-pressed={attendanceFilter === status}
                    className={`text-xs font-semibold underline-offset-4 transition hover:underline ${
                      attendanceFilter === status ? 'text-[#142B46] underline' : 'text-[#687268]'
                    }`}
                  >
                    {label} ({attendanceCounts[status]})
                  </button>
                ))}
              </div>
            ) : null}

            {isTeacherOrAdmin && dayOverrides.length > 0 && (
              <div className="mb-4 space-y-2 border-l-2 border-[#B98A3E] pl-3">
                <p className="text-xs font-bold uppercase tracking-wide text-[#687268]">
                  Registration changes
                </p>
                {dayOverrides.map((dayOverride) => (
                  <p key={`${dayOverride.sessionDate}-${dayOverride.manualOverrideAt ?? 'override'}`} className="text-xs text-[#172033]">
                    {formatRegistrationDate(dayOverride.sessionDate)}:
                    {' Registration '}
                    {dayOverride.manuallyClosed ? 'closed' : 'opened'}
                    {' by '}
                    <span className="font-semibold">
                      {dayOverride.actor
                        ? `${dayOverride.actor.firstName} ${dayOverride.actor.lastName}`.trim()
                        : 'staff member'}
                    </span>
                  </p>
                ))}
              </div>
            )}

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
            ) : registrationLoadError ? (
              <div className="py-8 text-center text-sm text-[#A4462F]" role="alert">
                {registrationLoadError}
              </div>
            ) : registrations.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#687268]">
                {isSelectedToday
                  ? 'No registrations yet today.'
                  : `No registrations yet for ${formatRegistrationDate(selectedDate)}.`}
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#687268]">
                No users match the {attendanceFilter === 'NO_SHOW' ? 'No Show' : attendanceFilter.toLowerCase()} filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 lg:grid-cols-2 lg:gap-y-4 xl:grid-cols-3">
                {filteredRegistrations.map((registration) => {
                  const isTemp = registration.id.startsWith('temp-');
                  const isCurrentUser = registration.userId === currentUserId;
                  const canCancel = isCurrentUser &&
                    isSelectedToday &&
                    registrationStatus.canRegister &&
                    registration.attendanceStatus === 'REGISTERED';
                  const canMarkAttendance = isTeacherOrAdmin &&
                    !isTemp &&
                    registration.attendanceStatus === 'REGISTERED';

                  return (
                    <div
                      key={registration.id}
                      className={`flex items-start gap-3 rounded-lg p-3 transition sm:gap-4 ${
                        isTemp ? 'bg-[#B98A3E]/5 animate-pulse' : 'bg-[#FBFBF8]'
                      }`}
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

                          <div className="mt-1 flex min-h-5 flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            {canMarkAttendance && (
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <button
                                  onClick={() => handleMarkAttendance(registration.id, 'ATTENDED')}
                                  disabled={markingId === registration.id}
                                  className="text-xs font-bold text-[#55705B] underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {markingId === registration.id ? 'Marking…' : 'Mark attended'}
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(registration.id, 'NO_SHOW')}
                                  disabled={markingId === registration.id}
                                  className="text-xs font-bold text-[#A4462F] underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Mark no show
                                </button>
                              </div>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleCancelRegistration(registration.id)}
                                disabled={cancelingId === registration.id}
                                className="text-xs font-bold text-[#A4462F] underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {cancelingId === registration.id ? 'Unregistering…' : 'Unregister'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-3 text-xs text-[#687268] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#55705B]" />
              <span>Learn at your own pace.</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/dashboard/courses" className="font-semibold text-[#55705B] transition hover:text-[#172033]">Courses</Link>
              <Link href="/dashboard/messages" className="font-semibold text-[#55705B] transition hover:text-[#172033]">Community</Link>
              <Link href="/dashboard/policies" className="font-semibold text-[#55705B] transition hover:text-[#172033]">Learning policies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/*
Verification checklist:
[ ] Weekday 13:29 -> status NOT_YET_OPEN, no register button
[ ] Weekday 13:30 -> status OPEN (auto), register button visible
[ ] Weekday 14:00 -> status CLOSED (auto), register button hidden
[ ] Weekday 14:05 -> teacher clicks Open -> optimistic OPEN, POST /override upserts OVERRIDE_ROW, refresh confirms OPEN for 2h
[ ] Weekday 16:05 (2h+ after 14:05) -> status CLOSED, no manual action needed
[ ] Weekday 22:30 reopen -> banner shows expiresAt = 23:59 same day
[ ] Weekday 23:59:30 -> status CLOSED (end-of-day cap applied)
[ ] Next day 13:00 -> status NOT_YET_OPEN (override did NOT leak)
[ ] Weekend -> status NOT_AVAILABLE for all users
[ ] Teacher marks attended while status OPEN -> API returns 409, UI shows error
[ ] Teacher marks attended while status CLOSED -> row updates optimistically
[ ] Student cancels while status OPEN -> succeeds
[ ] Student cancels while status CLOSED -> API returns 409, UI rolls back
[ ] Student GET /registrations -> only today's rows, OVERRIDE_ROW excluded
[ ] Staff date dropdown includes only days with registrations and defaults to today
[ ] Selecting a past day shows only that day's registrations and allows attendance updates
[ ] Past dates do not show registration open/close or register/cancel actions
[ ] Current-day registrations refresh periodically so new registrations appear
[ ] Registering twice in one day -> second POST returns 409 "Already registered today"
[ ] Rows for the same userId and UTC sessionDate never exceed one, as enforced by @@unique
*/