'use client';
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Users,
  Workflow,
} from "lucide-react";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const principles = [
  {
    icon: GraduationCap,
    title: "Student-first",
    description:
      "A focused digital home for managing learning, progress, and the everyday work of student life.",
  },
  {
    icon: Users,
    title: "Connected communities",
    description:
      "Students, tutors, teachers, and administrators can stay aligned across every Selfless CE tech center.",
  },
  {
    icon: Workflow,
    title: "One clear system",
    description:
      "Academic tools, communication, activities, and support live together instead of being scattered across platforms.",
  },
];

const portalAreas = [
  {
    icon: BookOpen,
    title: "Stay on top of academics",
    description:
      "Follow courses, credits, grades, GPA progress, tutor feedback, and the next step in your academic journey.",
  },
  {
    icon: MessageCircle,
    title: "Keep communication close",
    description:
      "Find announcements, messages, notifications, policies, and support groups without searching through disconnected channels.",
  },
  {
    icon: BarChart3,
    title: "See the bigger picture",
    description:
      "Your dashboard brings together your student profile, tech-center connection, opportunities, and progress in one view.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="About Selfless CE"
        title="A student portal built around the whole journey."
        description="Selfless CE Portal gives students one dependable place to manage academic progress, stay connected to their tech center, and find the people and opportunities that help them move forward."
        backgroundVideo="/about video.mp4"
        backgroundPoster="/student-portal-image.png"
        actionHref="/tech-centers"
        actionLabel="View tech centers"
      />

      {/* =====================================================
          PURPOSE
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          {/* Image */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[#DADCD3] bg-white shadow-[0_12px_35px_rgba(18,32,59,0.06)]">
            <div className="relative aspect-[4/3]">
              <Image
                src="/student-portal-image.png"
                alt="Student using the Selfless CE portal"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
              />
            </div>

            <div className="absolute bottom-5 left-5 border-l-2 border-[#B98A3E] bg-white/90 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B98A3E]">
                One connected place
              </p>

              <p className="mt-1 text-sm font-semibold text-[#12203B]">
                Learning, community, and support.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B98A3E]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                Our purpose
              </p>
            </div>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-5xl">
              Less searching.
              <br />
              More forward motion.
            </h2>

            <p className="mt-6 text-base leading-8 text-[#4B564C] sm:text-lg">
              Student life crosses many responsibilities. You may be checking
              a course, looking for tutor feedback, reading an announcement,
              joining an activity, or asking for support.
            </p>

            <p className="mt-4 text-base leading-8 text-[#4B564C] sm:text-lg">
              The portal brings those moments into one organized experience so
              important information is easier to find, understand, and act on.
            </p>

            <Link
              href="/features"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors duration-300 hover:text-[#B98A3E]"
            >
              Explore the portal features
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          PORTAL AREAS
      ====================================================== */}
      <section className="border-y border-[#DADCD3] bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#B98A3E]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B98A3E]">
                What the portal brings together
              </p>
            </div>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-5xl">
              A clearer view of the things that matter.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#6B7268]">
              The portal organizes the most important parts of student life
              into one dependable digital environment.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {portalAreas.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group border border-[#DADCD3] bg-[#F7F6F2] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#B98A3E]/50 hover:bg-white hover:shadow-[0_12px_30px_rgba(18,32,59,0.06)] sm:p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#DADCD3] bg-white">
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                    className="text-[#B98A3E]"
                  />
                </div>

                <h3 className="mt-6 text-lg font-semibold tracking-[-0.015em] text-[#12203B]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#5F685F]">
                  {description}
                </p>

                <div className="mt-7 h-px w-0 bg-[#B98A3E] transition-all duration-500 group-hover:w-10" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          PRINCIPLES
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#55705B]" />

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55705B]">
                How we approach the experience
              </p>
            </div>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#12203B] sm:text-4xl">
              Simple principles behind the platform.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="border border-[#DADCD3] bg-white p-6 shadow-[0_8px_25px_rgba(18,32,59,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B98A3E]/50 sm:p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F7F6F2]">
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                    className="text-[#55705B]"
                  />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[#12203B]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#626A62]">
                  {description}
                </p>
              </article>
            ))}
          </div>

          {/* Next step */}
          <div className="mt-14 flex flex-col justify-between gap-6 border-t border-[#DADCD3] pt-8 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-[#55705B]">
                <BellRing size={17} strokeWidth={1.8} />

                <p className="text-sm font-semibold">
                  Your next step starts here.
                </p>
              </div>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B7268]">
                Learn what is available to you across the Selfless CE network.
              </p>
            </div>

            <Link
              href="/tech-centers"
              className="group inline-flex items-center gap-2 self-start text-sm font-bold text-[#12203B] transition-colors duration-300 hover:text-[#B98A3E] sm:self-auto"
            >
              Meet the tech centers
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
