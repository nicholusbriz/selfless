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

  const [isRegistering, setIsRegistering] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isOverriding, setIsOverriding] = useState(false);

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
      ? window.setInterval(() => void fetchRegistrations(), 120000)
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
    }, 300000);
    return () => {
      window.clearTimeout(initialStatusFetch);
      window.clearInterval(interval);
    };
  }, [currentUserId, updateRegistrationStatus]);

  useEffect(() => {
    if (!registrationClosesAt) {
      return;
    }
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
        setRegistrations((prev) => prev.filter((r) => r.id !== tempId));
        setCurrentUserRegistration(null);
        alert(data.error || 'Failed to register');
      } else {
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

  const handleCancelRegistration = async (registrationId: string) => {
    if (cancelingId) return;
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

  const handleMarkAttendance = async (registrationId: string, status: 'ATTENDED' | 'NO_SHOW') => {
    if (markingId) return;

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
    <main className="min-h-screen overflow-x-hidden bg-[#F8F9FA] text-[#1A2B4C]">

      {/* HEADER */}
      <section className="border-b border-[#E5E7EB] bg-[#1A2B4C]">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C59B4C]">English Hub</p>
              <h1 className="mt-0.5 text-[17px] font-bold leading-tight tracking-tight text-white sm:text-[19px]">
                English Hub Learning &amp; Attendance
              </h1>
              <p className="mt-1 max-w-2xl text-[11.5px] leading-5 text-[#A8B8D0]">
                These requirements apply to every English Hub session. Read them carefully before attending.
              </p>
            </div>
            <div className="flex items-center gap-2.5 rounded-md border border-white/10 bg-white/5 px-3 py-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#C59B4C]" />
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-wide text-[#C59B4C]">Status</p>
                <p className="text-[11.5px] font-medium text-white">Mandatory for all students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CRITICAL RULES + DEADLINE */}
      <section className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#A4462F] text-white">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A4462F]">The non-negotiables</p>
              <h2 className="text-[14px] font-semibold text-[#1A2B4C] sm:text-[15px]">Four rules that decide attendance</h2>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              {criticalRules.map((rule) => {
                const Icon = rule.icon;
                return (
                  <div key={rule.title} className="rounded-lg border border-[#E5E7EB] bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#C59B4C]" />
                      <h3 className="text-[12.5px] font-semibold leading-snug text-[#1A2B4C]">{rule.title}</h3>
                    </div>
                    <p className="mt-1.5 text-[11.5px] leading-5 text-[#6B7280]">{rule.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col justify-center rounded-lg bg-[#1A2B4C] p-4 text-white">
              <Clock3 className="h-4 w-4 text-[#C59B4C]" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C59B4C]">Registration window</p>
              <h3 className="mt-0.5 text-[13px] font-semibold leading-snug">1:30 PM to 2:00 PM — no exceptions.</h3>
              <p className="mt-1.5 text-[11.5px] leading-5 text-[#A8B8D0]">
                Registration opens at 1:30 PM and closes exactly at 2:00 PM. Late registration will not be accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FULL CODE OF CONDUCT */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <div className="mb-3 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[#4B5646]">
                <FileText className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Full policy</span>
              </div>
              <h2 className="mt-1 text-[16px] font-semibold leading-tight text-[#1A2B4C] sm:text-[17px]">Code of Conduct</h2>
            </div>
            <p className="max-w-md text-[11.5px] leading-5 text-[#6B7280]">
              All rules are grouped by theme so you can review them quickly. Not knowing these policies will not be accepted as an excuse.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {conductGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.id} className="rounded-lg border border-[#E5E7EB] bg-white p-3.5">
                  <div className="mb-2.5 flex items-center gap-2 border-b border-[#F3F4F6] pb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#EEF1F5] text-[#1A2B4C]">
                      <GroupIcon className="h-3 w-3" />
                    </div>
                    <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#1A2B4C]">{group.label}</h3>
                  </div>
                  <div className="space-y-2.5">
                    {group.rules.map((rule) => (
                      <article key={rule.number} className="grid grid-cols-[28px_1fr] gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1A2B4C] text-[9.5px] font-bold text-white">
                          {rule.number}
                        </div>
                        <div>
                          <h4 className="text-[12.5px] font-semibold text-[#1A2B4C]">{rule.title}</h4>
                          <p className="mt-0.5 text-[11.5px] leading-5 text-[#4B5646]">{rule.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-col items-start gap-2 rounded-lg bg-[#1A2B4C] px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C59B4C]">Final reminder</p>
              <h3 className="mt-0.5 text-[12.5px] font-semibold sm:text-[13px]">Respect the space. Participate. Come prepared.</h3>
            </div>
            <p className="max-w-xl text-[11.5px] leading-5 text-[#A8B8D0]">
              By remaining in the English Hub, you agree to abide by all regulations above.
            </p>
          </div>
        </div>
      </section>

      {/* LEARNING PATH */}
      <section className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4B5646]">Once you are ready to practice</p>
            <h2 className="mt-1 text-[16px] font-semibold leading-tight text-[#1A2B4C] sm:text-[17px]">Your learning path</h2>
            <p className="mt-1 max-w-xl text-[11.5px] leading-5 text-[#6B7280]">
              Three ways to keep improving, once you understand the standard.
            </p>
          </div>

          <div className="space-y-1.5">
            {tracks.map((track) => (
              <Link
                key={track.title}
                href={track.href}
                className="group flex items-center gap-2.5 text-[12.5px] font-semibold text-[#1A2B4C] transition-colors hover:text-[#C59B4C]"
              >
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                {track.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY PRACTICE + COMMUNITY */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-1.5 text-[#C59B4C]">
                <Target className="h-3.5 w-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">Daily practice</span>
              </div>
              <h2 className="mt-1 text-[15px] font-semibold leading-tight text-[#1A2B4C] sm:text-[16px]">Small practice. Real progress.</h2>
              <p className="mt-1 max-w-md text-[11.5px] leading-5 text-[#6B7280]">
                A simple routine beats a long session. Return to it consistently.
              </p>

              <div className="mt-3 divide-y divide-[#F3F4F6]">
                {practiceSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="grid grid-cols-[24px_16px_1fr] items-center gap-2.5 py-2.5">
                      <span className="text-[9.5px] font-bold text-[#9CA3AF]">{step.number}</span>
                      <Icon className="h-3.5 w-3.5 text-[#4B5646]" />
                      <div>
                        <h3 className="text-[12.5px] font-semibold text-[#1A2B4C]">{step.title}</h3>
                        <p className="text-[11.5px] leading-5 text-[#6B7280]">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link href="/dashboard/live-streaming" className="group mt-2.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#4B5646]">
                Begin today&apos;s practice
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="flex flex-col justify-between rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] p-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#4B5646]" />
                  <h2 className="text-[12.5px] font-semibold text-[#1A2B4C]">Keep your momentum</h2>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-5 text-[#6B7280]">
                  Consistency matters more than long study sessions. Learn something useful, practice it, and use it with someone.
                </p>
              </div>
              <div className="mt-3 border-t border-[#E5E7EB] pt-3">
                <p className="text-[11.5px] font-semibold text-[#1A2B4C]">Learning is better together.</p>
                <p className="mt-0.5 text-[11.5px] text-[#6B7280]">Practice with someone from your community.</p>
                <Link href="/dashboard/messages" className="group mt-1.5 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#4B5646]">
                  Open messages
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">
          <p className="mb-1.5 text-[11.5px] font-medium text-[#6B7280]">
            {todayDate ? `Today: ${formatRegistrationDate(todayDate)}` : (
              <span className="inline-block h-3 w-48 animate-pulse rounded bg-[#F3F4F6]" aria-hidden="true" />
            )}
          </p>
          <div
            aria-busy={isStatusLoading}
            className={`flex items-center justify-between rounded-lg p-3 ${
              isStatusLoading || statusLoadError
                ? 'border border-[#E5E7EB] bg-[#F8F9FA] text-[#1A2B4C]'
                : registrationStatus.status === 'OPEN'
                  ? 'bg-[#4B5646] text-white'
                  : registrationStatus.status === 'NOT_AVAILABLE'
                    ? 'bg-[#A4462F] text-white'
                    : 'border border-[#E5E7EB] bg-[#F8F9FA] text-[#1A2B4C]'
            }`}
          >
            {isStatusLoading ? (
              <div className="w-full space-y-1.5" aria-hidden="true">
                <div className="h-2.5 w-56 animate-pulse rounded bg-[#E5E7EB]" />
                <div className="h-3.5 w-40 animate-pulse rounded bg-[#E5E7EB]" />
              </div>
            ) : statusLoadError ? (
              <p className="text-[12.5px] font-semibold text-[#A4462F]" role="alert">
                {statusLoadError}
              </p>
            ) : (
              <div className="flex items-center gap-2.5">
                <Clock3 className="h-4 w-4" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide">
                    {session?.user?.techCenter?.name
                      ? `${session.user.techCenter.name} — `
                      : ''}
                    {registrationStatus.status === 'OPEN'
                      ? 'English Hub Registration Open'
                      : 'English Hub Registration Closed'}
                  </p>
                  <p className="text-[12.5px] font-medium">
                    {registrationStatus.status === 'OPEN' &&
                    registrationStatus.message === 'Registration reopened by tutor/manager' &&
                    overrideActorName
                      ? `Registration reopened by ${overrideActorName}`
                      : registrationStatus.message}
                  </p>
                  {registrationStatus.status === 'OPEN' && registrationClosesAt && registrationMinutesRemaining !== null && (
                    <p className="text-[11px] font-medium">
                      Closing in {registrationMinutesRemaining} min
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            {isTeacherOrAdmin && isSelectedToday && !isStatusLoading && !statusLoadError && (
              <button
                onClick={() => handleOverride(registrationStatus.status === 'OPEN' ? 'close' : 'open')}
                disabled={isOverriding}
                className={`text-[11.5px] font-semibold underline-offset-2 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50 ${
                  registrationStatus.status === 'OPEN' ? 'text-[#A4462F]' : 'text-[#4B5646]'
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
                className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-[#C59B4C] px-3 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-[#B08A3F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRegistering ? 'Registering…' : 'Register now'}
              </button>
            )}
          </div>

          <div className="mt-5">
            <div className="mb-3 flex justify-start">
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
                    className="w-auto min-w-[280px] rounded-md border border-[#E5E7EB] bg-white px-3 py-1.5 pr-9 text-[12px] font-medium text-[#1A2B4C] shadow-sm outline-none transition-colors focus:border-[#C59B4C] focus:ring-2 focus:ring-[#C59B4C]/15 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23C59B4C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.65rem center',
                      backgroundSize: '0.9rem',
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
              <p className="mb-3 text-[11.5px] text-[#6B7280]">
                Staff will update your status.
              </p>
            )}

            {isLoading ? (
              <div className="mb-3 flex flex-wrap items-center gap-3" aria-hidden="true">
                <div className="h-3.5 w-36 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-3.5 w-14 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-3.5 w-20 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-3.5 w-16 animate-pulse rounded bg-[#F3F4F6]" />
                <div className="h-3.5 w-16 animate-pulse rounded bg-[#F3F4F6]" />
              </div>
            ) : !registrationLoadError ? (
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <button
                  onClick={() => setAttendanceFilter('ALL')}
                  aria-pressed={attendanceFilter === 'ALL'}
                  className={`mr-1 text-[11.5px] font-semibold underline-offset-2 transition-colors hover:underline ${
                    attendanceFilter === 'ALL' ? 'text-[#1A2B4C] underline' : 'text-[#6B7280]'
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
                    className={`text-[11.5px] font-semibold underline-offset-2 transition-colors hover:underline ${
                      attendanceFilter === status ? 'text-[#1A2B4C] underline' : 'text-[#6B7280]'
                    }`}
                  >
                    {label} ({attendanceCounts[status]})
                  </button>
                ))}
              </div>
            ) : null}

            {isTeacherOrAdmin && dayOverrides.length > 0 && (
              <div className="mb-3 space-y-1 border-l-2 border-[#C59B4C] bg-[#FBF7EE] px-3 py-2">
                <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#6B7280]">
                  Registration changes
                </p>
                {dayOverrides.map((dayOverride) => (
                  <p key={`${dayOverride.sessionDate}-${dayOverride.manualOverrideAt ?? 'override'}`} className="text-[11.5px] text-[#1A2B4C]">
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
              <div className="grid grid-cols-1 gap-x-5 gap-y-2 lg:grid-cols-2 xl:grid-cols-3" aria-label="Loading registrations">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="flex items-start gap-2.5 rounded-md border border-[#F3F4F6] bg-white p-2.5">
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#F3F4F6]" />
                    <div className="min-w-0 flex-1 space-y-1.5 py-1">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />
                      <div className="h-2.5 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-[#F3F4F6]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : registrationLoadError ? (
              <div className="py-6 text-center text-[12px] text-[#A4462F]" role="alert">
                {registrationLoadError}
              </div>
            ) : registrations.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#F8F9FA] py-8 text-center text-[12px] text-[#6B7280]">
                {isSelectedToday
                  ? 'No registrations yet today.'
                  : `No registrations yet for ${formatRegistrationDate(selectedDate)}.`}
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#E5E7EB] bg-[#F8F9FA] py-8 text-center text-[12px] text-[#6B7280]">
                No users match the {attendanceFilter === 'NO_SHOW' ? 'No Show' : attendanceFilter.toLowerCase()} filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-5 gap-y-2 lg:grid-cols-2 xl:grid-cols-3">
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
                      className={`flex items-start gap-2.5 rounded-md border p-2.5 transition-colors ${
                        isTemp
                          ? 'border-[#C59B4C]/30 bg-[#FBF7EE] animate-pulse'
                          : 'border-[#F3F4F6] bg-white'
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-2.5">
                        {registration.user.profileImageUrl ? (
                          <Image
                            src={registration.user.profileImageUrl}
                            alt={`${registration.user.firstName} ${registration.user.lastName}`}
                            width={36}
                            height={36}
                            unoptimized
                            className="h-9 w-9 shrink-0 rounded-full border border-[#E5E7EB] object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A2B4C] text-[11px] font-bold text-white">
                            {registration.user.firstName?.[0] ?? '?'}
                            {registration.user.lastName?.[0] ?? ''}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p className="break-words text-[12.5px] font-semibold leading-5 text-[#1A2B4C]">
                              {registration.user.firstName} {registration.user.lastName}
                            </p>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#6B7280]">
                            <span>
                              {new Date(registration.registeredAt).toLocaleTimeString([], {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                                timeZone: 'Africa/Nairobi',
                              })}
                            </span>
                            <span aria-hidden="true" className="text-[#D1D5DB]">·</span>
                            {registration.attendanceStatus === 'REGISTERED' && (
                              <span className="font-medium text-[#6B7280]">Registered</span>
                            )}
                            {registration.attendanceStatus === 'ATTENDED' && (
                              <span className="font-semibold text-[#2F6B45]">Attended</span>
                            )}
                            {registration.attendanceStatus === 'NO_SHOW' && (
                              <span className="font-semibold text-[#A4462F]">No Show</span>
                            )}
                          </div>
                          {registration.markedBy && (
                            <p className="mt-0.5 text-[10px] leading-4 text-[#9CA3AF]">
                              Marked by {registration.markedBy.firstName} {registration.markedBy.lastName}
                            </p>
                          )}

                          <div className="mt-1 flex min-h-5 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            {canMarkAttendance && (
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <button
                                  onClick={() => handleMarkAttendance(registration.id, 'ATTENDED')}
                                  disabled={markingId === registration.id}
                                  className="text-[11px] font-semibold text-[#2F6B45] underline-offset-2 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {markingId === registration.id ? 'Marking…' : 'Mark attended'}
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(registration.id, 'NO_SHOW')}
                                  disabled={markingId === registration.id}
                                  className="text-[11px] font-semibold text-[#A4462F] underline-offset-2 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Mark no show
                                </button>
                              </div>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleCancelRegistration(registration.id)}
                                disabled={cancelingId === registration.id}
                                className="text-[11px] font-semibold text-[#A4462F] underline-offset-2 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
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
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-5">
          <div className="flex flex-col gap-2 text-[11px] text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-[#4B5646]" />
              <span>Learn at your own pace.</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <Link href="/dashboard/courses" className="font-semibold text-[#4B5646] transition-colors hover:text-[#1A2B4C]">Courses</Link>
              <Link href="/dashboard/messages" className="font-semibold text-[#4B5646] transition-colors hover:text-[#1A2B4C]">Community</Link>
              <Link href="/dashboard/policies" className="font-semibold text-[#4B5646] transition-colors hover:text-[#1A2B4C]">Learning policies</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}