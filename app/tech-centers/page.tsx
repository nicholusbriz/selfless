"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Network,
  ShieldCheck,
  Users,
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
      "Every participating tech center works within one digital environment for students, academic information, communication, activities, and support.",
  },
  {
    number: "02",
    icon: Users,
    title: "Local support, wider community",
    description:
      "Your tech center remains your local point of connection while the portal helps you interact with the wider SELFLESS CE student community.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "A consistent experience",
    description:
      "Students can use the same portal experience to find important information, stay connected, and manage their journey across the network.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065 } },
};

export default function TechCentersPage() {
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.12 },
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
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel label="The network" color="brass" />
            <h2 className="mt-5 max-w-xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.65rem]">
              Different locations.
              <br />
              One student experience.
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-[#4B564C] sm:text-[15px]">
              SELFLESS CE tech centers provide local spaces where students can
              receive support and stay connected to their learning. The portal
              extends that experience beyond the physical center.
            </p>

            <Link
              href="/features"
              className="group mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-[#55705B] transition-colors hover:text-[#B98A3E]"
            >
              See what students can access
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-10 lg:space-y-12">
            {networkPoints.map(({ number, icon: Icon, title, description }) => (
              <article
                key={number}
                className="group grid gap-4 sm:grid-cols-[48px_1fr] sm:gap-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                    className="text-[#B98A3E]"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#B98A3E]">
                      {number}
                    </span>
                    <span className="h-px w-5 bg-[#DADCD3] transition-all duration-300 group-hover:w-10 group-hover:bg-[#B98A3E]" />
                  </div>

                  <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.015em] text-[#12203B] sm:text-[17px]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-7 text-[#626A62] sm:text-sm">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          CENTER DIRECTORY
      ====================================================== */}
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div
            variants={fadeUp}
            className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end lg:gap-20"
          >
            <div>
              <SectionLabel label="Our tech centers" color="moss" />
              <h2 className="mt-5 max-w-xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.55rem]">
                Local centers.
                <br />
                Connected by one platform.
              </h2>
            </div>

            <p className="max-w-2xl text-[14px] leading-7 text-[#6B7268] sm:text-[15px]">
              Our network continues to grow across Uganda. Each center provides
              a local connection for students while the SELFLESS CE Portal
              keeps the wider student experience connected.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-14 grid gap-x-16 gap-y-8 sm:grid-cols-2 lg:mt-20 lg:gap-y-10"
          >
            {centers.map((center, index) => (
              <motion.article
                key={center.name}
                variants={fadeUp}
                className="group flex items-start gap-5"
              >
                <span className="pt-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#B98A3E]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[#12203B] transition-colors group-hover:text-[#55705B] sm:text-[16px]">
                    {center.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[#6B7268] sm:text-[13px]">
                    <MapPin
                      size={13}
                      strokeWidth={1.8}
                      className="shrink-0 text-[#55705B]"
                    />
                    <span>{center.location}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex flex-col gap-3 text-[12px] text-[#6B7268] sm:flex-row sm:items-center sm:justify-between sm:text-[13px]"
          >
            <p>{centers.length} tech centers represented across the network.</p>

            <div className="flex items-center gap-2 text-[#55705B]">
              <Building2 size={15} strokeWidth={1.8} className="shrink-0" />
              <span className="font-medium">
                More locations can become part of the network.
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          WHAT STUDENTS GET
      ====================================================== */}
      <section className="bg-[#F1F1EC] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...animationProps}
          variants={stagger}
          className="mx-auto max-w-7xl"
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <SectionLabel label="What this means for students" color="brass" />
            <h2 className="mt-5 text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-[#12203B] sm:text-4xl lg:text-[2.65rem]">
              Your center is local.
              <br />
              Your community is bigger.
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-[#6B7268] sm:text-[15px]">
              Being part of one connected network means students can benefit
              from both the support around their own center and the wider
              SELFLESS CE community.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-3 lg:gap-12"
          >
            <NetworkBenefit
              number="01"
              icon={Users}
              title="Connect beyond your center"
              description="Build relationships with students from other tech centers and take part in a wider student community."
            />
            <NetworkBenefit
              number="02"
              icon={ShieldCheck}
              title="Find support more easily"
              description="Keep important communication, academic assistance, and student services closer to where you manage your studies."
            />
            <NetworkBenefit
              number="03"
              icon={Network}
              title="Stay part of one system"
              description="Your local center and the wider SELFLESS CE network remain connected through the same digital platform."
            />
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          PORTAL ACCESS (video band)
      ====================================================== */}
      <section className="relative isolate overflow-hidden bg-[#0D1117] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
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
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
              Portal access
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl">
              Your connection continues beyond the tech center.
            </h2>
            <p className="mt-5 max-w-2xl text-[14px] leading-7 text-white/65 sm:text-[15px]">
              Your student experience does not stop when you leave the physical
              center. Use the portal to check academic information,
              communication, opportunities, and available student services.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.8}
                  className="text-[#E8A33D]"
                />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">
                  Always within reach
                </p>
                <p className="mt-0.5 text-[12px] text-white/55">
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
      <section className="bg-[#12203B] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <motion.div
          {...animationProps}
          variants={fadeUp}
          className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-14"
        >
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
              Connected by one platform
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-4xl">
              Wherever your tech center is,
              <span className="text-[#E8A33D]"> your portal stays with you.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[14px] leading-7 text-white/60 sm:text-[15px]">
              Explore the tools and services that make the SELFLESS CE student
              experience more connected.
            </p>
          </div>

          <Link
            href="/features"
            className="group inline-flex w-fit shrink-0 items-center justify-center gap-2.5 rounded-lg bg-[#E8A33D] px-5 py-3 text-[13px] font-bold text-[#12203B] transition-all hover:bg-[#F2B359] active:scale-[0.98]"
          >
            Explore portal features
            <ArrowRight
              size={15}
              strokeWidth={2}
              className="transition-transform group-hover:translate-x-1"
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
  const textColor = color === "brass" ? "text-[#B98A3E]" : "text-[#55705B]";
  const lineColor = color === "brass" ? "bg-[#B98A3E]" : "bg-[#55705B]";

  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className={`h-px w-7 ${lineColor}`} />
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${textColor}`}
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
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <motion.article variants={fadeUp} className="group">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#B98A3E]">
          {number}
        </span>
        <span className="h-px w-6 bg-[#DADCD3] transition-all duration-300 group-hover:w-12 group-hover:bg-[#B98A3E]" />
        <Icon size={18} strokeWidth={1.8} className="text-[#55705B]" />
      </div>

      <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.015em] text-[#12203B]">
        {title}
      </h3>
      <p className="mt-2 text-[13px] leading-7 text-[#626A62] sm:text-sm">
        {description}
      </p>
    </motion.article>
  );
}