"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogIn,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";

// EXACT LINKS - UNCHANGED
const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Tech Centers", href: "/tech-centers" },
  { label: "Features", href: "/features" },
  { label: "Help", href: "/help" },
];

export default function Header2() {
  const pathname = usePathname();

  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">(
    "login"
  );
  const [isScrolled, setIsScrolled] = useState(false);

  const mobileOpen = openPathname === pathname;

  const { isAuthenticated } = useAuth();

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isActive = useCallback(
    (href: string) =>
      href === "/" ? pathname === "/" : pathname?.startsWith(href),
    [pathname]
  );

  // ------------------------------------------------------------
  // SCROLL STATE
  // ------------------------------------------------------------
  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        frame = 0;
      });
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  // ------------------------------------------------------------
  // LOCK BODY SCROLL WHEN MOBILE DRAWER IS OPEN
  // ------------------------------------------------------------
  useEffect(() => {
    if (!mobileOpen) return;

    const { body } = document;

    const gap =
      window.innerWidth - document.documentElement.clientWidth;

    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";

    if (gap > 0) {
      body.style.paddingRight = `${gap}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [mobileOpen]);

  // ------------------------------------------------------------
  // ESCAPE + OUTSIDE CLICK
  // ------------------------------------------------------------
  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPathname(null);
        menuButtonRef.current?.focus();
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !drawerRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setOpenPathname(null);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [mobileOpen]);

  // ------------------------------------------------------------
  // AUTH
  // ------------------------------------------------------------
  const openAuthModal = (type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
    setOpenPathname(null);
  };

  return (
    <>
      {/* ========================================================
          ACCESSIBILITY
      ======================================================== */}
      <a
        href="#main"
        className="
          sr-only
          focus:not-sr-only
          focus:fixed
          focus:left-4
          focus:top-4
          focus:z-[80]
          focus:rounded-lg
          focus:bg-[#E8A33D]
          focus:px-4
          focus:py-2.5
          focus:text-sm
          focus:font-semibold
          focus:text-[#10151C]
          focus:shadow-lg
        "
      >
        Skip to content
      </a>

      {/* ========================================================
          HEADER
      ======================================================== */}
      <header
        className={`
          fixed inset-x-0 top-0 z-50
          overflow-visible
          border-b
          transition-all
          duration-300
          motion-reduce:transition-none
          ${
            isScrolled
              ? "border-white/[0.12] shadow-[0_10px_35px_rgba(0,0,0,0.32)]"
              : "border-white/[0.08]"
          }
        `}
      >
        {/* ------------------------------------------------------
            BACKGROUND IMAGE
        ------------------------------------------------------ */}
        <div
          className="absolute inset-0 -z-20 bg-[#0B1016] bg-cover bg-center"
          style={{
            backgroundImage: "url('/header-image.jpg')",
          }}
        />

        {/* ------------------------------------------------------
            CONTROLLED DARK OVERLAY

            This keeps the background image visible while making
            white typography consistently readable.
        ------------------------------------------------------ */}
        <div
          className={`
            absolute inset-0 -z-10
            transition-all duration-300
            motion-reduce:transition-none
            ${
              isScrolled
                ? "bg-[#071018]/18"
                : "bg-[#071018]/8"
            }
          `}
        />

        {/* Subtle lower readability layer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-16 bg-[#071018]/5" />

        {/* ======================================================
            TOP TRUST BAR
        ====================================================== */}
        <div
          className="
            border-b
            border-white/[0.10]
            bg-[#060A0F]/15
          "
        >
          <div
            className="
              mx-auto
              flex
              min-h-9
              max-w-7xl
              items-center
              justify-center
              px-4
              sm:px-6
              lg:px-8
            "
          >
            <div className="flex items-center gap-2.5 text-center">
              {/* Status indicator */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-[#E8A33D]/70
                    motion-reduce:animate-none
                  "
                />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8A33D]" />
              </span>

              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  leading-none
                  tracking-[0.16em]
                  text-white/90
                  sm:text-[10.5px]
                "
              >
                Trusted across the{" "}
                <span className="text-white">
                  SELFLESS Tech Center Network
                </span>
              </p>

              <span className="hidden text-white/30 sm:inline">
                •
              </span>

              <p
                className="
                  hidden
                  text-[10px]
                  font-medium
                  leading-none
                  tracking-wide
                  text-white/65
                  md:block
                "
              >
                One platform for learning, progress, and connection.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            MAIN NAVIGATION
        ====================================================== */}
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            gap-6
            px-4
            py-3.5
            sm:px-6
            lg:px-8
          "
        >
          {/* ====================================================
              BRAND
          ==================================================== */}
          <Link
            href="/"
            aria-label="Selfless CE Portal home"
            className="
              group
              flex
              min-w-0
              shrink-0
              items-center
              gap-3.5
              rounded-xl
              outline-none
              focus-visible:ring-2
              focus-visible:ring-[#E8A33D]
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[#0B1016]
            "
          >
            {/* Logo */}
            <div
              className="
                relative
                h-10
                w-10
                shrink-0
                overflow-hidden
                rounded-xl
                border
                border-white/[0.18]
                bg-white/[0.06]
                p-0.5
                shadow-[0_4px_18px_rgba(0,0,0,0.22)]
                transition-all
                duration-300
                group-hover:border-[#E8A33D]/60
                group-hover:shadow-[0_5px_22px_rgba(232,163,61,0.16)]
                sm:h-11
                sm:w-11
                motion-reduce:transition-none
              "
            >
              <Image
                src="/freedom.png"
                alt="Selfless CE logo"
                fill
                priority
                sizes="44px"
                className="rounded-[10px] object-cover"
              />
            </div>

            {/* Brand typography */}
            <div className="flex min-w-0 flex-col justify-center">
              <div
                className="
                  flex
                  items-baseline
                  gap-1.5
                  whitespace-nowrap
                  text-[15px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.015em]
                  text-white
                  sm:text-[17px]
                "
              >
                <span className="transition-colors duration-200 group-hover:text-white">
                  Selfless CE
                </span>

                <span
                  className="
                    font-semibold
                    text-[#E8A33D]
                    transition-colors
                    duration-200
                    group-hover:text-[#F2B359]
                  "
                >
                  Portal
                </span>
              </div>

              <span
                className="
                  mt-1
                  text-[9px]
                  font-semibold
                  uppercase
                  leading-none
                  tracking-[0.18em]
                  text-white/[0.62]
                  sm:text-[10px]
                "
              >
                Student Self Service
              </span>
            </div>
          </Link>

          {/* ====================================================
              DESKTOP NAVIGATION
          ==================================================== */}
          <nav
            aria-label="Primary navigation"
            className="
              hidden
              items-center
              gap-0.5
              rounded-full
              border
              border-white/[0.10]
              bg-[#081018]/45
              px-1.5
              py-1.5
              shadow-[0_4px_20px_rgba(0,0,0,0.12)]
              backdrop-blur-md
              lg:flex
            "
          >
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`
                    group
                    relative
                    rounded-full
                    px-4
                    py-2
                    text-[12px]
                    font-semibold
                    leading-none
                    tracking-[0.005em]
                    outline-none
                    transition-all
                    duration-200
                    focus-visible:ring-2
                    focus-visible:ring-[#E8A33D]
                    motion-reduce:transition-none
                    ${
                      active
                        ? "bg-white/[0.11] text-white"
                        : "text-white/[0.78] hover:bg-white/[0.07] hover:text-white"
                    }
                  `}
                >
                  <span>{item.label}</span>

                  {/* Active / hover indicator */}
                  <span
                    className={`
                      pointer-events-none
                      absolute
                      inset-x-4
                      -bottom-0.5
                      h-px
                      origin-center
                      bg-[#E8A33D]
                      transition-transform
                      duration-300
                      motion-reduce:transition-none
                      ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* ====================================================
              DESKTOP ACTIONS
          ==================================================== */}
          <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="
                  group
                  relative
                  inline-flex
                  items-center
                  gap-2
                  overflow-hidden
                  rounded-xl
                  bg-[#E8A33D]
                  px-4
                  py-2.5
                  text-[12px]
                  font-bold
                  leading-none
                  tracking-wide
                  text-[#10151C]
                  shadow-[0_5px_20px_rgba(232,163,61,0.22)]
                  transition-all
                  duration-300
                  hover:bg-[#F0B052]
                  hover:shadow-[0_7px_25px_rgba(232,163,61,0.30)]
                  active:scale-[0.98]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#E8A33D]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-[#0B1016]
                  motion-reduce:transition-none
                "
              >
                <LayoutDashboard size={15} strokeWidth={2.3} />

                <span>Dashboard</span>

                <ArrowUpRight
                  size={14}
                  className="
                    transition-transform
                    duration-200
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                  "
                />
              </Link>
            ) : (
              <>
                {/* LOGIN */}
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.15]
                    bg-[#081018]/45
                    px-4
                    py-2.5
                    text-[12px]
                    font-semibold
                    leading-none
                    tracking-wide
                    text-white/[0.88]
                    backdrop-blur-md
                    transition-all
                    duration-200
                    hover:border-white/[0.25]
                    hover:bg-white/[0.10]
                    hover:text-white
                    active:scale-[0.98]
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-white/30
                    motion-reduce:transition-none
                  "
                >
                  <LogIn
                    size={14}
                    className="
                      text-white/70
                      transition-colors
                      duration-200
                      group-hover:text-white
                    "
                  />

                  <span>Login</span>
                </button>

                {/* GET STARTED */}
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#E8A33D]
                    px-4
                    py-2.5
                    text-[12px]
                    font-bold
                    leading-none
                    tracking-wide
                    text-[#10151C]
                    shadow-[0_5px_20px_rgba(232,163,61,0.22)]
                    transition-all
                    duration-300
                    hover:bg-[#F0B052]
                    hover:shadow-[0_7px_25px_rgba(232,163,61,0.30)]
                    active:scale-[0.98]
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#E8A33D]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-[#0B1016]
                    motion-reduce:transition-none
                  "
                >
                  <Sparkles
                    size={14}
                    className="
                      transition-transform
                      duration-300
                      group-hover:rotate-12
                    "
                  />

                  <span>Get Started</span>
                </button>
              </>
            )}
          </div>

          {/* ====================================================
              MOBILE MENU BUTTON
          ==================================================== */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() =>
              setOpenPathname(mobileOpen ? null : pathname)
            }
            aria-label={
              mobileOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            className="
              relative
              z-[60]
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.15]
              bg-[#081018]/55
              text-white/90
              backdrop-blur-md
              transition-all
              duration-200
              hover:border-white/[0.25]
              hover:bg-white/[0.10]
              hover:text-white
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#E8A33D]
              lg:hidden
              motion-reduce:transition-none
            "
          >
            <Menu
              size={20}
              className={`
                absolute
                transition-all
                duration-300
                motion-reduce:transition-none
                ${
                  mobileOpen
                    ? "rotate-90 scale-75 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }
              `}
            />

            <X
              size={20}
              className={`
                absolute
                transition-all
                duration-300
                motion-reduce:transition-none
                ${
                  mobileOpen
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-75 opacity-0"
                }
              `}
            />
          </button>
        </div>

        {/* ======================================================
            SUB HEADER
        ====================================================== */}
        <div
          aria-hidden={isScrolled}
          className={`
            hidden
            sm:block
            overflow-hidden
            border-t
            border-white/[0.08]
            bg-[#060A0F]/12
            transition-all
            duration-300
            motion-reduce:transition-none
            ${
              isScrolled
                ? "max-h-0 border-t-0 opacity-0"
                : "max-h-14 opacity-100"
            }
          `}
        >
          <div
            className="
              mx-auto
              flex
              max-w-7xl
              flex-col
              items-start
              gap-1
              px-4
              py-2.5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:gap-8
              sm:px-6
              lg:px-8
            "
          >
            <div className="flex items-center gap-2.5">
              <span className="h-4 w-1 shrink-0 rounded-full bg-[#E8A33D]" />

              <span
                className="
                  text-[11px]
                  font-bold
                  leading-none
                  tracking-wide
                  text-white/95
                "
              >
                Student Self Service Portal
              </span>

              <span className="text-white/30">
                •
              </span>

              <span
                className="
                  text-[11px]
                  font-medium
                  leading-none
                  text-white/65
                "
              >
                All education in one place
              </span>
            </div>

            <p
              className="
                w-full
                truncate
                text-[10.5px]
                font-medium
                leading-normal
                tracking-wide
                  text-white/[0.58]
                sm:text-right
              "
            >
              Centralized platform for BYU-Idaho courses, progress
              tracking, and the SELFLESS Tech Network.
            </p>
          </div>
        </div>

        {/* ======================================================
            MOBILE DRAWER
        ====================================================== */}
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          className={`
            absolute
            inset-x-0
            top-full
            z-[55]
            border-b
            border-white/[0.16]
            bg-[#071018]
            px-4
            py-6
            shadow-[0_20px_45px_rgba(0,0,0,0.40)]
            transition-all
            duration-300
            motion-reduce:transition-none
            lg:hidden
            ${
              mobileOpen
                ? "visible translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-2 opacity-0"
            }
          `}
        >
          <div className="mx-auto max-w-md space-y-5">
            {/* Mobile introduction */}
            <div
              className="
                rounded-xl
                border
                border-white/[0.14]
                bg-[#111B25]
                p-4
              "
            >
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="h-4 w-1 rounded-full bg-[#E8A33D]" />

                <p
                  className="
                    text-[12px]
                    font-bold
                    leading-none
                    tracking-wide
                    text-white
                  "
                >
                  Student Self Service Portal
                </p>
              </div>

              <p
                className="
                  pl-3.5
                  text-[11px]
                  font-medium
                  leading-relaxed
                    text-white/[0.62]
                "
              >
                Manage your BYU-Idaho courses and tech center
                connectivity seamlessly.
              </p>
            </div>

            {/* Mobile navigation */}
            <nav
              className="space-y-1"
              aria-label="Mobile navigation"
            >
              {navItems.map((item, i) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpenPathname(null)}
                    style={{
                      transitionDelay: mobileOpen
                        ? `${60 + i * 40}ms`
                        : "0ms",
                    }}
                    className={`
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      px-4
                      py-3.5
                      text-[13px]
                      font-semibold
                      leading-none
                      tracking-wide
                      transition-all
                      duration-300
                      motion-reduce:transition-none
                      ${
                        mobileOpen
                          ? "translate-y-0 opacity-100"
                          : "translate-y-1 opacity-0"
                      }
                      ${
                        active
                          ? "border border-[#E8A33D]/30 bg-[#E8A33D]/10 text-white"
                          : "text-white/[0.88] hover:bg-white/[0.10] hover:text-white"
                      }
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          ${
                            active
                              ? "bg-[#E8A33D]"
                              : "bg-white/25"
                          }
                        `}
                      />

                      {item.label}
                    </span>

                    <ArrowUpRight
                      size={15}
                      className={
                        active
                          ? "text-[#E8A33D]"
                          : "text-white/35"
                      }
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="h-px bg-white/[0.09]" />

            {/* Mobile actions */}
            <div className="grid grid-cols-2 gap-3">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpenPathname(null)}
                  className="
                    col-span-2
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#E8A33D]
                    py-3.5
                    text-[13px]
                    font-bold
                    leading-none
                    tracking-wide
                    text-[#10151C]
                    shadow-[0_5px_18px_rgba(232,163,61,0.20)]
                    active:scale-[0.99]
                  "
                >
                  <LayoutDashboard size={17} />

                  <span>Dashboard</span>

                  <ArrowUpRight size={15} />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuthModal("login")}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/[0.14]
                      bg-[#111B25]
                      py-3.5
                      text-[13px]
                      font-semibold
                      leading-none
                      tracking-wide
                      text-white/[0.88]
                      transition-colors
                      hover:bg-white/[0.08]
                      hover:text-white
                      active:scale-[0.99]
                    "
                  >
                    <LogIn size={16} />

                    <span>Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuthModal("register")}
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#E8A33D]
                      py-3.5
                      text-[13px]
                      font-bold
                      leading-none
                      tracking-wide
                      text-[#10151C]
                      shadow-[0_5px_18px_rgba(232,163,61,0.20)]
                      active:scale-[0.99]
                    "
                  >
                    <Sparkles size={16} />

                    <span>Get Started</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          AUTH MODAL
      ======================================================== */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultType={authModalType}
      />
    </>
  );
}

