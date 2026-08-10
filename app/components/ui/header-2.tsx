"use client";

import { useState } from "react";
import Image from "next/image";
import { LayoutDashboard, LogIn, Menu, Sparkles, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";

const navItems = [
  { label: "Home", href: "#cover" },
  { label: "Centers", href: "#trusted" },
  { label: "Overview", href: "#overview" },
  { label: "FAQ", href: "#faq" },
];

export default function Header2() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");
  const { isAuthenticated } = useAuth();

  const openAuthModal = (type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0D1117]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#cover" className="flex items-center gap-3 text-white">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/10">
              <Image src="/freedom.png" alt="Selfless CE logo" fill className="object-cover" sizes="40px" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Selfless CE <span className="text-[#E8A33D]">Portal</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-[#E8A33D] px-4 py-2 text-sm font-semibold text-[#0D1117] transition hover:bg-[#f2b24b]"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </a>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("login")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  <LogIn size={16} />
                  Login
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#E8A33D] px-4 py-2 text-sm font-semibold text-[#0D1117] transition hover:bg-[#f2b24b]"
                >
                  <Sparkles size={16} />
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`overflow-hidden border-t border-white/10 bg-[#0D1117]/95 transition-all duration-300 md:hidden ${mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-300 transition hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="flex flex-col gap-2 pt-2">
              {isAuthenticated ? (
                <a
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8A33D] px-4 py-2 text-sm font-semibold text-[#0D1117]"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </a>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal("login")}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200"
                  >
                    <LogIn size={16} />
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal("register")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8A33D] px-4 py-2 text-sm font-semibold text-[#0D1117]"
                  >
                    <Sparkles size={16} />
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultType={authModalType} />
    </>
  );
}