'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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

// ============================================================
// DATA
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
  {
    number: '01',
    icon: PlayCircle,
    title: 'Listen',
    description: 'Watch one short English lesson or conversation.',
  },
  {
    number: '02',
    icon: Mic2,
    title: 'Use the language',
    description: 'Speak or write five new sentences using what you learned.',
  },
  {
    number: '03',
    icon: CheckCircle2,
    title: 'Reflect',
    description: 'Review the words, phrases, and ideas you want to remember.',
  },
];

// ------------------------------------------------------------
// Critical rules — surfaced at the top
// ------------------------------------------------------------
const criticalRules = [
  {
    icon: Clock3,
    title: 'Attendance sheet closes at 1:30 PM',
    description:
      'The sheet is circulated exactly 30 minutes before the session. Sign within the window — no exceptions.',
  },
  {
    icon: UserCheck,
    title: 'Attendance is earned, not given',
    description:
      'You must participate — speak, debate, respond. Being silent and present = absent.',
  },
  {
    icon: Smartphone,
    title: 'No phones or laptops during sessions',
    description:
      'Prepare points on paper. Using a phone at any time = marked absent without warning.',
  },
  {
    icon: Ban,
    title: 'No special requests or favours',
    description:
      'Do not ask the tutor to add your name or excuse absences after the deadline.',
  },
];

// ------------------------------------------------------------
// Full code of conduct, grouped into clear categories
// ------------------------------------------------------------
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
          'The official attendance sheet will be circulated exactly thirty minutes before the session begins (at 1:30 PM). You must sign your name within this thirty-minute window. If you fail to register within this window, you will automatically be marked absent. Late registration will not be accepted under any circumstances.',
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

export default function EnglishHubPage() {
  const [activeTrack, setActiveTrack] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTrack((current) => (current + 1) % tracks.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F4F5F1] text-[#172033]">
      {/* ============================================================
          HEADER BAND — bold, dashboard-style
      ============================================================ */}
      <section className="border-b-4 border-[#B98A3E] bg-[#142B46]">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B8D7E8]">
                English Hub
              </p>

              <h1 className="mt-1.5 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                Code of Conduct &amp; Attendance Standard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#B8D7E8]">
                These requirements apply to every English Hub session. Read
                them carefully before attending.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-4 py-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#B98A3E]" />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B98A3E]">
                  Status
                </p>

                <p className="text-xs font-semibold text-white">
                  Mandatory for all students
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          CRITICAL RULES — top priority, bold grid
      ============================================================ */}
      <section className="bg-[#F4F5F1]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#A4462F] text-white">
              <AlertTriangle className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A4462F]">
                The non-negotiables
              </p>

              <h2 className="text-lg font-bold text-[#172033]">
                Four rules that decide attendance
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {criticalRules.map((rule) => {
              const Icon = rule.icon;

              return (
                <div
                  key={rule.title}
                  className="border-l-4 border-[#B98A3E] bg-white p-5 shadow-sm"
                >
                  <Icon className="h-5 w-5 text-[#B98A3E]" />

                  <h3 className="mt-3 text-sm font-bold leading-snug text-[#172033]">
                    {rule.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#687268]">
                    {rule.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Deadline callout */}
          <div className="mt-6 flex items-start gap-4 border-l-4 border-[#142B46] bg-[#142B46] p-5 text-white sm:p-6">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#B98A3E]" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B98A3E]">
                Attendance deadline
              </p>

              <h3 className="mt-1 text-lg font-bold leading-snug">
                Sign the sheet by 1:30 PM — no exceptions.
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#B8D7E8]">
                The sheet is circulated exactly 30 minutes before the session
                begins. Late registration will not be accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FULL CODE OF CONDUCT — grouped by category
      ============================================================ */}
      <section className="border-t border-[#D9DDD7] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="mb-10">
            <div className="flex items-center gap-3 text-[#55705B]">
              <FileText className="h-5 w-5" />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                Full policy
              </span>
            </div>

            <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-[#172033] sm:text-3xl">
              Code of Conduct
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#687268]">
              All rules are grouped by theme so you can review them quickly.
              Not knowing these policies will not be accepted as an excuse.
            </p>
          </div>

          <div className="space-y-10">
            {conductGroups.map((group) => {
              const GroupIcon = group.icon;

              return (
                <div key={group.id}>
                  {/* Group heading */}
                  <div className="mb-4 flex items-center gap-3 border-b-2 border-[#142B46] pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2F8] text-[#142B46]">
                      <GroupIcon className="h-4 w-4" />
                    </div>

                    <h3 className="text-base font-bold uppercase tracking-wide text-[#142B46]">
                      {group.label}
                    </h3>
                  </div>

                  {/* Rules */}
                  <div className="space-y-4">
                    {group.rules.map((rule) => (
                      <article
                        key={rule.number}
                        className="grid gap-4 rounded-lg border border-[#E7E9E5] bg-[#FBFBF8] p-5 sm:grid-cols-[56px_1fr] sm:p-6"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#142B46] font-mono text-sm font-bold text-white sm:h-11 sm:w-11">
                          {rule.number}
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-[#172033] sm:text-lg">
                            {rule.title}
                          </h4>

                          <p className="mt-2.5 text-sm leading-7 text-[#59655C]">
                            {rule.text}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final reminder */}
          <div className="mt-12 border-l-4 border-[#B98A3E] bg-[#142B46] p-6 text-white sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B98A3E]">
              Final reminder
            </p>

            <h3 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">
              Respect the space. Participate. Come prepared.
            </h3>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#B8D7E8]">
              These rules are designed to create a focused, respectful, and
              professional learning environment for everyone. By remaining in
              the English Hub, you agree to abide by all regulations listed
              above.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          LEARNING PATH — supporting content, below the rules
      ============================================================ */}
      <section className="border-t border-[#D9DDD7] bg-[#F4F5F1]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#55705B]">
              Once you are ready to practice
            </p>

            <h2 className="mt-2 max-w-2xl text-2xl font-bold leading-tight text-[#172033] sm:text-3xl">
              Your learning path
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#687268]">
              Three ways to keep improving, once you understand the standard.
            </p>
          </div>

          <div className="divide-y divide-[#D9DDD7] border-y border-[#D9DDD7]">
            {tracks.map((track, index) => {
              const Icon = track.icon;
              const isActive = activeTrack === index;

              return (
                <Link
                  key={track.title}
                  href={track.href}
                  onMouseEnter={() => setActiveTrack(index)}
                  className="group relative grid gap-5 py-6 transition sm:grid-cols-[60px_1fr_auto] sm:items-center"
                >
                  <div className="font-mono text-sm font-bold text-[#9A9F97]">
                    {track.number}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 transition-colors duration-300 ${
                          isActive
                            ? 'text-[#B98A3E]'
                            : 'text-[#718076] group-hover:text-[#B98A3E]'
                        }`}
                      />

                      <h3 className="text-lg font-bold text-[#172033] sm:text-xl">
                        {track.title}
                      </h3>
                    </div>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#687268]">
                      {track.description}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#55705B]">
                    {track.action}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>

                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-[#B98A3E] transition-all duration-500 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          DAILY PRACTICE
      ============================================================ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3 text-[#B98A3E]">
                <Target className="h-5 w-5" />

                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Daily practice
                </span>
              </div>

              <h2 className="mt-3 max-w-md text-2xl font-bold leading-tight text-[#172033] sm:text-3xl">
                Small practice.
                <br />
                Real progress.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-[#687268]">
                You do not need a long study session to improve. Give yourself
                a simple routine and return to it consistently.
              </p>

              <Link
                href="/dashboard/live-streaming"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#55705B]"
              >
                Begin today&apos;s practice
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="border-y border-[#D9DDD7]">
              {practiceSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="group grid grid-cols-[42px_28px_1fr] items-center gap-4 border-b border-[#E7E9E5] py-6 last:border-0"
                  >
                    <span className="font-mono text-xs font-bold text-[#9A9F97]">
                      {step.number}
                    </span>

                    <Icon className="h-5 w-5 text-[#55705B] transition-transform duration-300 group-hover:scale-110" />

                    <div>
                      <h3 className="font-bold text-[#172033]">
                        {step.title}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#687268]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          COMMUNITY BAND
      ============================================================ */}
      <section className="border-y border-[#D9DDD7] bg-[#EDEFEA]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#55705B]" />

                <h2 className="text-lg font-bold text-[#172033]">
                  Keep your momentum
                </h2>
              </div>

              <p className="mt-3 max-w-lg text-sm leading-6 text-[#687268]">
                Consistency matters more than long study sessions. Learn
                something useful, practice it, and use it with someone.
              </p>
            </div>

            <div className="hidden h-14 w-px bg-[#D0D5CE] lg:block" />

            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-[#172033]">
                  Learning is better together.
                </p>

                <p className="mt-1 text-sm text-[#687268]">
                  Practice with someone from your community.
                </p>
              </div>

              <Link
                href="/dashboard/messages"
                className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#55705B]"
              >
                Open messages
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="border-t border-[#D9DDD7] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 text-sm text-[#687268] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#55705B]" />
              <span>Learn at your own pace.</span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link
                href="/dashboard/courses"
                className="font-semibold text-[#55705B] transition hover:text-[#172033]"
              >
                Courses
              </Link>

              <Link
                href="/dashboard/messages"
                className="font-semibold text-[#55705B] transition hover:text-[#172033]"
              >
                Community
              </Link>

              <Link
                href="/dashboard/policies"
                className="font-semibold text-[#55705B] transition hover:text-[#172033]"
              >
                Learning policies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}