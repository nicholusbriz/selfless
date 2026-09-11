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
  Trophy,
  Users,
  Video,
} from 'lucide-react';

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

const policies = [
  {
    number: '01',
    title: 'Classroom Space and Usage',
    text:
      'The main English Hub room is reserved strictly for active participants during class hours. If you are not attending the session, please use the adjacent study rooms or common areas.',
  },
  {
    number: '02',
    title: 'Active Participation — The “Present” Rule',
    text:
      'Attendance must be earned through active participation, not just presence. To be marked present, you must contribute to the session—whether by speaking in debates, responding to questions, or engaging in group work. Simply logging in or arriving on time does not guarantee attendance. If you remain silent and disengaged, your name will not be recorded, regardless of punctuality.',
  },
  {
    number: '03',
    title: 'Respect for Speakers and Turn-Taking',
    text:
      'When a fellow student is sharing, answering, or presenting, you may not interrupt, interject, or distract them. Only the English Tutor has the authority to open the floor for questions or comments. Do not speak unless you are explicitly called upon. Any student who disrupts or speaks out of turn will be marked absent, as this shows a lack of respect for the learning environment.',
  },
  {
    number: '04',
    title: 'Technology Policy',
    text:
      'To maintain focus and respect for speakers, phones and personal laptops are not permitted during sessions. On debate or presentation days, prepare your points on paper beforehand so you can present clearly. If you are observed using your phone or visibly distracted at any point, you will be marked absent without warning.',
  },
  {
    number: '05',
    title: 'Attendance Sheet and Registration — Strict Deadline',
    text:
      'The official attendance sheet will be circulated exactly thirty minutes before the session begins (at 1:30 PM). You must sign your name within this thirty-minute window. If you fail to register within this window, you will automatically be marked absent. Late registration will not be accepted under any circumstances.',
  },
  {
    number: '06',
    title: 'No Special Requests or Favours',
    text:
      'Do not approach the tutor to manually add your name, request a favour, or excuse an absence after the deadline. The policy is final, non-negotiable, and applies equally to all students.',
  },
  {
    number: '07',
    title: 'Preparation Requirement',
    text:
      'Students must come to class with a pen, paper, and any assigned readings or preparatory materials completed. Failure to bring basic writing materials may result in a verbal warning. Repeated offenses will affect your participation record.',
  },
  {
    number: '08',
    title: 'One Speaker at a Time',
    text:
      'When the tutor opens the floor for discussion, only one student may speak at a time. Side conversations, whispering, or group chatter are strictly prohibited. All attention must be directed to the current speaker.',
  },
  {
    number: '09',
    title: 'No Recording Without Permission',
    text:
      'Students are not permitted to audio-record, video-record, or photograph the session—including the attendance sheet—without the tutor’s explicit written consent. This protects the privacy and academic integrity of all participants.',
  },
];

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
          HERO
      ============================================================ */}
      <section className="relative overflow-hidden bg-[#142B46] text-white">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] border-l border-white/10 lg:block">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute right-20 top-16 h-56 w-56 rounded-full border border-white/20" />
            <div className="absolute right-[-80px] top-[-80px] h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute bottom-[-120px] right-32 h-80 w-80 rounded-full border border-white/10" />
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-3xl">
              <p className="mb-6 text-sm font-medium tracking-wide text-[#B8D7E8]">
                ENGLISH HUB
              </p>

              <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                Build confidence.
                <br />
                Use English every day.
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-[#D7E2EC] sm:text-lg">
                A dedicated learning space for listening, speaking, writing,
                conversation, and practical daily English.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href="/dashboard/live-streaming"
                  className="group inline-flex items-center gap-3 border-b border-white pb-2 text-sm font-semibold text-white transition hover:border-[#B98A3E]"
                >
                  Start learning
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/dashboard/courses"
                  className="text-sm font-medium text-[#B8D7E8] transition hover:text-white"
                >
                  Browse courses
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="border-l border-white/15 pl-8">
                <p className="text-sm leading-6 text-[#AFC1D0]">
                  Progress comes from regular practice, active participation,
                  and using English in real situations.
                </p>

                <div className="mt-8 h-px w-full bg-white/10" />

                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="text-[#AFC1D0]">Learning focus</span>
                  <span className="font-semibold text-white">
                    Listening · Speaking · Writing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          LEARNING PATH
      ============================================================ */}
      <section className="border-b border-[#D9DDD7] bg-[#F4F5F1]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#55705B]">
                Your learning path
              </p>

              <h2 className="mt-3 max-w-sm text-3xl font-bold leading-tight text-[#172033]">
                Three ways to keep improving.
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#687268]">
                Choose the type of practice that fits what you need today.
                Keep moving between listening, individual practice, and
                conversation.
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
                    <div className="text-sm font-semibold text-[#9A9F97]">
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

                        <h3 className="text-xl font-bold text-[#172033]">
                          {track.title}
                        </h3>
                      </div>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#687268]">
                        {track.description}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#55705B]">
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
                <span className="text-xs font-bold uppercase tracking-[0.16em]">
                  Daily practice
                </span>
              </div>

              <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight text-[#172033] sm:text-4xl">
                Small practice.
                <br />
                Real progress.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-[#687268]">
                You do not need a long study session to improve. Give yourself
                a simple routine and return to it consistently.
              </p>

              <Link
                href="/dashboard/live-streaming"
                className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#55705B]"
              >
                Begin todays practice
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
                    <span className="font-mono text-xs font-semibold text-[#9A9F97]">
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
          MOMENTUM / COMMUNITY
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
          OFFICIAL POLICY
      ============================================================ */}
      <section className="bg-[#F4F5F1]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.48fr_1.52fr]">
            {/* Policy intro */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="flex items-center gap-3 text-[#A4462F]">
                <ShieldCheck className="h-5 w-5" />

                <span className="text-xs font-bold uppercase tracking-[0.16em]">
                  Official standard
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-bold leading-tight text-[#172033] sm:text-4xl">
                Code of Conduct
                <br />
                & Attendance
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-[#687268]">
                These requirements apply to every English Hub session. Read
                them carefully before attending.
              </p>

              <div className="mt-8 border-l-2 border-[#B98A3E] pl-5">
                <p className="text-sm font-semibold leading-6 text-[#172033]">
                  Attendance is earned through participation.
                </p>

                <p className="mt-2 text-sm leading-6 text-[#687268]">
                  Being present in the room alone does not guarantee that you
                  will be recorded as present.
                </p>
              </div>
            </div>

            {/* Policy content */}
            <div>
              <div className="border-t border-[#CDD3CB]">
                {policies.map((policy) => (
                  <article
                    key={policy.number}
                    className="grid gap-4 border-b border-[#CDD3CB] py-7 sm:grid-cols-[64px_1fr]"
                  >
                    <span className="font-mono text-sm font-semibold text-[#9A9F97]">
                      {policy.number}
                    </span>

                    <div>
                      <h3 className="text-lg font-bold text-[#172033]">
                        {policy.title}
                      </h3>

                      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#59655C]">
                        {policy.text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Attendance deadline */}
              <div className="mt-8 border border-[#D7C8AF] bg-[#F8F3E9] p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <Clock3 className="mt-1 h-5 w-5 shrink-0 text-[#8A5A20]" />

                  <div>
                    <h3 className="font-bold text-[#172033]">
                      Attendance registration deadline
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#687268]">
                      The official attendance sheet is circulated exactly
                      thirty minutes before the session begins, at{' '}
                      <strong className="text-[#172033]">1:30 PM</strong>.
                      Students must register during this window. Late
                      registration will not be accepted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Final reminder */}
              <div className="mt-8 border-t-4 border-[#142B46] bg-white p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <Trophy className="mt-1 h-5 w-5 shrink-0 text-[#B98A3E]" />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#55705B]">
                      Final reminder
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-[#172033]">
                      Respect the space. Participate. Come prepared.
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#687268]">
                      These rules are designed to create a focused, respectful,
                      and professional learning environment for everyone. Not
                      knowing these policies will not be accepted as an excuse.
                      By remaining in the English Hub, you agree to abide by
                      all regulations listed above.
                    </p>
                  </div>
                </div>
              </div>
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
