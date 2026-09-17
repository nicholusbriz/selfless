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

const footerReveal = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const footerStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#12203B] text-white">
      {/* =====================================================
          TOP ACCENT
      ====================================================== */}

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[#B98A3E]/75"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* =====================================================
            FOOTER IDENTITY
        ====================================================== */}

        <motion.div
          {...(prefersReducedMotion
            ? {}
            : {
                initial: "hidden",
                whileInView: "visible",
                viewport: {
                  once: true,
                  amount: 0.15,
                },
              })}
          variants={footerStagger}
          className="border-b border-white/10 py-7 sm:py-8"
        >
          <motion.div
            variants={footerReveal}
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-px bg-[#B98A3E]" />

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#E8A33D]">
                  Selfless CE
                </p>

                <p className="mt-0.5 text-xs font-medium text-white/60">
                  Student Self Service Portal
                </p>
              </div>
            </div>

            <p className="max-w-md text-[12px] leading-5 text-white/45 sm:text-right">
              A connected digital environment for learning, communication,
              support, and student progress.
            </p>
          </motion.div>
        </motion.div>

        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <motion.div
          {...(prefersReducedMotion
            ? {}
            : {
                initial: "hidden",
                whileInView: "visible",
                viewport: {
                  once: true,
                  amount: 0.12,
                },
              })}
          variants={footerStagger}
          className="
            grid
            gap-x-10
            gap-y-10
            py-11
            sm:py-13
            lg:grid-cols-[1.55fr_0.8fr_0.7fr_1fr]
            lg:gap-x-16
            lg:py-14
          "
        >
          {/* =================================================
              BRAND
          ================================================== */}

          <motion.div
            variants={footerReveal}
            className="max-w-md"
          >
            <Link
              href="/"
              aria-label="Selfless CE Portal home"
              className="
                group
                inline-flex
                items-center
                gap-3
                rounded-lg
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[#B98A3E]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#12203B]
              "
            >
              <div
                className="
                  relative
                  h-11
                  w-11
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border
                  border-white/15
                  bg-white
                  p-0.5
                  transition-all
                  duration-300
                  group-hover:border-[#B98A3E]/60
                  group-hover:shadow-[0_5px_18px_rgba(232,163,61,0.12)]
                "
              >
                <Image
                  src="/freedom.png"
                  alt="Selfless CE logo"
                  fill
                  sizes="44px"
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

                <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Student Self Service
                </span>
              </div>
            </Link>

            <p className="mt-5 max-w-lg text-[13px] leading-6 text-white/55 sm:text-sm">
              A centralized student platform supporting academic progress,
              collaboration, communication, and engagement across the
              SELFLESS Tech Center Network.
            </p>

            {/* Statement */}

            <div className="mt-5 flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 h-7 w-0.5 shrink-0 bg-[#B98A3E]"
              />

              <p className="max-w-sm text-[11px] font-medium leading-5 text-white/40">
                Learn with purpose. Stay connected. Build your future.
              </p>
            </div>
          </motion.div>

          {/* =================================================
              EXPLORE
          ================================================== */}

          <motion.div variants={footerReveal}>
            <FooterHeading>Explore</FooterHeading>

            <nav
              aria-label="Footer navigation"
              className="mt-4"
            >
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink
                      href={link.href}
                    >
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* =================================================
              INFORMATION
          ================================================== */}

          <motion.div variants={footerReveal}>
            <FooterHeading>Information</FooterHeading>

            <nav
              aria-label="Legal navigation"
              className="mt-4"
            >
              <ul className="space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink
                      href={link.href}
                    >
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* =================================================
              CONNECT
          ================================================== */}

          <motion.div variants={footerReveal}>
            <FooterHeading>Connect</FooterHeading>

            <p className="mt-4 max-w-xs text-[12px] leading-5 text-white/45">
              Questions or need assistance? Reach the team through one of the
              channels below.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <Social
                icon={
                  <MessageCircle
                    size={16}
                    strokeWidth={1.9}
                  />
                }
                href="https://wa.me/256761996296"
                label="Contact Selfless CE on WhatsApp"
              />

              <Social
                icon={
                  <Phone
                    size={16}
                    strokeWidth={1.9}
                  />
                }
                href="tel:+256761996296"
                label="Call Selfless CE"
              />

              <Social
                icon={
                  <Mail
                    size={16}
                    strokeWidth={1.9}
                  />
                }
                href="mailto:turyamurebanicholus@gmail.com"
                label="Email Selfless CE"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-white/10
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p className="text-[10.5px] font-medium leading-5 text-white/35 sm:text-[11px]">
            © {new Date().getFullYear()} Selfless Student Self Service
            Portal.
          </p>

          <div className="flex items-center gap-2 text-[10.5px] font-medium text-white/35 sm:text-[11px]">
            <span>Empowering student success</span>

            <span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-[#B98A3E]"
            />

            <span>Through technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   FOOTER HEADING
============================================================ */

function FooterHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="h-3.5 w-0.5 rounded-full bg-[#B98A3E]"
      />

      <h3 className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/75">
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
      className="
        group
        inline-flex
        items-center
        gap-1.5
        rounded-sm
        text-[12.5px]
        font-medium
        text-white/50
        outline-none
        transition-colors
        duration-200
        hover:text-white
        focus-visible:text-[#E8A33D]
      "
    >
      <span>{children}</span>

      <ArrowUpRight
        size={12}
        strokeWidth={1.8}
        className="
          -translate-x-1
          opacity-0
          transition-all
          duration-200
          group-hover:translate-x-0
          group-hover:opacity-100
        "
      />
    </Link>
  );
}

/* ============================================================
   SOCIAL BUTTON
============================================================ */

function Social({
  icon,
  href,
  label,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
}) {
  const isExternal =
    href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={
        isExternal
          ? "noopener noreferrer"
          : undefined
      }
      aria-label={label}
      className="
        group
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        border
        border-white/10
        bg-white/[0.035]
        text-white/50
        outline-none
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#B98A3E]/50
        hover:bg-[#B98A3E]/10
        hover:text-[#E8A33D]
        focus-visible:ring-2
        focus-visible:ring-[#B98A3E]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[#12203B]
        motion-reduce:transition-none
        motion-reduce:hover:transform-none
      "
    >
      {icon}
    </a>
  );
}