"use client";

import {
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Tech Centers", href: "/tech-centers" },
  { label: "Features", href: "/features" },
  { label: "Help", href: "/help" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0D182C] text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* MAIN ROW */}
        <div className="flex flex-col gap-8 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Brand */}
          <Link
            href="/"
            aria-label="Selfless Portal home"
            className="group inline-flex shrink-0 items-center gap-3"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white p-0.5 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/freedom.png"
                alt="Selfless logo"
                fill
                sizes="36px"
                className="rounded-[6px] object-contain"
              />
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[15px] font-bold tracking-[-0.02em] text-white">
                  Selfless
                </span>
                <span className="text-[15px] font-semibold text-[#E8A33D]">
                  Portal
                </span>
              </div>
              <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                Student Self Service
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[12.5px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="flex items-center gap-2.5">
            <ContactIcon
              icon={<MessageCircle size={16} strokeWidth={1.9} />}
              href="https://wa.me/256761996296"
              label="Chat with Selfless on WhatsApp"
            />
            <ContactIcon
              icon={<Phone size={16} strokeWidth={1.9} />}
              href="tel:+256761996296"
              label="Call Selfless"
            />
            <ContactIcon
              icon={<Mail size={16} strokeWidth={1.9} />}
              href="mailto:turyamurebanicholus@gmail.com"
              label="Email Selfless"
            />
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-white/10 py-5 sm:flex-row">
          <p className="text-[11px] font-medium text-white/40">
            © {new Date().getFullYear()} Selfless Student Self Service Portal.
          </p>
          <p className="text-[11px] font-medium text-white/40">
            Empowering student success through technology
          </p>
        </div>
      </div>
    </footer>
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
  icon: ReactNode;
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
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#E8A33D] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E8A33D] hover:text-[#12203B]"
    >
      {icon}
    </a>
  );
}
