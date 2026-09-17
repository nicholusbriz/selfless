"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ArrowUpRight,
  GraduationCap,
  LogIn,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";

const COLORS = {
  navy: "#12203B",
  navyDeep: "#0D182C",

  navSurface: "#1A2D49",
  navSurfaceHover: "#223957",
  navBorder: "#304763",

  brass: "#B98A3E",
  brassLight: "#E8A33D",
  brassBright: "#F0B85C",

  white: "#FFFFFF",
  softWhite: "#F7F6F2",
  page: "#F1F1EC",
  border: "#DADCD3",
  muted: "#6B7268",
  subtle: "#8A9088",
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Tech Centers", href: "/tech-centers" },
  { label: "Features", href: "/features" },
  { label: "Help", href: "/help" },
  { label: "Privacy", href: "/privacy" },
];

const tickerPhrases = [
  "One platform for learning, growth, and connection.",
  "One platform for progress, collaboration, and success.",
  "Built for students, tutors, and future leaders.",
  "Empowering learning, growing, and thriving.",
  "Driving progress, excellence, and innovation.",
  "All education in one place.",
];

const navMotion = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const mobileItemMotion = {
  hidden: { opacity: 0, x: 14 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.045,
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

/* -------------------------------------------------------------------------- */
/* Marquee styles                                                             */
/* -------------------------------------------------------------------------- */

function MarqueeStyles() {
  return (
    <style>{`
      @keyframes selflessMarquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      .selfless-marquee-track {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        animation: selflessMarquee 42s linear infinite;
        will-change: transform;
      }
      .selfless-marquee-track:hover { animation-play-state: paused; }
      @media (prefers-reduced-motion: reduce) {
        .selfless-marquee-track { animation: none !important; }
      }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/* Ticker strip                                                               */
/* -------------------------------------------------------------------------- */

function TickerStrip() {
  const repeated = [...tickerPhrases, ...tickerPhrases];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundColor: COLORS.navy,
      }}
    >
      <div className="flex min-h-8 items-stretch sm:min-h-9">
        {/* Badge — "SELFLESS CE" on mobile and desktop */}
        <div
          className="flex shrink-0 items-center gap-1.5 border-r px-2.5 sm:gap-2 sm:px-5"
          style={{
            borderColor: "rgba(232,163,61,0.22)",
            backgroundColor: COLORS.navyDeep,
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: COLORS.brass }}
          />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.2em]"
            style={{ color: COLORS.brass }}
          >
            SELFLESS CE
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="selfless-marquee-track">
            {repeated.map((phrase, index) => (
              <span
                key={`${phrase}-${index}`}
                className="flex items-center text-[10.5px] sm:text-[12px]"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                <span className="px-3.5 sm:px-7">{phrase}</span>
                <span style={{ color: "rgba(232,163,61,0.55)" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav link                                                                   */
/* -------------------------------------------------------------------------- */

function NavLink({
  item,
  active,
}: {
  item: { label: string; href: string };
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group relative whitespace-nowrap px-3.5 py-2 text-[13px] font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#E8A33D] motion-reduce:transition-none"
      style={{
        color: active ? COLORS.white : "rgba(255,255,255,0.72)",
      }}
    >
      <span className="relative group-hover:text-white">{item.label}</span>

      <span
        className="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] origin-center rounded-full transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none"
        style={{
          backgroundColor: COLORS.brassLight,
          transform: active ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Secondary identity strip — no top border, blends into the nav              */
/* -------------------------------------------------------------------------- */

function AnimatedSubHeader() {
  return (
    <div style={{ backgroundColor: COLORS.navy }}>
      <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <p
          className="font-serif text-xs italic sm:text-[15px]"
          style={{ color: "rgba(247,246,242,0.88)" }}
        >
          Student Self Service Portal
        </p>

        <p
          className="font-mono text-[8px] uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.18em]"
          style={{ color: "rgba(232,163,61,0.85)" }}
        >
          All education in one place
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

export default function Header2() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authModalType, setAuthModalType] =
    useState<"login" | "register">("login");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);

  const openPathname = mobileMenuOpen ? pathname : null;

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 18);
  }, []);

  useEffect(() => {
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const openAuth = (type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <MarqueeStyles />

      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: COLORS.navy,
          boxShadow: scrolled
            ? "0 10px 30px rgba(13,24,44,0.22)"
            : "0 4px 18px rgba(13,24,44,0.12)",
        }}
      >
        {/* Ticker */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          }`}
        >
          <TickerStrip />
        </div>

        {/* Main navigation */}
        <div style={{ backgroundColor: COLORS.navy }}>
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            {/* ================= DESKTOP (xl+) ================= */}
            <div
              className={`hidden items-center justify-between gap-4 transition-all duration-300 xl:flex ${
                scrolled ? "h-[60px]" : "h-[72px]"
              }`}
            >
              {/* Brand */}
              <Link
                href="/"
                aria-label="SELFLESS CE home"
                className="group flex shrink-0 items-center"
              >
                <Image
                  src="/freedom.png"
                  alt="SELFLESS CE"
                  width={152}
                  height={44}
                  priority
                  className="h-auto w-[120px] object-contain transition-transform duration-300 group-hover:scale-[1.015] lg:w-[130px]"
                />
              </Link>

              {/* Centered nav links */}
              <motion.nav
                initial="hidden"
                animate="visible"
                variants={navMotion}
                aria-label="Primary navigation"
                className="flex min-w-0 flex-1 items-center justify-center"
              >
                <div className="flex items-center">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                    />
                  ))}
                </div>
              </motion.nav>

              {/* Actions on the right */}
              <div className="flex shrink-0 items-center gap-2">
                {isLoading ? (
                  <div
                    aria-hidden="true"
                    className="h-10 w-28 animate-pulse rounded-sm"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                  />
                ) : user ? (
                  <Link
                    href="/dashboard"
                    className="group inline-flex h-10 items-center gap-2 px-5 text-[13px] font-bold transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none"
                    style={{
                      backgroundColor: COLORS.brassLight,
                      color: COLORS.navy,
                    }}
                  >
                    <span>Dashboard</span>

                    <ArrowUpRight
                      size={14}
                      strokeWidth={2.2}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuth("login")}
                      className="inline-flex h-10 items-center gap-2 border px-4 text-[13px] font-semibold outline-none transition-colors duration-200 hover:text-white focus-visible:ring-2 focus-visible:ring-[#E8A33D] motion-reduce:transition-none"
                      style={{
                        borderColor: "rgba(255,255,255,0.24)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      <LogIn size={15} strokeWidth={2} />
                      Login
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuth("register")}
                      className="group inline-flex h-10 items-center gap-2 px-5 text-[13px] font-bold transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none"
                      style={{
                        backgroundColor: COLORS.brassLight,
                        color: COLORS.navy,
                      }}
                    >
                      Get Started

                      <ArrowUpRight
                        size={14}
                        strokeWidth={2.2}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ================= MOBILE / TABLET (up to xl) ================= */}
            <div
              className={`flex items-center justify-between gap-3 transition-all duration-300 xl:hidden ${
                scrolled ? "h-[60px]" : "h-[72px]"
              }`}
            >
              {/* Brand */}
              <Link
                href="/"
                aria-label="SELFLESS CE home"
                className="group flex min-w-0 shrink items-center"
              >
                <Image
                  src="/freedom.png"
                  alt="SELFLESS CE"
                  width={152}
                  height={44}
                  priority
                  className="h-auto w-[110px] object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:w-[130px]"
                />
              </Link>

              {/* Auth button + hamburger */}
              <div className="flex shrink-0 items-center gap-1.5">
                {isLoading ? (
                  <div
                    aria-hidden="true"
                    className="h-10 w-10 animate-pulse rounded-sm"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                  />
                ) : user ? (
                  <Link
                    href="/dashboard"
                    aria-label="Open dashboard"
                    className="inline-flex h-10 items-center justify-center gap-1.5 px-3.5 text-[12px] font-bold"
                    style={{
                      backgroundColor: COLORS.brassLight,
                      color: COLORS.navy,
                    }}
                  >
                    <span>Dashboard</span>
                    <ArrowUpRight size={14} strokeWidth={2.2} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="inline-flex h-10 items-center justify-center gap-1.5 border px-3.5 text-[12px] font-semibold transition-colors"
                    style={{
                      borderColor: "rgba(255,255,255,0.24)",
                      color: COLORS.white,
                    }}
                  >
                    <LogIn size={14} strokeWidth={2} />
                    Login
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen((current) => !current)
                  }
                  aria-label={
                    mobileMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  aria-expanded={mobileMenuOpen}
                  className="inline-flex h-10 w-10 items-center justify-center border transition-all duration-200"
                  style={{
                    borderColor: mobileMenuOpen
                      ? "rgba(232,163,61,0.55)"
                      : "rgba(255,255,255,0.24)",
                    color: COLORS.white,
                    backgroundColor: mobileMenuOpen
                      ? "rgba(232,163,61,0.14)"
                      : "transparent",
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileMenuOpen ? (
                      <motion.span
                        key="close"
                        initial={{ opacity: 0, rotate: -45 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 45 }}
                        transition={{ duration: 0.18 }}
                        className="flex"
                      >
                        <X size={18} strokeWidth={2.2} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="menu"
                        initial={{ opacity: 0, rotate: 45 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -45 }}
                        transition={{ duration: 0.18 }}
                        className="flex"
                      >
                        <Menu size={20} strokeWidth={2.2} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom strip — no top border, blends into nav */}
          <AnimatedSubHeader />

          {/* Mobile drawer */}
          <AnimatePresence>
            {openPathname === pathname && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close navigation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeMobileMenu}
                  className="fixed inset-0 top-[60px] z-40 xl:hidden"
                  style={{
                    backgroundColor: "rgba(13,24,44,0.34)",
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.985 }}
                  transition={{
                    duration: 0.22,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                  className="absolute inset-x-3 top-full z-50 overflow-hidden rounded-xl border shadow-[0_18px_45px_rgba(13,24,44,0.20)] xl:hidden"
                  style={{
                    borderColor: COLORS.border,
                    backgroundColor: COLORS.page,
                  }}
                >
                  <nav aria-label="Mobile navigation" className="p-2.5">
                    {navItems.map((item, index) => {
                      const active = isActive(item.href);

                      return (
                        <motion.div
                          key={item.href}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          variants={mobileItemMotion}
                        >
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            className="group flex min-h-11 items-center justify-between rounded-lg px-3.5 text-[13px] font-semibold transition-colors"
                            style={{
                              backgroundColor: active
                                ? COLORS.white
                                : "transparent",
                              color: active ? COLORS.navy : "#4B564C",
                              boxShadow: active
                                ? "0 2px 8px rgba(18,32,59,0.05)"
                                : "none",
                            }}
                          >
                            <span className="flex items-center gap-3">
                              {active && (
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{
                                    backgroundColor: COLORS.brass,
                                  }}
                                />
                              )}

                              <span>{item.label}</span>
                            </span>

                            <ArrowUpRight
                              size={14}
                              strokeWidth={1.8}
                              className={`transition-all duration-200 ${
                                active
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-70"
                              }`}
                              style={{
                                color: active
                                  ? COLORS.brass
                                  : COLORS.subtle,
                              }}
                            />
                          </Link>
                        </motion.div>
                      );
                    })}

                    <div
                      className="my-2 border-t"
                      style={{ borderColor: COLORS.border }}
                    />

                    {user ? (
                      <Link
                        href="/dashboard"
                        onClick={closeMobileMenu}
                        className="flex min-h-11 items-center justify-between rounded-lg px-3.5 text-[13px] font-semibold"
                        style={{
                          backgroundColor: COLORS.navy,
                          color: COLORS.white,
                        }}
                      >
                        <span>Dashboard</span>

                        <ArrowUpRight size={14} />
                      </Link>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openAuth("login")}
                          className="flex min-h-11 items-center justify-center gap-2 rounded-lg border bg-white px-3 text-[13px] font-semibold"
                          style={{
                            borderColor: COLORS.border,
                            color: COLORS.navy,
                          }}
                        >
                          <LogIn size={14} />

                          Login
                        </button>

                        <button
                          type="button"
                          onClick={() => openAuth("register")}
                          className="flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold"
                          style={{
                            backgroundColor: COLORS.brassLight,
                            color: COLORS.navy,
                          }}
                        >
                          Get Started

                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    )}

                    <div
                      className="mt-3 flex items-center justify-center gap-2 border-t pb-1 pt-3 text-[9px] font-medium uppercase tracking-[0.13em]"
                      style={{
                        borderColor: COLORS.border,
                        color: COLORS.subtle,
                      }}
                    >
                      <GraduationCap
                        size={13}
                        strokeWidth={1.7}
                        style={{ color: COLORS.brass }}
                      />

                      <span>SELFLESS CE Student Portal</span>
                    </div>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultType={authModalType}
      />
    </>
  );
}