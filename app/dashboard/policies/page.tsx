'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  ArrowUp,
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  GraduationCap,
  Handshake,
  Landmark,
  MapPin,
  Scale,
  ShieldCheck,
  UserCheck,
  Users,
  Wifi,
} from 'lucide-react';

const policySections = [
  { id: 'purpose', number: 'I', title: 'SELFLESS CE Purpose and Mission' },
  { id: 'board', number: 'II', title: 'Board Members and Function' },
  { id: 'applicants', number: 'III', title: 'New Applicant Qualification Requirements' },
  { id: 'expenditures', number: 'IV', title: 'Technology Center Major Expenditures' },
  { id: 'stipend', number: 'V', title: 'Stipend Requirements' },
  { id: 'internship', number: 'VI', title: 'Internship and “English Hub” Program Requirement' },
  { id: 'probation', number: 'VII', title: 'Academic Probation Policy' },
  { id: 'dropped-classes', number: 'VIII', title: 'Disciplinary Action for Dropped Classes' },
  { id: 'insubordination', number: 'IX', title: 'Disciplinary Action for Insubordination, Trolling, or Cyberbullying' },
  { id: 'honor-code', number: 'X', title: 'Honor Code Violations' },
  { id: 'access', number: 'XI', title: 'Tech Center Access Policy' },
  { id: 'compensation', number: 'XII', title: 'SELFLESS CE Employee Compensation' },
  { id: 'employment', number: 'XIII', title: 'Employment Guidelines' },
  { id: 'expenses', number: 'XIV', title: 'Expense Reimbursement Policy for Full-time Employees' },
  { id: 'internet', number: 'XV', title: 'Internet and Security Policy' },
];

const centers = [
  {
    name: 'Jinja',
    size: '148 SQM',
    cost: '2,000,000 UGX per month',
    rate: '13,500/SQM',
    owner: 'Mohamed Omar Muhamed',
    address: 'Plot 09 Acacia Ave',
    phone: '+256 751 700759',
    email: 'twaha67@gmail.com',
  },
  {
    name: 'Masaka',
    size: '115 SQM',
    cost: '1,200,000 UGX per month',
    rate: '10,500/SQM',
    owner: 'Ernest M. Ntanda',
    phone: '+256 743 110721',
    email: 'ernestmntanda@gmail.com',
  },
  {
    name: 'Freedom City',
    size: '173 SQM',
    cost: '1,500,000 UGX per month',
    rate: '8,600/SQM',
    owner: 'Betty Kiguli',
    phone: '+256 758 411339',
  },
  {
    name: 'Ntinda',
    size: '43 SQM (1st Room: 21.8 x 12.5, 2nd Room: 15 x 12.5)',
    cost: '1,400,000 UGX per month',
    rate: '32,500/SQM',
    owner: 'Kimbowa Stanley',
    phone: '+256 782 829930',
  },
  {
    name: 'Sseta',
    size: '63 SQM',
    cost: '600,000 UGX per month',
    rate: '9,500/SQM',
    owner: 'Bonny Walker Lubowa',
    phone: '+256 789225437',
  },
  {
    name: 'Lira',
    size: '30 SQM (5.5x5.5sqm)',
    cost: '500,000 UGX per month',
    rate: '16,500/SQM',
    owner: '3rd Party — Charles Ojede',
    phone: '+256772794258',
  },
];

const foodAllocations = [
  ['Sseta', '1,600,000 UGX'],
  ['Jinja', '3,200,000 UGX'],
  ['Masaka', '1,100,000 UGX'],
  ['Freedom', '2,000,000 UGX'],
  ['Ntinda', '2,700,000 UGX'],
  ['Lira', '800,000 UGX'],
];

const compensation = [
  ['Directors Full-time', '1M a month'],
  ['Director Part-time', '5-10K an hour'],
  ['Manager Full-time', '700K a month'],
  ['Manager Part-time', '3-5K an hour'],
  ['Directors Students', '400K a month plus stipend'],
  ['Office Managers', '200K a month plus stipend'],
  ['Tutors', '200K a month plus stipend'],
  ['Administrative Staff', '200K a month plus stipend'],
];

const employmentLength = [
  ['Directors Full-time', 'Maximum 3 years after graduation'],
  ['Director Part-time', 'Maximum 3 years after graduation'],
  ['Manager Full-time', '3 years maximum employment.'],
  ['Manager Part-time', '3 years maximum employment'],
  ['Directors (Full-time student)', 'Until Graduation'],
  ['Office Managers (Full-time student)', '2 Years Maximum'],
  ['Administrative Staff (Full-time student)', '2 Years Maximum'],
  ['Tutors (Full-time student)', '4 blocks Maximum'],
];

const bonusBenefits = [
  [
    'Directors Full-time',
    '5,000,000 UGX bonus after 24 months but before 36 months after graduation, otherwise, 2,000,000 UGX',
  ],
  [
    'Director Part-time',
    '3,000,000 UGX bonus after 24 months but before 36 months after graduation, otherwise, 1,000,000 UGX',
  ],
  [
    'Manager Full-time',
    '3,000,000 UGX bonus after 24 months but before 24 months after graduation, otherwise, 1,000,000 UGX',
  ],
  [
    'Manager Part-time',
    '2,000,000 UGX bonus after 24 months but before 36 months, otherwise, 1,000,000 UGX',
  ],
];

function SectionHeader({
  number,
  title,
  id,
  icon: Icon,
}: {
  number: string;
  title: string;
  id: string;
  icon: React.ElementType;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 border-b border-[#DADCD3] pb-5 lg:scroll-mt-8"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B98A3E]/25 bg-[#B98A3E]/10 text-[#B98A3E] sm:h-11 sm:w-11">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B98A3E] sm:text-xs sm:tracking-[0.18em]">
            Section {number}
          </p>

          <h2 className="mt-1 break-words text-lg font-bold leading-tight tracking-tight text-[#12203B] sm:text-xl md:text-2xl">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}

function PolicySection({
  number,
  title,
  id,
  icon,
  nextSection,
  children,
}: {
  number: string;
  title: string;
  id: string;
  icon: React.ElementType;
  nextSection?: {
    id: string;
    number: string;
    title: string;
  };
  children: React.ReactNode;
}) {
  const handleNext = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!nextSection) return;

    if (window.matchMedia('(max-width: 1023px)').matches) return;

    event.preventDefault();
    scrollToPolicySection(nextSection.id);
  };

  return (
    <section className="scroll-mt-24 border-t border-[#DADCD3] py-8 first:border-t-0 sm:py-10 md:py-12 lg:scroll-mt-8">
      <SectionHeader
        number={number}
        title={title}
        id={id}
        icon={icon}
      />

      <div className="mt-6 sm:mt-7">{children}</div>

      {nextSection && (
        <div className="mt-8 flex justify-end border-t border-[#DADCD3] pt-5 sm:mt-10 sm:pt-6">
          <a
            href={`#${nextSection.id}`}
            onClick={handleNext}
            className="group flex w-full max-w-md items-center justify-end gap-3 text-right text-sm font-semibold text-[#55705B] transition-colors hover:text-[#B98A3E]"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-[#8A9088] sm:text-xs sm:tracking-[0.14em]">
                Next — Section {nextSection.number}
              </span>

              <span className="mt-0.5 block break-words text-[#12203B] group-hover:text-[#B98A3E]">
                {nextSection.title}
              </span>
            </span>

            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      )}
    </section>
  );
}

function NumberedItem({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F1EC] px-1 text-xs font-bold text-[#55705B]">
        {number}
      </span>

      <div className="min-w-0 flex-1 text-sm leading-7 text-[#4B564C]">
        {children}
      </div>
    </div>
  );
}

function LetterItem({
  letter,
  children,
}: {
  letter: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <span className="w-5 shrink-0 font-semibold text-[#12203B]">
        {letter}.
      </span>

      <div className="min-w-0 flex-1 text-sm leading-7 text-[#4B564C]">
        {children}
      </div>
    </div>
  );
}

function RomanItem({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <span className="w-7 shrink-0 text-sm font-semibold text-[#55705B]">
        {number}.
      </span>

      <div className="min-w-0 flex-1 text-sm leading-7 text-[#4B564C]">
        {children}
      </div>
    </div>
  );
}

function PolicyNote({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'warning' | 'positive';
}) {
  const styles = {
    neutral: 'border-[#DADCD3] bg-[#F7F6F2]',
    warning: 'border-[#A4462F]/25 bg-[#A4462F]/5',
    positive: 'border-[#55705B]/25 bg-[#55705B]/5',
  };

  return (
    <div
      className={`border-l-2 px-4 py-4 sm:px-5 ${styles[tone]}`}
    >
      <div className="break-words text-sm leading-7 text-[#4B564C]">
        {children}
      </div>
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#DADCD3]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead className="bg-[#F7F6F2]">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-[#DADCD3] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.11em] text-[#12203B] sm:px-5 sm:text-xs sm:tracking-[0.12em]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={`${row[0]}-${rowIndex}`}
                className="border-b border-[#DADCD3] last:border-b-0"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${cell}-${cellIndex}`}
                    className={`px-4 py-3.5 align-top leading-6 sm:px-5 sm:py-4 ${
                      cellIndex === 0
                        ? 'font-semibold text-[#12203B]'
                        : 'text-[#4B564C]'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function scrollToPolicySection(sectionId: string) {
  const section = document.getElementById(sectionId);

  if (!section) return;

  const targetTop =
    section.getBoundingClientRect().top + window.scrollY - 24;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: 'smooth',
  });

  window.history.replaceState(null, '', `#${sectionId}`);
}

export default function PoliciesPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeId, setActiveId] = useState<string>(
    policySections[0].id,
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 420);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionElements = policySections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top -
              b.boundingClientRect.top,
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
          return;
        }

        const above = entries
          .filter(
            (entry) => entry.boundingClientRect.top < 0,
          )
          .sort(
            (a, b) =>
              b.boundingClientRect.top -
              a.boundingClientRect.top,
          );

        if (above.length > 0) {
          setActiveId(above[0].target.id);
        }
      },
      {
        rootMargin: '-40px 0px -60% 0px',
        threshold: [0, 1],
      },
    );

    sectionElements.forEach((element) =>
      observer.observe(element),
    );

    return () => observer.disconnect();
  }, []);

  const handleSectionNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (window.matchMedia('(max-width: 1023px)').matches) return;

    event.preventDefault();
    scrollToPolicySection(sectionId);
  };

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    window.history.replaceState(
      null,
      '',
      window.location.pathname,
    );
  };

  const nextSectionMap = useMemo(() => {
    const map: Record<
      string,
      {
        id: string;
        number: string;
        title: string;
      }
    > = {};

    policySections.forEach((section, index) => {
      const next = policySections[index + 1];

      if (next) {
        map[section.id] = {
          id: next.id,
          number: next.number,
          title: next.title,
        };
      }
    });

    return map;
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden scroll-smooth bg-[#F1F1EC] text-[#12203B]">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-10">
        {/* ============================================================
            HERO / DOCUMENT HEADER
        ============================================================ */}
        <header className="overflow-hidden rounded-xl border border-[#DADCD3] bg-white shadow-sm sm:rounded-2xl">
          <div className="border-b border-[#DADCD3] px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <div className="min-w-0 max-w-4xl">
                <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#B98A3E] sm:mb-5 sm:text-xs sm:tracking-[0.18em]">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  Official handbook
                </div>

                <h1
                  className="break-words text-2xl font-bold leading-tight tracking-tight text-[#12203B] sm:text-3xl md:text-4xl lg:text-5xl"
                  style={{
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  SELFLESS CE Handbook Policies
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-[#4B564C] sm:mt-5 sm:text-base sm:leading-7 md:text-lg">
                  Policies and guidelines governing the SELFLESS CE
                  educational program, technology centers, student
                  support, employment, financial assistance, conduct,
                  and security.
                </p>
              </div>

              <div className="w-full border-l-2 border-[#B98A3E] pl-4 sm:pl-5 lg:w-auto lg:min-w-[170px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#8A9088] sm:text-xs sm:tracking-[0.14em]">
                  Handbook
                </p>

                <p className="mt-1 text-sm font-semibold text-[#12203B]">
                  15 policy sections
                </p>
              </div>
            </div>
          </div>

          <div className="grid divide-y border-[#DADCD3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5 md:px-6">
              <Landmark className="h-5 w-5 shrink-0 text-[#B98A3E]" />

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#8A9088] sm:text-xs">
                  Organization
                </p>

                <p className="mt-0.5 break-words text-sm font-semibold text-[#12203B]">
                  SELFLESS CE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5 md:px-6">
              <GraduationCap className="h-5 w-5 shrink-0 text-[#55705B]" />

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#8A9088] sm:text-xs">
                  Focus
                </p>

                <p className="mt-0.5 break-words text-sm font-semibold text-[#12203B]">
                  Education &amp; Self-Sufficiency
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5 md:px-6">
              <FileCheck2 className="h-5 w-5 shrink-0 text-[#55705B]" />

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#8A9088] sm:text-xs">
                  Document
                </p>

                <p className="mt-0.5 break-words text-sm font-semibold text-[#12203B]">
                  Handbook Policies
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================
            MOBILE TABLE OF CONTENTS
        ============================================================ */}
        <div className="mt-4 rounded-xl border border-[#DADCD3] bg-white p-4 shadow-sm lg:hidden sm:mt-6">
          <div className="flex items-center gap-3 border-b border-[#DADCD3] px-1 pb-3">
            <BookOpen className="h-5 w-5 text-[#B98A3E]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B98A3E]">
                Contents
              </p>
              <p className="mt-1 text-sm text-[#6B7268]">
                Tap a section to navigate
              </p>
            </div>
          </div>

          <nav className="mt-3 grid gap-1 sm:grid-cols-2" aria-label="Mobile policy sections">
            {policySections.map((section) => {
              const isActive = activeId === section.id;

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) =>
                    handleSectionNavigation(event, section.id)
                  }
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex min-w-0 items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[#F7F1E4] text-[#12203B]'
                      : 'text-[#4B564C] hover:bg-[#F7F6F2] hover:text-[#12203B]'
                  }`}
                >
                  <span className="w-6 shrink-0 font-bold text-[#B98A3E]">
                    {section.number}
                  </span>
                  <span className="min-w-0 flex-1 leading-5">
                    {section.title}
                  </span>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#8A9088]" />
                </a>
              );
            })}
          </nav>
        </div>

        {/* ============================================================
            DESKTOP TABLE OF CONTENTS
        ============================================================ */}
        <div className="mt-5 hidden rounded-2xl border border-[#DADCD3] bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:z-20 lg:block sm:mt-6 lg:mt-8">
          <div className="flex items-center justify-between gap-4 border-b border-[#DADCD3] px-2 pb-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B98A3E]">
                Contents
              </p>
              <p className="mt-1 text-sm text-[#6B7268]">
                Navigate the handbook
              </p>
            </div>
            <BookOpen className="h-5 w-5 text-[#B98A3E]" />
          </div>

          <nav className="mt-3 flex flex-wrap gap-2" aria-label="Policy sections">
            {policySections.map((section) => {
              const isActive = activeId === section.id;

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) =>
                    handleSectionNavigation(event, section.id)
                  }
                  aria-current={isActive ? 'true' : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-[#B98A3E]/40 bg-[#F7F1E4] text-[#12203B]'
                      : 'border-[#DADCD3] text-[#4B564C] hover:border-[#B98A3E]/40 hover:bg-[#F7F6F2] hover:text-[#12203B]'
                  }`}
                >
                  <span className="font-bold text-[#B98A3E]">{section.number}</span>
                  <span>{section.title}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* ============================================================
            HANDBOOK CONTENT
        ============================================================ */}
        <div className="mt-5 min-w-0 sm:mt-6 lg:mt-8">
          <article className="min-w-0 overflow-hidden rounded-xl border border-[#DADCD3] bg-white px-4 shadow-sm sm:rounded-2xl sm:px-6 md:px-8 lg:px-10">
            {/* ========================================================
                I. PURPOSE
            ======================================================== */}
            <PolicySection
              id="purpose"
              number="I"
              title="SELFLESS CE Purpose and Mission"
              icon={GraduationCap}
              nextSection={nextSectionMap['purpose']}
            >
              <PolicyNote tone="positive">
                The mission of SELFLESS CE is to Support Efforts to
                Lead Families and Individuals toward Lifelong Education
                and Self-Sufficiency (SELFLESS).
              </PolicyNote>

              <p className="mt-5 text-sm leading-7 text-[#4B564C] sm:mt-6">
                We aim to foster a safe and supportive learning
                environment where young adults can access educational
                opportunities that empower them to achieve
                self-sufficiency. By doing so, we strive to inspire
                these individuals to support their families and
                contribute to uplifting others in their communities.
              </p>
            </PolicySection>

            {/* ========================================================
                II. BOARD
            ======================================================== */}
            <PolicySection
              id="board"
              number="II"
              title="Board Members and Function"
              icon={Users}
              nextSection={nextSectionMap['board']}
            >
              <PolicyNote>
                <strong className="font-semibold text-[#12203B]">
                  As of 12/09/2025
                </strong>
              </PolicyNote>

              <p className="mt-5 text-sm leading-7 text-[#4B564C] sm:mt-6">
                The SELFLESS CE board member plays a critical role in
                upholding the organization&apos;s integrity and ensuring
                that the perspectives of both students and leaders are
                valued. This is a voluntary position appointed by the
                SELFLESS Board, and as such, it is not compensated for
                their role as a board member.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#4B564C]">
                Each SELFLESS CE board member holds one vote in all
                organizational decisions. In the event of a tie, the
                board advisors will cast the deciding vote. Initiatives
                approved by the SELFLESS CE Board will be submitted to
                the SELFLESS Board for final approval.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3 md:gap-6">
                <div className="border border-[#DADCD3] bg-[#F7F6F2] p-4 sm:p-5">
                  <h3 className="font-semibold leading-6 text-[#12203B]">
                    1. Current SELFLESS CE board members
                  </h3>

                  <div className="mt-4 space-y-2">
                    <LetterItem letter="a">
                      Rachael Namuge – Board Member
                    </LetterItem>
                    <LetterItem letter="b">
                      Douglas W. Kasozi – Secretary
                    </LetterItem>
                    <LetterItem letter="c">
                      Anigo Agnes Mary – Board Member
                    </LetterItem>
                    <LetterItem letter="d">
                      Atong Khur Aguto – Treasurer (Currently not an
                      official board member, but recognized as a
                      decision maker by the SELFLESS Board)
                    </LetterItem>
                  </div>
                </div>

                <div className="border border-[#DADCD3] bg-[#F7F6F2] p-4 sm:p-5">
                  <h3 className="font-semibold leading-6 text-[#12203B]">
                    2. Board Advisors
                  </h3>

                  <div className="mt-4 space-y-2">
                    <LetterItem letter="a">
                      Abraham Hwang
                    </LetterItem>
                    <LetterItem letter="b">
                      Jeanie Conrad
                    </LetterItem>
                  </div>
                </div>

                <div className="border border-[#DADCD3] bg-[#F7F6F2] p-4 sm:p-5">
                  <h3 className="font-semibold leading-6 text-[#12203B]">
                    3. SELFLESS Board Members
                  </h3>

                  <div className="mt-4 space-y-2">
                    <LetterItem letter="a">
                      Jan Hwang (President)
                    </LetterItem>
                    <LetterItem letter="b">
                      Audrey Hwang (Treasurer)
                    </LetterItem>
                    <LetterItem letter="c">
                      Leena Barnum (Secretary)
                    </LetterItem>
                  </div>
                </div>
              </div>
            </PolicySection>

            {/* ========================================================
                III. APPLICANTS
            ======================================================== */}
            <PolicySection
              id="applicants"
              number="III"
              title="New Applicant Qualification Requirements"
              icon={UserCheck}
              nextSection={nextSectionMap['applicants']}
            >
              <p className="text-sm leading-7 text-[#4B564C]">
                All new applicants must complete an application and
                receive approval from the SELFLESS CE Board. All
                applications must be prepared and submitted to the
                Board at least 30 days before the start of the following
                block. Before the board review, office managers
                thoroughly evaluate each applicant’s qualifications to
                ensure eligibility.
              </p>

              <div className="mt-7 space-y-7">
                <NumberedItem number="1">
                  <p>
                    Applicants must be members of The Church of Jesus
                    Christ of Latter-day Saints for a minimum of 12
                    months. If not, applicants must meet the following
                    conditions:
                  </p>

                  <div className="mt-3 space-y-2 pl-1">
                    <LetterItem letter="a">
                      They must be good friends (friends for over 1 year)
                      of a current student in good standing, both
                      ethically and academically.
                    </LetterItem>
                    <LetterItem letter="b">
                      They must have been taught all missionary
                      discussions.
                    </LetterItem>
                    <LetterItem letter="c">
                      They must have received an ecclesiastical
                      endorsement from their local leaders.
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  Applicants must be under 30 or have turned 30 in the
                  year of joining.
                </NumberedItem>

                <NumberedItem number="3">
                  <p>
                    Applicants must be single and have no children upon
                    entering the program. If married or with children,
                    additional conditions apply:
                  </p>

                  <div className="mt-3 space-y-2 pl-1">
                    <LetterItem letter="a">
                      Space must be available after all qualified
                      students are considered.
                    </LetterItem>
                    <LetterItem letter="b">
                      They must apply a minimum of 60 days before their
                      start date
                    </LetterItem>
                    <LetterItem letter="c">
                      Their application needs to be reviewed by the US
                      SELFLESS Board
                    </LetterItem>
                    <LetterItem letter="d">
                      They only qualify for transportation
                      reimbursement
                    </LetterItem>
                  </div>
                </NumberedItem>
              </div>
            </PolicySection>

            {/* ========================================================
                IV. EXPENDITURES
            ======================================================== */}
            <PolicySection
              id="expenditures"
              number="IV"
              title="Technology Center Major Expenditures"
              icon={Building2}
              nextSection={nextSectionMap['expenditures']}
            >
              <h3 className="text-lg font-bold text-[#12203B]">
                1. Rent
              </h3>

              <div className="mt-5">
                <DataTable
                  headers={[
                    'Technology Center',
                    'Size',
                    'Monthly Cost',
                    'Rate',
                  ]}
                  rows={centers.map((center) => [
                    center.name,
                    center.size,
                    center.cost,
                    center.rate,
                  ])}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {centers.map((center) => (
                  <div
                    key={center.name}
                    className="min-w-0 border border-[#DADCD3] bg-[#F7F6F2] p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#B98A3E]" />

                      <h4 className="font-semibold text-[#12203B]">
                        {center.name}
                      </h4>
                    </div>

                    <div className="mt-4 space-y-1.5 break-words text-sm leading-6 text-[#4B564C]">
                      <p>
                        <span className="font-semibold text-[#12203B]">
                          Owner:
                        </span>{' '}
                        {center.owner}
                      </p>

                      {center.address && (
                        <p>
                          <span className="font-semibold text-[#12203B]">
                            Address:
                          </span>{' '}
                          {center.address}
                        </p>
                      )}

                      <p>
                        <span className="font-semibold text-[#12203B]">
                          Tel.:
                        </span>{' '}
                        {center.phone}
                      </p>

                      {center.email && (
                        <p>
                          <span className="font-semibold text-[#12203B]">
                            Email:
                          </span>{' '}
                          <span className="break-all">
                            {center.email}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <h3 className="text-lg font-bold text-[#12203B]">
                  2. Food and Snack allocation per whole month
                </h3>

                <p className="mt-2 text-sm leading-7 text-[#6B7268]">
                  As of 11/01/25, which is subject to change based on
                  the number of students attending the tech center.
                </p>

                <div className="mt-5">
                  <DataTable
                    headers={[
                      'Technology Center',
                      'Monthly Allocation',
                    ]}
                    rows={foodAllocations}
                  />
                </div>
              </div>
            </PolicySection>

            {/* ========================================================
                V. STIPEND
            ======================================================== */}
            <PolicySection
              id="stipend"
              number="V"
              title="Stipend Requirements"
              icon={CircleDollarSign}
              nextSection={nextSectionMap['stipend']}
            >
              <div className="space-y-7">
                <NumberedItem number="1">
                  <p>
                    Full-time students at BYU-Idaho or Ensign College
                    (enrolled in six or more credits of core,
                    non-religion courses) who maintain a GPA of 3.0 or
                    higher:
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      Paid tuition
                    </LetterItem>
                    <LetterItem letter="b">
                      40K per week stipend
                    </LetterItem>
                    <LetterItem letter="c">
                      3 days a week, tech-center attendance required
                    </LetterItem>
                    <LetterItem letter="d">
                      10K is deducted from the 40K for every day below
                      three
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  Part-time students at BYU-Idaho, Ensign College, and
                  Pathway students (enrolled in five or fewer credits
                  of core, non-religion courses): Does not qualify for
                  any stipend
                </NumberedItem>

                <NumberedItem number="3">
                  Pathway Connect students at BYU-Idaho, Ensign College,
                  and Pathway students (enrolled in five or fewer
                  credits of core, non-religion courses): Does not
                  qualify for any stipend
                </NumberedItem>
              </div>
            </PolicySection>

            {/* ========================================================
                VI. INTERNSHIP
            ======================================================== */}
            <PolicySection
              id="internship"
              number="VI"
              title="Internship and “English Hub” Program Requirement"
              icon={Handshake}
              nextSection={nextSectionMap['internship']}
            >
              <div className="space-y-8">
                <NumberedItem number="1">
                  <p>
                    Full-time, Part-time, and Pathway Connect students –
                    It is required that every student either be enrolled
                    in the SELFLESS CE English Program or an internship
                    program. Internships include, but are not limited
                    to,
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      Tutorship
                    </LetterItem>
                    <LetterItem letter="b">
                      Tech center manager
                    </LetterItem>
                    <LetterItem letter="c">
                      Assistant tech center manager
                    </LetterItem>
                    <LetterItem letter="d">
                      An internal SELFLESS CE internship opportunity
                    </LetterItem>
                    <LetterItem letter="e">
                      An off-site internship that relates to the
                      student&apos;s major, if approved by the director
                    </LetterItem>
                    <LetterItem letter="f">
                      An off-site internship that enhances English
                      speaking and writing, if approved by the director
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  <p>
                    Full-time student (as defined above in V.1),
                    additional transportation reimbursement
                    qualification
                  </p>

                  <div className="mt-4 space-y-5 pl-1">
                    <div>
                      <p className="font-semibold text-[#12203B]">
                        a. Students with internships
                      </p>

                      <div className="mt-2 space-y-2 pl-4">
                        <RomanItem number="i">
                          30K maximum weekly transportation
                          reimbursement can be earned
                        </RomanItem>
                        <RomanItem number="ii">
                          They must meet all the internship-required
                          tasks and hours.
                        </RomanItem>
                        <RomanItem number="iii">
                          5K will be deducted from the 30K
                          transportation reimbursement for every hour
                          missed until the complete 30K has been
                          depleted. The hiring manager can approve
                          exceptions in advance.
                        </RomanItem>
                        <RomanItem number="iv">
                          The determination of these qualifications
                          will be made by the internship manager, with
                          feedback from the tech center managers as
                          needed.
                        </RomanItem>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#12203B]">
                        b. Students with no internships
                      </p>

                      <div className="mt-2 space-y-2 pl-4">
                        <RomanItem number="i">
                          50K maximum weekly transportation
                          reimbursement can be earned
                        </RomanItem>
                        <RomanItem number="ii">
                          10K in transportation reimbursement for each
                          day the student attends the 90-minute English
                          Course, up to 5 days a week.
                        </RomanItem>
                      </div>
                    </div>
                  </div>
                </NumberedItem>

                <NumberedItem number="3">
                  <p>
                    Part-time students and Pathway Connect Students (as
                    defined above in V.2 and V.3), additional
                    transportation reimbursement qualification
                  </p>

                  <div className="mt-3 space-y-2">
                    <RomanItem number="i">
                      Part-time students will receive 10K in
                      transportation reimbursement for each day they
                      attend the 90-minute English Course, up to 3 days
                      a week.
                    </RomanItem>
                    <RomanItem number="ii">
                      Pathway Connect students will receive 10K in
                      transportation reimbursement for each day they
                      attend the 90-minute English Course, up to 2 days
                      a week.
                    </RomanItem>
                  </div>
                </NumberedItem>
              </div>
            </PolicySection>

            {/* ========================================================
                VII. PROBATION
            ======================================================== */}
            <PolicySection
              id="probation"
              number="VII"
              title="Academic Probation Policy"
              icon={Scale}
              nextSection={nextSectionMap['probation']}
            >
              <div className="space-y-9">
                <NumberedItem number="1">
                  <p>
                    Full-time students at BYU-Idaho or Ensign College who
                    do not meet the 3.0 GPA or the minimum requirement
                    of six credits in core, non-religion courses but
                    maintain a GPA above 2.0:
                  </p>

                  <div className="mt-5 space-y-6">
                    <div>
                      <p className="font-semibold text-[#12203B]">
                        a. First-time Probation
                      </p>

                      <div className="mt-3 space-y-2 pl-4">
                        <RomanItem number="i">
                          No stipend will be provided, but qualified
                          transportation reimbursement is available.
                        </RomanItem>
                        <RomanItem number="ii">
                          Tuition will continue to be covered for one
                          additional block.
                        </RomanItem>
                        <RomanItem number="iii">
                          To regain eligibility for the 40K weekly
                          stipend, students must have enrolled in 6 core
                          credits and achieve a GPA exceeding 3.0.
                        </RomanItem>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#12203B]">
                        b. Second-time Suspension
                      </p>

                      <div className="mt-3 space-y-2 pl-4">
                        <RomanItem number="i">
                          No stipend or transportation reimbursement
                          will be provided.
                        </RomanItem>
                        <RomanItem number="ii">
                          Tuition will not be covered unless the
                          student achieves a GPA of 3.0 or higher while
                          enrolled in a maximum of six credits in the
                          following block.
                        </RomanItem>
                        <RomanItem number="iii">
                          To regain eligibility for the 40K weekly
                          stipend &amp; transportation reimbursement,
                          students must have enrolled in six core
                          credits and achieve a GPA exceeding 3.0.
                        </RomanItem>
                        <RomanItem number="iv">
                          Past tuition for the block will be reimbursed
                          if the student attains a GPA of 3.0 or higher
                          for that block.
                        </RomanItem>
                      </div>
                    </div>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  <p>
                    Full-time students at BYU-Idaho or Ensign College who
                    do not meet the 2.0 GPA or the minimum requirement
                    of six core, non-religion courses:
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      No stipend or transportation reimbursement will
                      be provided.
                    </LetterItem>
                    <LetterItem letter="b">
                      Tuition will not be covered unless the student
                      achieves a GPA of 3.0 or higher while enrolled in
                      a maximum of six credits in the following block.
                    </LetterItem>
                    <LetterItem letter="c">
                      To regain eligibility for the 40K weekly stipend
                      &amp; transportation reimbursement, students must
                      have enrolled in six core credits and achieve a
                      GPA exceeding 3.0.
                    </LetterItem>
                    <LetterItem letter="d">
                      Past tuition for the block will be reimbursed if
                      the student attains a GPA of 3.0 or higher for
                      that block.
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="3">
                  <p>
                    Part-time students at BYU-Idaho, Ensign College, and
                    Pathway students (enrolled in 5 or fewer credits of
                    core, non-religion courses) who do not meet the 3.0
                    GPA requirement but exceed a 2.0 GPA:
                  </p>

                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="font-semibold text-[#12203B]">
                        a. First-time Probation
                      </p>

                      <div className="mt-2 pl-4">
                        <RomanItem number="i">
                          The student will have one additional
                          opportunity to remain part-time, taking three
                          credits, with eligibility for a transportation
                          stipend.
                        </RomanItem>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#12203B]">
                        b. Second-time Suspension
                      </p>

                      <div className="mt-2 space-y-2 pl-4">
                        <RomanItem number="i">
                          No transportation reimbursement will be
                          provided.
                        </RomanItem>
                        <RomanItem number="ii">
                          Tuition will not be covered unless the student
                          achieves a GPA of 3.0 or higher while enrolled
                          in a maximum of three credits in the following
                          block.
                        </RomanItem>
                        <RomanItem number="iii">
                          To regain eligibility for transportation
                          reimbursement, students must have enrolled in
                          three core credits and achieve a GPA exceeding
                          3.0.
                        </RomanItem>
                        <RomanItem number="iv">
                          Past tuition for the block will be reimbursed
                          if the student attains a GPA of 3.0 or higher
                          for that block.
                        </RomanItem>
                      </div>
                    </div>
                  </div>
                </NumberedItem>

                <NumberedItem number="4">
                  <p>
                    Part-time students at BYU-Idaho, Ensign College, and
                    Pathway students (enrolled in 5 or fewer credits of
                    core, non-religion courses) who do not meet the 2.0
                    GPA requirement:
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      No transportation reimbursement will be provided.
                    </LetterItem>
                    <LetterItem letter="b">
                      Tuition will not be covered unless the student
                      achieves a GPA of 3.0 or higher while enrolled in
                      a maximum of three credits.
                    </LetterItem>
                    <LetterItem letter="c">
                      To requalify for a 30K stipend, the student must
                      complete three credit hours and exceed a GPA of
                      3.0.
                    </LetterItem>
                    <LetterItem letter="d">
                      Past tuition for three credits will be reimbursed
                      if the student achieves a GPA of 3.0 or higher.
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="5">
                  <p>
                    Tutors who do not meet the 3.5 GPA requirement but
                    maintain a GPA exceeding 2.5:
                  </p>

                  <div className="mt-3">
                    <LetterItem letter="a">
                      They will no longer serve as tutors but transition
                      to regular student status, becoming eligible for a
                      40K weekly stipend for the following block.
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="6">
                  <p>
                    Tutors who do not meet the 2.5 GPA requirement:
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      They will no longer serve as tutors but transition
                      to regular student status, becoming eligible for
                      weekly transportation reimbursement for the
                      following block.
                    </LetterItem>
                    <LetterItem letter="b">
                      Tuition will be covered for one additional block.
                    </LetterItem>
                    <LetterItem letter="c">
                      To requalify for a 40K stipend, they must enroll
                      in six core credits and exceed a GPA of 3.0.
                    </LetterItem>
                  </div>
                </NumberedItem>
              </div>
            </PolicySection>

            {/* ========================================================
                VIII. DROPPED CLASSES
            ======================================================== */}
            <PolicySection
              id="dropped-classes"
              number="VIII"
              title="Disciplinary Action for Dropped Classes"
              icon={AlertTriangle}
              nextSection={nextSectionMap['dropped-classes']}
            >
              <div className="space-y-9">
                <NumberedItem number="1">
                  <p>
                    Eligibility and Conditions for BYU-Idaho and Ensign
                    College Full-Time Students (Defined as students
                    enrolled in six or more credits of core
                    non-religion courses with a GPA of 3.0 or higher)
                  </p>

                  <div className="mt-5 space-y-6">
                    <div>
                      <p className="font-semibold text-[#12203B]">
                        a. Dropping Classes Before the Tuition Deadline:
                      </p>

                      <div className="mt-3 space-y-2 pl-4">
                        <RomanItem number="i">
                          If the student remains enrolled in 6 or more
                          credits, no action is required.
                        </RomanItem>
                        <RomanItem number="ii">
                          If a student drops below six credits, he will
                          only qualify for transportation reimbursement.
                          Any stipends received for the block must be
                          recovered through future transportation
                          reimbursements.
                        </RomanItem>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#12203B]">
                        b. Dropping Classes After the Tuition Deadline:
                      </p>

                      <div className="mt-3 space-y-2 pl-4">
                        <RomanItem number="i">
                          If the student remains enrolled in six or more
                          credits, only the forfeited tuition cost will
                          be recovered. Stipends will be withheld until
                          the forfeited tuition amount has been fully
                          repaid.
                        </RomanItem>
                        <RomanItem number="ii">
                          If a student drops below six credits, he will
                          only be eligible for transportation
                          reimbursement. The student must repay any
                          forfeited tuition, and future transportation
                          reimbursements will be withheld until the
                          outstanding balance is paid in full.
                        </RomanItem>
                      </div>
                    </div>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  <p>BYUI Part-time and Pathway Students</p>

                  <div className="mt-5 space-y-6">
                    <div>
                      <p className="font-semibold text-[#12203B]">
                        a. Dropping Classes Before the Tuition Deadline
                      </p>

                      <div className="mt-3 space-y-2 pl-4">
                        <RomanItem number="i">
                          No action is required if the student remains
                          enrolled in three or more credits.
                        </RomanItem>
                        <RomanItem number="ii">
                          If the student drops below three credits, (1)
                          they will no longer qualify for
                          transportation reimbursements, and (2) any
                          transportation reimbursements already
                          received for the block must be recovered
                          through future transportation reimbursements
                          or stipends in a subsequent block.
                        </RomanItem>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#12203B]">
                        b. Dropping Classes After the Tuition Deadline
                      </p>

                      <div className="mt-3 space-y-2 pl-4">
                        <RomanItem number="i">
                          If the student remains enrolled in 3 or more
                          credits, only the forfeited tuition cost will
                          be recovered. Transportation reimbursements
                          will be withheld until the forfeited tuition
                          amount has been fully repaid.
                        </RomanItem>
                        <RomanItem number="ii">
                          Students who drop below three credits will no
                          longer be eligible for transportation
                          reimbursements. The student must repay any
                          transportation reimbursements already
                          received for the block, as well as the
                          forfeited tuition.
                        </RomanItem>
                      </div>
                    </div>
                  </div>
                </NumberedItem>
              </div>
            </PolicySection>

            {/* ========================================================
                IX. INSUBORDINATION
            ======================================================== */}
            <PolicySection
              id="insubordination"
              number="IX"
              title="Disciplinary Action for Insubordination, Trolling, or Cyberbullying"
              icon={ShieldCheck}
              nextSection={nextSectionMap['insubordination']}
            >
              <PolicyNote tone="warning">
                All violations will be categorized as serious and will
                result in one of three outcomes, depending on the action
                and the student’s remorse. Suspension results in no
                stipend, transportation, or tuition payments.
              </PolicyNote>

              <div className="mt-7 space-y-7">
                <NumberedItem number="1">
                  <p>
                    Suspension for the remainder of the current block.
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      If the student commits one offense
                    </LetterItem>
                    <LetterItem letter="b">
                      If the student accepts the decision made by the
                      tech center manager or assistant manager.
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  <p>
                    Suspension for the remainder of the current block
                    and the next block.
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      If the student has two or more offenses
                    </LetterItem>
                    <LetterItem letter="b">
                      Or if the student commits one offense and wants to
                      challenge the decision of the center manager with
                      the Director of Student Affairs, and is
                      unsuccessful.
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="3">
                  <p>
                    Suspension immediately, and can reapply after the
                    following two blocks. There is no guarantee they
                    will be accepted when they reapply.
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      If the student has two or more offenses
                    </LetterItem>
                    <LetterItem letter="b">
                      Or if the student commits one offense or two
                      offenses and wants to challenge the decision of
                      the center manager with the SELFLESS CE or
                      SELFLESS Board and is unsuccessful.
                    </LetterItem>
                  </div>
                </NumberedItem>
              </div>
            </PolicySection>

            {/* ========================================================
                X. HONOR CODE
            ======================================================== */}
            <PolicySection
              id="honor-code"
              number="X"
              title="Honor Code Violations"
              icon={Scale}
              nextSection={nextSectionMap['honor-code']}
            >
              <p className="text-sm leading-7 text-[#4B564C]">
                All violations will be categorized as serious or minor,
                with specific definitions outlined below. In cases of
                uncertainty, the SELFLESS CE Board will recommend to the
                SELFLESS Board, which will make the final
                determination.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-2 md:gap-6">
                <div className="border border-[#A4462F]/20 bg-[#A4462F]/5 p-5 sm:p-6">
                  <h3 className="font-bold text-[#12203B]">
                    1. Serious Violations
                  </h3>

                  <p className="mt-2 text-sm text-[#6B7268]">
                    Serious violations include, but are not limited
                    to:
                  </p>

                  <div className="mt-4 space-y-2">
                    <LetterItem letter="a">
                      Sexual harassment
                    </LetterItem>
                    <LetterItem letter="b">
                      Hate crimes
                    </LetterItem>
                    <LetterItem letter="c">
                      Theft of property exceeding $20
                    </LetterItem>
                    <LetterItem letter="d">
                      Property damage exceeding $100
                    </LetterItem>
                    <LetterItem letter="e">
                      Altercations resulting in medical injuries
                    </LetterItem>
                    <LetterItem letter="f">
                      Actions leading to incarceration by Ugandan
                      authorities
                    </LetterItem>
                  </div>
                </div>

                <div className="border border-[#DADCD3] bg-[#F7F6F2] p-5 sm:p-6">
                  <h3 className="font-bold text-[#12203B]">
                    2. Minor Violations
                  </h3>

                  <p className="mt-2 text-sm text-[#6B7268]">
                    Minor violations include all infractions not
                    classified as serious, such as:
                  </p>

                  <div className="mt-4 space-y-2">
                    <LetterItem letter="a">
                      Cheating
                    </LetterItem>
                    <LetterItem letter="b">
                      Lying
                    </LetterItem>
                    <LetterItem letter="c">
                      Use of foul language
                    </LetterItem>
                    <LetterItem letter="d">
                      Theft of property valued at less than $20
                    </LetterItem>
                    <LetterItem letter="e">
                      Property damage valued at less than $100
                    </LetterItem>
                    <LetterItem letter="f">
                      Misuse of SELFLESS CE property
                    </LetterItem>
                    <LetterItem letter="g">
                      Possession or use of pornography
                    </LetterItem>
                    <LetterItem letter="h">
                      Minor altercations
                    </LetterItem>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-[#12203B]">
                  Consequences of violations
                </h3>

                <div className="mt-5 space-y-3">
                  <PolicyNote tone="warning">
                    <strong className="font-semibold text-[#12203B]">
                      1. First Serious Violation (Lifetime)
                    </strong>{' '}
                    – Suspension from SELFLESS CE for the current block
                    and the following two blocks.
                  </PolicyNote>

                  <PolicyNote tone="warning">
                    <strong className="font-semibold text-[#12203B]">
                      2. Second Serious Violation (Lifetime)
                    </strong>{' '}
                    – Termination from SELFLESS CE for 2 years and
                    reapplication with required board approval before
                    reacceptance.
                  </PolicyNote>

                  <PolicyNote>
                    <strong className="font-semibold text-[#12203B]">
                      3. First Minor Violation (12 months)
                    </strong>{' '}
                    – Probation for 4 weeks, which is defined as the
                    loss of stipend or transportation reimbursement for
                    4 weeks.
                  </PolicyNote>

                  <PolicyNote>
                    <strong className="font-semibold text-[#12203B]">
                      4. Second Minor Violation (12 months)
                    </strong>{' '}
                    – Probation for 8 weeks, which is defined as the
                    loss of stipend or transportation reimbursement for
                    8 weeks.
                  </PolicyNote>

                  <PolicyNote>
                    <strong className="font-semibold text-[#12203B]">
                      5. Third Minor Violation (12 Months)
                    </strong>{' '}
                    – Probation for the remainder of the block and the
                    following two blocks.
                  </PolicyNote>
                </div>
              </div>
            </PolicySection>

            {/* ========================================================
                XI. ACCESS
            ======================================================== */}
            <PolicySection
              id="access"
              number="XI"
              title="Tech Center Access Policy"
              icon={Building2}
              nextSection={nextSectionMap['access']}
            >
              <div className="space-y-7">
                <NumberedItem number="1">
                  <p>
                    Full-time students (6 non-religion core block
                    credits or more)
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      First rights to the tech center and its computers
                    </LetterItem>
                    <LetterItem letter="b">
                      They can attend the tech center every day
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  <p>Part-Time Students</p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="font-semibold text-[#12203B]">
                        a. 3-5 Credit Students
                      </p>

                      <div className="mt-2 pl-4">
                        <RomanItem number="i">
                          You can attend the tech center for up to 3
                          days each week.
                        </RomanItem>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#12203B]">
                        b. Less than three credit hours
                      </p>

                      <div className="mt-2 pl-4">
                        <RomanItem number="i">
                          Can attend the tech center for up to 2 days
                          only each week.
                        </RomanItem>
                      </div>
                    </div>
                  </div>
                </NumberedItem>
              </div>

              <div className="mt-7">
                <PolicyNote tone="positive">
                  If there are free computers, students may use them
                  only for schoolwork. However, they must plan their
                  weeks out and reserve specific time to use the
                  computer.
                </PolicyNote>
              </div>
            </PolicySection>

            {/* ========================================================
                XII. COMPENSATION
            ======================================================== */}
            <PolicySection
              id="compensation"
              number="XII"
              title="SELFLESS CE Employee Compensation"
              icon={CircleDollarSign}
              nextSection={nextSectionMap['compensation']}
            >
              <DataTable
                headers={['Position', 'Compensation']}
                rows={compensation}
              />
            </PolicySection>

            {/* ========================================================
                XIII. EMPLOYMENT
            ======================================================== */}
            <PolicySection
              id="employment"
              number="XIII"
              title="Employment Guidelines"
              icon={Clock3}
              nextSection={nextSectionMap['employment']}
            >
              <h3 className="text-lg font-bold text-[#12203B]">
                1. Length of Employment
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#4B564C]">
                The following guidelines outline the length of
                employment at SELFLESS CE. The primary purpose of
                employment is to provide valuable experience for
                students or recent graduates to pursue better
                employment opportunities outside of SELFLESS CE.
              </p>

              <p className="mt-4 text-sm leading-7 text-[#4B564C]">
                Employees may be terminated before their designated time
                limit if their performance is unsatisfactory or if they
                engage in immoral conduct that violates the BYU-Idaho
                Honor Code. Such decisions are at the discretion of the
                SELFLESS CE or SELFLESS Board.
              </p>

              <div className="mt-5">
                <DataTable
                  headers={[
                    'Position',
                    'Employment Length',
                  ]}
                  rows={employmentLength}
                />
              </div>

              <div className="mt-9">
                <h3 className="text-lg font-bold text-[#12203B]">
                  2. Bonus Benefits
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#4B564C]">
                  Employees must provide proof of securing alternative
                  employment, demonstrate that they have fulfilled their
                  duties, and effectively train their replacements to
                  qualify for bonuses. Employees may be terminated
                  before receiving their bonuses if their performance is
                  unsatisfactory or if they engage in immoral conduct
                  that violates the BYU-Idaho Honor Code. Such decisions
                  are at the discretion of the SELFLESS CE or SELFLESS
                  Board.
                </p>

                <div className="mt-5">
                  <DataTable
                    headers={[
                      'Position',
                      'Bonus Benefit',
                    ]}
                    rows={bonusBenefits}
                  />
                </div>
              </div>
            </PolicySection>

            {/* ========================================================
                XIV. EXPENSE REIMBURSEMENT
            ======================================================== */}
            <PolicySection
              id="expenses"
              number="XIV"
              title="Expense Reimbursement Policy for Full-time Employees"
              icon={CircleDollarSign}
              nextSection={nextSectionMap['expenses']}
            >
              <div className="space-y-7">
                <NumberedItem number="1">
                  <p>
                    One meal of a maximum of 5,000 UGX reimbursement is
                    allowed if
                  </p>

                  <div className="mt-3 space-y-2">
                    <LetterItem letter="a">
                      You must stay overnight at a tech facility
                    </LetterItem>
                    <LetterItem letter="b">
                      Need to travel to a tech center other than their
                      home tech center
                    </LetterItem>
                  </div>
                </NumberedItem>

                <NumberedItem number="2">
                  You will be compensated for travel time beyond the
                  first hour if paid hourly and must travel to a tech
                  center other than your home center. For example, if it
                  takes 3 hours to travel to a tech center other than
                  your home center, you will be compensated for 2 hours
                  each way.
                </NumberedItem>

                <NumberedItem number="3">
                  Transportation needs to be recorded daily based on
                  reasonable travel costs.
                </NumberedItem>

                <NumberedItem number="4">
                  A receipt for all expenses must be submitted to the
                  finance department, even if handwritten. The receipt
                  should include the date, the total travel amount, and
                  your signature if handwritten.
                </NumberedItem>
              </div>
            </PolicySection>

            {/* ========================================================
                XV. INTERNET AND SECURITY
            ======================================================== */}
            <PolicySection
              id="internet"
              number="XV"
              title="Internet and Security Policy"
              icon={Wifi}
            >
              <PolicyNote tone="warning">
                To prevent further property loss and inappropriate
                Internet use, please be aware that Internet access is
                expensive and limited to those who require it for
                academic purposes. Pornography is strictly prohibited,
                and social media may only be used for school-related
                activities.
              </PolicyNote>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-[#12203B]">
                  1. Internet Rules
                </h3>

                <div className="mt-5 space-y-4">
                  <LetterItem letter="a">
                    The internet password at each location must be
                    changed at least once a month.
                  </LetterItem>

                  <LetterItem letter="b">
                    The only persons who should know the password are
                    Steven and the office managers at each location.
                  </LetterItem>

                  <LetterItem letter="c">
                    If students need internet access, they have to ask
                    an office manager to give them access by entering
                    the password into their phone. However, before they
                    leave, the student will need to have the office
                    manager remove access by selecting “forget device”
                    on their phone so they no longer have access.
                  </LetterItem>

                  <LetterItem letter="d">
                    A tutor should be available at all times and needs
                    to walk around the office at least once every 10
                    minutes to monitor what everyone is doing on their
                    computers and phones.
                  </LetterItem>
                </div>
              </div>

              <div className="mt-9">
                <h3 className="text-lg font-bold text-[#12203B]">
                  2. Security
                </h3>

                <div className="mt-5 space-y-4">
                  <LetterItem letter="a">
                    There must always be at least one male or two female
                    tutors or office managers. So please schedule tutor
                    time appropriately. They don’t have to be working,
                    but they need to be there at least studying.
                  </LetterItem>

                  <LetterItem letter="b">
                    Every student entering the tech center has to check
                    in and check out with one of the office managers.
                    You have to do this anyway since we are paying
                    stipends and transportation.
                  </LetterItem>
                </div>
              </div>

              <div className="mt-9">
                <h3 className="text-lg font-bold text-[#12203B]">
                  3. SELFLESS CE Equipment Usage
                </h3>

                <div className="mt-5 space-y-4">
                  <LetterItem letter="a">
                    Students must check in and check out all equipment.
                    Office managers are responsible for recording this.
                  </LetterItem>

                  <LetterItem letter="b">
                    If any equipment goes missing or is stolen, unless
                    the student is identified, all students&apos;
                    stipends and transportation reimbursements will be
                    reduced by half until the equipment is paid for in
                    full. Those funds will be used to repurchase the
                    stolen equipment.
                  </LetterItem>
                </div>
              </div>
            </PolicySection>

            {/* ========================================================
                DOCUMENT END
            ======================================================== */}
            <div className="border-t border-[#DADCD3] py-8 sm:py-10">
              <div className="flex flex-col gap-5 border-l-2 border-[#B98A3E] bg-[#F7F6F2] px-4 py-5 sm:px-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B98A3E] sm:text-xs sm:tracking-[0.16em]">
                    SELFLESS CE Handbook
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#12203B]">
                    End of policy document
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7268]">
                    Please review the applicable policies carefully and
                    consult the appropriate SELFLESS CE leadership when
                    clarification is required.
                  </p>
                </div>

                <a
                  href="#purpose"
                  onClick={(event) =>
                    handleSectionNavigation(
                      event,
                      'purpose',
                    )
                  }
                  className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold text-[#55705B] transition-colors hover:text-[#B98A3E]"
                >
                  Back to beginning
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* ============================================================
          BACK TO TOP
      ============================================================ */}
      {showBackToTop && (
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#DADCD3] bg-white text-[#55705B] shadow-[0_6px_18px_rgba(18,32,59,0.14)] transition-all hover:border-[#B98A3E] hover:bg-[#F7F1E4] hover:text-[#B98A3E] focus:outline-none focus:ring-2 focus:ring-[#B98A3E]/30 sm:bottom-5 sm:left-6 sm:h-11 sm:w-11"
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}
    </main>
  );
}
