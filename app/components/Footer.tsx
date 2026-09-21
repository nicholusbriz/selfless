"use client";

import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Tech Centers", href: "/tech-centers" },
  { label: "Features", href: "/features" },
  { label: "Help", href: "/help" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/* =========================================================
   SLIDE ANIMATIONS
========================================================= */

const slideInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const slideInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045 } },
};

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const viewportAnimation = prefersReducedMotion
    ? {}
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.12 },
      };

  return (
    <footer className="relative overflow-hidden bg-[#12203B] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {/* =====================================================
            FOOTER IDENTITY
        ====================================================== */}

        <motion.div
          {...viewportAnimation}
          variants={stagger}
          className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16"
        >
          <motion.div variants={slideInLeft}>
            <Link
              href="/"
              aria-label="Selfless CE Portal home"
              className="group inline-flex items-center gap-3 outline-none"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white p-0.5 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/freedom.png"
                  alt="Selfless CE logo"
                  fill
                  sizes="40px"
                  className="rounded-[7px] object-contain"
                />
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[16px] font-bold tracking-[-0.025em] text-white sm:text-[17px]">
                    Selfless CE
                  </span>

                  <span className="text-[16px] font-semibold text-[#E8A33D]">
                    Portal
                  </span>
                </div>

                <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Student Self Service
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.p
            variants={slideInRight}
            className="max-w-md text-[12.5px] leading-6 text-white/60 lg:text-right"
          >
            A centralized student platform supporting academic progress,
            collaboration, communication, and engagement across the SELFLESS
            Tech Center Network.
          </motion.p>
        </motion.div>

        {/* =====================================================
            MAIN COLUMNS
        ====================================================== */}

        <motion.div
          {...viewportAnimation}
          variants={stagger}
          className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1.2fr] lg:gap-x-14"
        >
          {/* Brand / statement */}
          <motion.div variants={slideInLeft}>
            <FooterHeading>Selfless CE</FooterHeading>

            <p className="mt-4 max-w-sm text-[12.5px] leading-6 text-white/60">
              Empowering students through a connected, student-centered
              digital environment.
            </p>

            <p className="mt-4 max-w-sm text-[11px] font-medium italic leading-5 text-[#E8A33D]">
              "Learn with purpose. Stay connected. Build your future."
            </p>
          </motion.div>

          {/* Explore */}
          <motion.div variants={slideInUp}>
            <FooterHeading>Explore</FooterHeading>

            <nav aria-label="Footer navigation" className="mt-4">
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Information */}
          <motion.div variants={slideInUp}>
            <FooterHeading>Information</FooterHeading>

            <nav aria-label="Legal navigation" className="mt-4">
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Connect — icons only */}
          <motion.div variants={slideInRight}>
            <FooterHeading>Connect</FooterHeading>

            <p className="mt-4 max-w-xs text-[12.5px] leading-6 text-white/60">
              Questions or need assistance? Reach the team through one of the
              channels below.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <ContactIcon
                icon={<MessageCircle size={17} strokeWidth={1.9} />}
                href="https://wa.me/256761996296"
                label="Chat with Selfless CE on WhatsApp"
              />

              <ContactIcon
                icon={<Phone size={17} strokeWidth={1.9} />}
                href="tel:+256761996296"
                label="Call Selfless CE"
              />

              <ContactIcon
                icon={<Mail size={17} strokeWidth={1.9} />}
                href="mailto:turyamurebanicholus@gmail.com"
                label="Email Selfless CE"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <motion.div
          {...viewportAnimation}
          variants={staggerFast}
          className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <motion.p
            variants={slideInUp}
            className="text-[10.5px] font-medium leading-5 text-white/40"
          >
            © {new Date().getFullYear()} Selfless Student Self Service Portal.
          </motion.p>

          <motion.div
            variants={slideInUp}
            className="flex items-center gap-2 text-[10.5px] font-medium text-white/40"
          >
            <span>Empowering student success</span>

            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#E8A33D]"
            />

            <span>Through technology</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}

/* ============================================================
   FOOTER HEADING
============================================================ */

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="h-px w-6 bg-[#E8A33D]" />

      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
        {children}
      </h3>
    </div>
  );
}

/* ============================================================
   FOOTER LINK
============================================================ */

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/65 transition-colors duration-200 hover:text-[#E8A33D]"
    >
      <span>{children}</span>

      <ArrowUpRight
        size={12}
        strokeWidth={1.8}
        className="-translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </Link>
  );
}

/* ============================================================
   CONTACT ICON — clickable, opens WhatsApp / call / email
============================================================ */

function ContactIcon({
  icon,
  href,
  label,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
}) {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      aria-label={label}
      className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-[#E8A33D] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E8A33D] hover:text-[#12203B]"
    >
      {icon}
    </a>
  );
}