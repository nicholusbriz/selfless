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
    y: 16,
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

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#12203B] text-white">
      {/* Subtle top accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-[#B98A3E]/70"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: prefersReducedMotion ? 0 : 0.07,
              },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          className="
            grid
            gap-x-10
            gap-y-10
            py-12
            sm:py-14
            lg:grid-cols-[1.6fr_0.8fr_0.7fr_1fr]
            lg:gap-x-16
            lg:py-16
          "
        >
          {/* =================================================
              BRAND
          ================================================== */}
          <motion.div variants={footerReveal} className="max-w-md">
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
                  h-12
                  w-12
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border
                  border-white/15
                  bg-white
                  p-0.5
                  shadow-sm
                  transition-all
                  duration-300
                  group-hover:border-[#B98A3E]/60
                  group-hover:shadow-md
                "
              >
                <Image
                  src="/freedom.png"
                  alt="Selfless CE logo"
                  fill
                  sizes="48px"
                  className="rounded-[7px] object-contain"
                />
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="
                      text-[16px]
                      font-bold
                      tracking-[-0.02em]
                      text-white
                      sm:text-[17px]
                    "
                  >
                    Selfless CE
                  </span>

                  <span className="text-[16px] font-semibold text-[#E8A33D]">
                    Portal
                  </span>
                </div>

                <span
                  className="
                    mt-1
                    block
                    text-[8.5px]
                    font-semibold
                    uppercase
                    tracking-[0.17em]
                    text-white/45
                  "
                >
                  Student Self Service
                </span>
              </div>
            </Link>

            <p
              className="
                mt-5
                max-w-lg
                text-[13px]
                leading-6
                text-white/60
                sm:text-sm
                sm:leading-6
              "
            >
              A centralized student platform supporting academic
              progress, collaboration, communication, and engagement
              across the SELFLESS Tech Center Network.
            </p>

            {/* Institutional statement */}
            <div className="mt-5 flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 h-8 w-0.5 shrink-0 rounded-full bg-[#B98A3E]"
              />

              <p className="text-[11px] font-medium leading-5 text-white/45">
                Learn with purpose. Stay connected. Build your future.
              </p>
            </div>
          </motion.div>

          {/* =================================================
              QUICK LINKS
          ================================================== */}
          <motion.div variants={footerReveal}>
            <FooterHeading>Explore</FooterHeading>

            <nav aria-label="Footer navigation" className="mt-4">
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="
                        group
                        inline-flex
                        items-center
                        gap-1.5
                        text-[12.5px]
                        font-medium
                        text-white/55
                        transition-colors
                        duration-200
                        hover:text-white
                        focus:outline-none
                        focus-visible:text-[#E8A33D]
                      "
                    >
                      <span>{link.label}</span>

                      <ArrowUpRight
                        size={12}
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
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* =================================================
              LEGAL
          ================================================== */}
          <motion.div variants={footerReveal}>
            <FooterHeading>Information</FooterHeading>

            <nav aria-label="Legal navigation" className="mt-4">
              <ul className="space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="
                        group
                        inline-flex
                        items-center
                        gap-1.5
                        text-[12.5px]
                        font-medium
                        text-white/55
                        transition-colors
                        duration-200
                        hover:text-white
                        focus:outline-none
                        focus-visible:text-[#E8A33D]
                      "
                    >
                      <span>{link.label}</span>

                      <ArrowUpRight
                        size={12}
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

            <p className="mt-4 max-w-xs text-[12px] leading-5 text-white/50">
              Have a question or need assistance? Reach the team
              through one of the channels below.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <Social
                icon={<MessageCircle size={16} strokeWidth={1.9} />}
                href="https://wa.me/256761996296"
                label="Contact Selfless CE on WhatsApp"
              />

              <Social
                icon={<Phone size={16} strokeWidth={1.9} />}
                href="tel:+256761996296"
                label="Call Selfless CE"
              />

              <Social
                icon={<Mail size={16} strokeWidth={1.9} />}
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
          <p className="text-[10.5px] font-medium leading-5 text-white/40 sm:text-[11px]">
            © {new Date().getFullYear()} Selfless Student Self Service
            Portal.
          </p>

          <div className="flex items-center gap-2 text-[10.5px] font-medium text-white/40 sm:text-[11px]">
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

      <h3
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-white/80
        "
      >
        {children}
      </h3>
    </div>
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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
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
        bg-white/[0.04]
        text-white/55
        outline-none
        transition-all
        duration-200
        hover:border-[#B98A3E]/50
        hover:bg-[#B98A3E]/10
        hover:text-[#E8A33D]
        hover:-translate-y-0.5
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