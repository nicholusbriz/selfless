
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import AcademicFeatures from "@/app/components/AcademicFeatures";
import CommunityFeatures from "@/app/components/CommunityFeatures";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const portalAreas = [
  {
    icon: BarChart3,
    number: "01",
    title: "Your dashboard",
    description:
      "See the information and actions that matter most to you in one focused workspace.",
  },
  {
    icon: BookOpen,
    number: "02",
    title: "Academic progress",
    description:
      "Keep courses, credits, grades, GPA progress, and tutor feedback organized.",
  },
  {
    icon: MessageSquare,
    number: "03",
    title: "Communication",
    description:
      "Stay informed through announcements, messages, notifications, policies, and support.",
  },
  {
    icon: Users,
    number: "04",
    title: "Student community",
    description:
      "Stay connected to your tech center and the wider SELFLESS CE student community.",
  },
  {
    icon: Briefcase,
    number: "05",
    title: "Opportunities",
    description:
      "Discover internships, activities, learning programs, and opportunities to grow.",
  },
  {
    icon: Sparkles,
    number: "06",
    title: "Atbriz AI",
    description:
      "Get guided assistance for navigating the portal and finding useful information.",
  },
];

const roles = [
  "Students follow their academic journey and access support.",
  "Tutors and teachers guide learners and manage learning responsibilities.",
  "Administrators coordinate people, centers, communication, and operations.",
];

export default function FeaturesPage() {
  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="SELFLESS CE Portal"
        title="Everything around your student journey, connected."
        description="A single portal for learning, communication, community, opportunities, and student support."
        backgroundImage="/features.jpg"
        actionHref="/help"
        actionLabel="Need help?"
      />

      {/* INTRO */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-[#B98A3E]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  One connected portal
                </p>
              </div>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[3.1rem]">
                Built around the way students actually learn.
              </h2>

              <p className="mt-6 max-w-lg text-[15px] leading-7 text-[#5F685F]">
                SELFLESS CE brings the important parts of student life into
                one organized experience. Instead of moving between separate
                systems, students and teams can work from the same portal.
              </p>

              <Link
                href="/about"
                className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors hover:text-[#B98A3E]"
              >
                Learn about SELFLESS CE
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="border-y border-[#DADCD3]">
              {[
                {
                  title: "Academic",
                  text: "Courses, grades, credits, progress and tutoring.",
                },
                {
                  title: "Community",
                  text: "People, activities, support groups and shared experiences.",
                },
                {
                  title: "Support",
                  text: "Communication, notifications, policies and student services.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`flex gap-5 py-6 sm:gap-8 ${
                    index !== 0 ? "border-t border-[#DADCD3]" : ""
                  }`}
                >
                  <span className="pt-1 text-xs font-semibold tracking-[0.14em] text-[#B98A3E]">
                    0{index + 1}
                  </span>

                  <div>
                    <h3 className="text-lg font-semibold text-[#12203B]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-[#697169]">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section className="relative isolate overflow-hidden bg-[#0D1117] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/features.jpg')" }}
        />
        <div className="pointer-events-none absolute inset-0 -z-[5] bg-[#071018]/80" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 border-b border-[#DADCD3] pb-8 lg:flex-row lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-[#B98A3E]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  Core features
                </p>
              </div>

              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                The portal at a glance.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-white/70 lg:text-right">
              Each part of the portal has a clear purpose, while everything
              remains connected through one student experience.
            </p>
          </div>

          <div className="mt-10 divide-y divide-white/20 border-y border-white/20">
            {portalAreas.map(
              ({ icon: Icon, number, title, description }) => (
                <article
                  key={title}
                  className="group grid gap-5 py-7 transition-colors duration-300 hover:bg-white/[0.08] sm:grid-cols-[80px_1fr_auto] sm:items-start sm:gap-8 sm:py-8"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="text-[11px] font-semibold tracking-[0.15em] text-[#E8A33D]">
                      {number}
                    </span>
                    <Icon size={19} strokeWidth={1.8} className="text-white/75 sm:mt-5" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.015em] text-white sm:text-2xl">
                      {title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                      {description}
                    </p>
                  </div>

                  <span className="hidden pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/40 transition-colors group-hover:text-[#E8A33D] sm:block">
                    Explore
                  </span>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ACADEMIC */}
      <AcademicFeatures />

      {/* COMMUNITY */}
      <CommunityFeatures />

      {/* ROLES */}
      <section className="bg-[#F7F6F2] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-[#B98A3E]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                  Designed for the network
                </p>
              </div>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-[#12203B] sm:text-4xl">
                The experience changes with your responsibility.
              </h2>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#626B62]">
                SELFLESS CE is not a one-size-fits-all system. The portal
                gives each role the tools and information needed to contribute
                effectively.
              </p>
            </div>

            <div className="border-y border-[#DADCD3]">
              {roles.map((role, index) => (
                <div
                  key={role}
                  className={`flex gap-4 py-5 ${
                    index !== 0 ? "border-t border-[#DADCD3]" : ""
                  }`}
                >
                  <CheckCircle2
                    size={19}
                    strokeWidth={1.8}
                    className="mt-0.5 shrink-0 text-[#55705B]"
                  />

                  <p className="text-sm leading-6 text-[#4F594F]">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY / OPERATIONS */}
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="border border-[#DADCD3] bg-[#12203B] px-6 py-8 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#E8A33D]"
                  />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                    One organized system
                  </p>
                </div>

                <h2 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl">
                  Clear access. Clear responsibilities. One connected
                  experience.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#C5CBD1]">
                  Role-based access helps keep information relevant while
                  supporting the different responsibilities of students,
                  tutors, teachers, and administrators.
                </p>

                <div className="mt-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#E8A33D]">
                  <BellRing size={15} strokeWidth={1.8} />
                  Connected across the SELFLESS CE network
                </div>
              </div>

              <Link
                href="/tech-centers"
                className="group inline-flex w-fit items-center gap-2 border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#E8A33D] hover:text-[#E8A33D]"
              >
                Explore tech centers
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
            Start with the portal
          </p>

          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-5xl">
            A simpler way to stay connected to your education.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-[#626B62]">
            Explore what SELFLESS CE offers and see how the portal brings your
            academic and student experience together.
          </p>

          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 bg-[#12203B] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#55705B]"
          >
            Discover SELFLESS CE
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}

