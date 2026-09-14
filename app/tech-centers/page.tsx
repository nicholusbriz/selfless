"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Users,
  Building2,
  Network,
  CheckCircle2,
} from "lucide-react";
import PublicPageHero from "@/app/components/PublicPageHero";
import PublicPageShell from "@/app/components/PublicPageShell";

const centers = [
  { name: "Freedom City Tech Center", location: "Kampala" },
  { name: "Jinja Tech Center", location: "Jinja" },
  { name: "Lira Tech Center", location: "Northern Uganda" },
  { name: "Masaka Tech Center", location: "Central Uganda" },
  { name: "Mbale Tech Center", location: "Eastern Uganda" },
  { name: "Ntinda Tech Center", location: "Kampala" },
  { name: "Sseta Tech Center", location: "Central Region" },
];

const networkPoints = [
  {
    number: "01",
    icon: Network,
    title: "One connected system",
    description:
      "Every participating tech center works within one digital environment, making it easier to coordinate students, academic information, communication, activities, and support.",
  },
  {
    number: "02",
    icon: Users,
    title: "Local support, wider community",
    description:
      "Your tech center remains your local point of connection while the portal allows you to interact with the wider SELFLESS CE student community.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "A consistent experience",
    description:
      "Students can use the same dependable portal experience to find important information, stay connected, and manage their journey regardless of their center.",
  },
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export default function TechCentersPage() {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: {
          once: true,
          amount: 0.12,
        },
      };

  return (
    <PublicPageShell>
      <PublicPageHero
        eyebrow="SELFLESS CE Tech Center Network"
        title="One connected network. Many places to learn."
        description="SELFLESS CE brings its tech centers together through one student portal, giving students a consistent digital experience for learning, communication, community, and support wherever they are."
        backgroundVideo="/tech center.mp4"
        backgroundPoster="/student-portal-image.png"
        actionHref="/features"
        actionLabel="Explore portal features"
      />

      {/* =====================================================
          NETWORK INTRODUCTION
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel label="The network" color="brass" />

            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
              Different locations.
              <br />
              One student experience.
            </h2>

            <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#4B564C] sm:text-base sm:leading-8">
              SELFLESS CE tech centers provide local spaces where students can
              receive support and stay connected to their learning. The portal
              extends that experience beyond the physical center.
            </p>

            <p className="mt-3.5 max-w-xl text-[15px] leading-7 text-[#6B7268] sm:text-base sm:leading-8">
              Students can remain part of one wider community while each center
              continues to serve the needs of its own students.
            </p>

            <Link
              href="/features"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#55705B] transition-colors duration-300 hover:text-[#B98A3E]"
            >
              See what students can access
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="border-y border-[#DADCD3]"
          >
            {networkPoints.map(
              ({ number, icon: Icon, title, description }) => (
                <article
                  key={number}
                  className="group grid gap-4 border-b border-[#DADCD3] py-6 last:border-b-0 sm:grid-cols-[52px_1fr] sm:gap-5"
                >
                  <div className="flex h-9 w-9 items-center justify-center bg-white">
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                      className="text-[#B98A3E]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#B98A3E]">
                        {number}
                      </span>

                      <span className="h-px w-5 bg-[#DADCD3] transition-all duration-300 group-hover:w-8 group-hover:bg-[#B98A3E]" />
                    </div>

                    <h3 className="mt-2.5 text-lg font-semibold tracking-[-0.015em] text-[#12203B]">
                      {title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-[#626A62]">
                      {description}
                    </p>
                  </div>
                </article>
              )
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          CENTER NETWORK
      ====================================================== */}
      <section className="border-y border-[#DADCD3] bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div
            variants={fadeUp}
            className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:gap-16"
          >
            <div>
              <SectionLabel label="Our tech centers" color="moss" />

              <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-[2.65rem]">
                Local centers.
                <br />
                Connected by one platform.
              </h2>
            </div>

            <p className="max-w-2xl text-[15px] leading-7 text-[#6B7268] sm:text-base sm:leading-8">
              Our network continues to grow across Uganda. Each center provides
              a local connection for students while the SELFLESS CE Portal
              keeps the wider student experience connected.
            </p>
          </motion.div>

          {/* Center list */}
          <motion.div
            variants={stagger}
            className="mt-8 overflow-hidden border-y border-[#DADCD3]"
          >
            {centers.map((center, index) => (
              <motion.article
                key={center.name}
                variants={fadeUp}
                className="group grid gap-4 border-b border-[#DADCD3] py-5 last:border-b-0 sm:grid-cols-[52px_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#B98A3E]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[#12203B] transition-colors duration-300 group-hover:text-[#55705B] sm:text-lg">
                    {center.name}
                  </h3>

                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-[#6B7268]">
                    <MapPin
                      size={14}
                      strokeWidth={1.8}
                      className="shrink-0 text-[#55705B]"
                    />
                    <span>{center.location}</span>
                  </div>
                </div>

                <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A9088] transition-colors duration-300 group-hover:text-[#B98A3E] sm:flex">
                  <span>Connected center</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-col gap-3 text-sm text-[#6B7268] sm:flex-row sm:items-center sm:justify-between"
          >
            <p>
              {centers.length} tech centers represented across the network.
            </p>

            <div className="flex items-center gap-2 text-[#55705B]">
              <Building2 size={16} strokeWidth={1.8} />
              <span className="font-medium">
                More locations can become part of the network.
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          WHAT STUDENTS GET FROM THE NETWORK
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <SectionLabel
              label="What this means for students"
              color="brass"
            />

            <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-[#12203B] sm:text-4xl lg:text-[2.8rem]">
              Your center is local.
              <br />
              Your community is bigger.
            </h2>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#6B7268] sm:text-base sm:leading-8">
              Being part of one connected network means students can benefit
              from both the support around their own center and the wider
              SELFLESS CE community.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-8 grid gap-px overflow-hidden border border-[#DADCD3] bg-[#DADCD3] md:grid-cols-3"
          >
            <NetworkBenefit
              icon={Users}
              title="Connect beyond your center"
              description="Build relationships with students from other tech centers and take part in a wider student community."
            />

            <NetworkBenefit
              icon={ShieldCheck}
              title="Find support more easily"
              description="Keep important communication, academic assistance, and student services closer to where you already manage your studies."
            />

            <NetworkBenefit
              icon={Network}
              title="Stay part of one system"
              description="Your local center and the wider SELFLESS CE network remain connected through the same digital platform."
            />
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          24/7 ACCESS
      ====================================================== */}
      <section className="relative isolate overflow-hidden bg-[#0D1117] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <video
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/student-portal-image.png"
          aria-hidden="true"
        >
          <source src="/tech center 1.mp4" type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-0 -z-[5] bg-[#071018]/80" />

        <motion.div
          {...animationProps}
          variants={fadeUp}
          className="relative mx-auto max-w-7xl"
        >
          <div className="border-y border-white/20 py-9 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-14">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <Clock3
                  size={18}
                  strokeWidth={1.8}
                  className="text-[#E8A33D]"
                />

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                  Portal access
                </p>
              </div>

              <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl">
                Your connection continues beyond the tech center.
              </h2>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
                Your student experience does not stop when you leave the
                physical center. Use the portal whenever you need to check
                academic information, communication, opportunities, or other
                available student services.
              </p>
            </div>

            <div className="mt-7 flex shrink-0 items-center gap-4 border-t border-white/10 pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <ShieldCheck
                  size={21}
                  strokeWidth={1.8}
                  className="text-[#E8A33D]"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Always within reach
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Wherever your learning takes you.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          CLOSING CTA
      ====================================================== */}
      <section className="bg-[#12203B] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <motion.div
          {...animationProps}
          variants={fadeUp}
          className="mx-auto flex max-w-7xl flex-col justify-between gap-7 lg:flex-row lg:items-center lg:gap-12"
        >
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
              Connected by one platform
            </p>

            <h2 className="mt-3.5 text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl">
              Wherever your tech center is,
              <span className="text-[#E8A33D]">
                {" "}
                your portal stays with you.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/65">
              Explore the tools and services that make the SELFLESS CE student
              experience more connected.
            </p>
          </div>

          <Link
            href="/features"
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-[#E8A33D] px-5 py-3.5 text-sm font-bold text-[#12203B] transition-all duration-300 hover:bg-[#F2B359] active:scale-[0.98]"
          >
            Explore portal features
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </section>
    </PublicPageShell>
  );
}

/* =========================================================
   SECTION LABEL
========================================================= */

function SectionLabel({
  label,
  color,
}: {
  label: string;
  color: "brass" | "moss";
}) {
  const textColor =
    color === "brass" ? "text-[#B98A3E]" : "text-[#55705B]";

  const lineColor =
    color === "brass" ? "bg-[#B98A3E]" : "bg-[#55705B]";

  return (
    <div className="flex items-center gap-3">
      <span className={`h-px w-8 ${lineColor}`} />

      <p
        className={`text-[11px] font-bold uppercase tracking-[0.2em] ${textColor}`}
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   NETWORK BENEFIT
========================================================= */

function NetworkBenefit({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <motion.article
      variants={fadeUp}
      className="group bg-white p-6 transition-colors duration-300 hover:bg-[#FBFAF7] sm:p-7 lg:p-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center border border-[#DADCD3] bg-[#F7F6F2]">
          <Icon
            size={19}
            strokeWidth={1.8}
            className="text-[#55705B]"
          />
        </div>

        <span className="h-px w-8 bg-[#DADCD3] transition-all duration-300 group-hover:w-12 group-hover:bg-[#B98A3E]" />
      </div>

      <h3 className="mt-6 text-lg font-semibold tracking-[-0.015em] text-[#12203B]">
        {title}
      </h3>

      <p className="mt-2.5 text-sm leading-7 text-[#626A62]">
        {description}
      </p>
    </motion.article>
  );
}