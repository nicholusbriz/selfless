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
  Bell,
  MessageSquare,
  Users,
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Calendar,
  Megaphone,
  Images,
  HeartHandshake,
  Building2,
  BookMarked,
  LifeBuoy,
  User,
  Briefcase,
  Code,
  BarChart3,
  Radio,
  FileText,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from "@/hooks/useNotifications";
import { useUnreadMessageCount } from "@/hooks/useMessages";
import { useOnlineUsers } from "@/lib/hooks/useOnlineUsers";

/* -------------------------------------------------------------------------- */
/* COLORS                                                                     */
/* -------------------------------------------------------------------------- */

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
  surface: "#FAFAF7",
  border: "#DADCD3",
  muted: "#6B7268",
  subtle: "#8A9088",
};

/* -------------------------------------------------------------------------- */
/* NAV ITEMS                                                                  */
/* -------------------------------------------------------------------------- */

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Tech Centers", href: "/tech-centers" },
  { label: "Features", href: "/features" },
  { label: "Help", href: "/help" },
  { label: "Privacy", href: "/privacy" },
];

/* -------------------------------------------------------------------------- */
/* DASHBOARD QUICK LINKS — grouped                                            */
/* -------------------------------------------------------------------------- */

const dashboardQuickLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    group: "Workspace",
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: <Users className="w-4 h-4" />,
    group: "Workspace",
  },
  {
    label: "Atbriz AI",
    href: "/dashboard/ai",
    icon: <Code className="w-4 h-4" />,
    group: "Workspace",
  },
  {
    label: "English Hub",
    href: "/dashboard/english-hub",
    icon: <BookOpen className="w-4 h-4" />,
    group: "Workspace",
  },
  {
    label: "Courses",
    href: "/dashboard/courses",
    icon: <BookMarked className="w-4 h-4" />,
    group: "Academics",
  },
  {
    label: "Grades",
    href: "/dashboard/grades",
    icon: <BarChart3 className="w-4 h-4" />,
    group: "Academics",
  },
  {
    label: "Internships",
    href: "/dashboard/internships",
    icon: <Briefcase className="w-4 h-4" />,
    group: "Academics",
  },
  {
    label: "Live Streaming",
    href: "/dashboard/live-streaming",
    icon: <Radio className="w-4 h-4" />,
    group: "Community",
  },
  {
    label: "Gallery",
    href: "/dashboard/gallery",
    icon: <Images className="w-4 h-4" />,
    group: "Community",
  },
  {
    label: "Support Groups",
    href: "/dashboard/support-groups",
    icon: <HeartHandshake className="w-4 h-4" />,
    group: "Community",
  },
  {
    label: "Temple Trips",
    href: "/dashboard/temple-trips",
    icon: <Building2 className="w-4 h-4" />,
    group: "Community",
  },
  {
    label: "Football Team",
    href: "/dashboard/football-team",
    icon: <Trophy className="w-4 h-4" />,
    group: "Community",
  },
  {
    label: "Cleaning Rota",
    href: "/dashboard/cleaning",
    icon: <Calendar className="w-4 h-4" />,
    group: "Community",
  },
  {
    label: "Chat",
    href: "/dashboard/messages",
    icon: <MessageSquare className="w-4 h-4" />,
    group: "Communication",
  },
  {
    label: "Announcements",
    href: "/dashboard/announcements",
    icon: <Megaphone className="w-4 h-4" />,
    group: "Communication",
  },
  {
    label: "Policies",
    href: "/dashboard/policies",
    icon: <FileText className="w-4 h-4" />,
    group: "Communication",
  },
  {
    label: "IT Support",
    href: "/dashboard/support",
    icon: <LifeBuoy className="w-4 h-4" />,
    group: "Communication",
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <User className="w-4 h-4" />,
    group: "Account",
  },
];

const dashboardGroups = [
  "Workspace",
  "Academics",
  "Community",
  "Communication",
  "Account",
];

/* -------------------------------------------------------------------------- */
/* TICKER PHRASES                                                             */
/* -------------------------------------------------------------------------- */

const tickerPhrases = [
  "One platform for learning, growth, and connection.",
  "One platform for progress, collaboration, and success.",
  "Built for students, tutors, and future leaders.",
  "Empowering learning, growing, and thriving.",
  "Driving progress, excellence, and innovation.",
  "All education in one place.",
];

/* -------------------------------------------------------------------------- */
/* MOTION VARIANTS                                                            */
/* -------------------------------------------------------------------------- */

const navMotion = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
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
/* MARQUEE STYLES                                                             */
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
      .header-scroll-area {
        scrollbar-width: thin;
        scrollbar-color: rgba(18,32,59,0.15) transparent;
      }
      .header-scroll-area::-webkit-scrollbar {
        width: 6px;
      }
      .header-scroll-area::-webkit-scrollbar-track {
        background: transparent;
      }
      .header-scroll-area::-webkit-scrollbar-thumb {
        background-color: rgba(18,32,59,0.15);
        border-radius: 999px;
      }
      @keyframes onlinePing {
        0% { transform: scale(1); opacity: 0.6; }
        75%, 100% { transform: scale(2.4); opacity: 0; }
      }
      .online-ping {
        animation: onlinePing 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
      }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/* TICKER STRIP                                                               */
/* -------------------------------------------------------------------------- */

function TickerStrip() {
  const repeated = [...tickerPhrases, ...tickerPhrases];

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: COLORS.navyDeep }}
    >
      <div className="flex min-h-8 items-stretch sm:min-h-9">
        <div
          className="flex shrink-0 items-center gap-1.5 px-3 sm:gap-2 sm:px-5"
          style={{
            backgroundColor: COLORS.navyDeep,
            boxShadow: "inset -1px 0 0 rgba(232,163,61,0.18)",
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
                className="flex items-center text-[11px] sm:text-[12.5px]"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                <span className="px-4 sm:px-8">{phrase}</span>
                <span style={{ color: "rgba(232,163,61,0.6)" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* NAV LINK                                                                   */
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
      className="group relative whitespace-nowrap px-4 py-2.5 text-[14px] font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#E8A33D] motion-reduce:transition-none"
      style={{
        color: active ? COLORS.white : "rgba(255,255,255,0.78)",
      }}
    >
      <span className="relative group-hover:text-white">
        {item.label}
      </span>

      <span
        className="pointer-events-none absolute inset-x-3.5 bottom-1 h-[2px] origin-center rounded-full transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none"
        style={{
          backgroundColor: COLORS.brassLight,
          transform: active ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* USER AVATAR                                                                */
/* -------------------------------------------------------------------------- */

function UserAvatar({ user, size = 36 }: { user: any; size?: number }) {
  if (user?.profileImageUrl) {
    return (
      <Image
        src={user.profileImageUrl}
        alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
        width={size}
        height={size}
        unoptimized
        className="object-cover rounded-full"
        style={{
          width: size,
          height: size,
          boxShadow: "0 0 0 2px rgba(255,255,255,0.14)",
        }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center text-white font-mono font-semibold rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS.brass,
        fontSize: Math.max(10, size * 0.36),
        boxShadow: "0 0 0 2px rgba(255,255,255,0.14)",
      }}
    >
      {user?.firstName?.charAt(0) || "U"}
      {user?.lastName?.charAt(0) || ""}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS ICONS                                                               */
/* -------------------------------------------------------------------------- */

function StatusIcons({
  unreadCount,
  unreadMessageCount,
  announcementCount,
  compact = false,
}: {
  unreadCount?: number;
  unreadMessageCount?: number;
  announcementCount?: number;
  compact?: boolean;
}) {
  const size = compact ? 15 : 17;
  const buttonSize = compact ? "w-9 h-9" : "w-10 h-10";
  const badgeSize = compact
    ? "min-w-[15px] h-[15px] text-[9px]"
    : "min-w-[16px] h-[16px] text-[9.5px]";

  return (
    <div className="flex items-center gap-0.5">
      <Link
        href="/dashboard/notifications"
        aria-label="Notifications"
        className={`relative flex items-center justify-center ${buttonSize} rounded-lg transition-colors hover:bg-white/10`}
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        <Bell size={size} strokeWidth={2} />
        {unreadCount && unreadCount > 0 ? (
          <span
            className={`absolute top-0.5 right-0.5 ${badgeSize} px-1 rounded-full text-white font-mono font-semibold flex items-center justify-center`}
            style={{
              backgroundColor: "#A4462F",
              boxShadow: `0 0 0 2px ${COLORS.navy}`,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Link>

      <Link
        href="/dashboard/messages"
        aria-label="Messages"
        className={`relative flex items-center justify-center ${buttonSize} rounded-lg transition-colors hover:bg-white/10`}
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        <MessageSquare size={size} strokeWidth={2} />
        {unreadMessageCount && unreadMessageCount > 0 ? (
          <span
            className={`absolute top-0.5 right-0.5 ${badgeSize} px-1 rounded-full text-white font-mono font-semibold flex items-center justify-center`}
            style={{
              backgroundColor: "#55705B",
              boxShadow: `0 0 0 2px ${COLORS.navy}`,
            }}
          >
            {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
          </span>
        ) : null}
      </Link>

      <Link
        href="/dashboard/announcements"
        aria-label="Announcements"
        className={`relative flex items-center justify-center ${buttonSize} rounded-lg transition-colors hover:bg-white/10`}
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        <Megaphone size={size} strokeWidth={2} />
        {announcementCount && announcementCount > 0 ? (
          <span
            className={`absolute top-0.5 right-0.5 ${badgeSize} px-1 rounded-full text-white font-mono font-semibold flex items-center justify-center`}
            style={{
              backgroundColor: "#3E5C76",
              boxShadow: `0 0 0 2px ${COLORS.navy}`,
            }}
          >
            {announcementCount > 99 ? "99+" : announcementCount}
          </span>
        ) : null}
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD DROPDOWN                                                         */
/* -------------------------------------------------------------------------- */

function DashboardDropdown({
  user,
  variant = "desktop",
}: {
  user: any;
  variant?: "desktop" | "mobile";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ======================================================================== */
  /* MOBILE VARIANT — fixed positioning, viewport-contained                   */
  /* ======================================================================== */

  if (variant === "mobile") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Open dashboard menu"
          className="group inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-bold transition-all duration-200 sm:px-3 sm:text-[12.5px]"
          style={{
            backgroundColor: COLORS.brassLight,
            color: COLORS.navy,
            boxShadow: "0 2px 8px rgba(232,163,61,0.25)",
          }}
        >
          <span className="whitespace-nowrap">Dashboard</span>
          <ChevronDown
            size={13}
            strokeWidth={2.6}
            className={`transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-3 right-3 top-[130px] z-[70] rounded-2xl shadow-[0_20px_50px_rgba(13,24,44,0.35)] flex flex-col overflow-hidden sm:left-auto sm:right-4 sm:w-[380px]"
              style={{
                backgroundColor: COLORS.surface,
                maxHeight: "calc(100vh - 150px)",
              }}
            >
              {/* Profile header — fixed at top */}
              <div
                className="flex items-center gap-3 p-4 shrink-0"
                style={{ backgroundColor: "white" }}
              >
                <UserAvatar user={user} size={44} />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[14.5px] font-semibold truncate"
                    style={{ color: COLORS.navy }}
                  >
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p
                    className="text-[10.5px] font-mono uppercase tracking-wide mt-0.5 truncate"
                    style={{ color: COLORS.muted }}
                  >
                    {user?.role || "Student"}
                    {user?.techCenter && ` • ${user.techCenter.name}`}
                  </p>
                </div>
              </div>

              {/* Scrollable links area */}
              <div className="flex-1 min-h-0 overflow-y-auto header-scroll-area p-3.5 space-y-4">
                {dashboardGroups.map((groupName) => {
                  const groupLinks = dashboardQuickLinks.filter(
                    (l) => l.group === groupName
                  );
                  if (groupLinks.length === 0) return null;

                  return (
                    <div key={groupName}>
                      <p
                        className="text-[10px] font-mono uppercase tracking-[0.16em] mb-2 px-1"
                        style={{ color: COLORS.subtle }}
                      >
                        {groupName}
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {groupLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 min-h-11 px-2.5 rounded-xl text-[13px] font-medium transition-colors hover:bg-white"
                            style={{ color: COLORS.navy }}
                          >
                            <span
                              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg"
                              style={{
                                color: COLORS.brass,
                                backgroundColor: "rgba(185,138,62,0.10)",
                              }}
                            >
                              {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer CTA — fixed at bottom */}
              <div
                className="p-3 shrink-0"
                style={{
                  backgroundColor: "white",
                  boxShadow: "inset 0 1px 0 rgba(18,32,59,0.06)",
                }}
              >
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-[13.5px] font-bold transition-transform hover:-translate-y-px"
                  style={{
                    backgroundColor: COLORS.navy,
                    color: COLORS.white,
                  }}
                >
                  <span>Go to Dashboard</span>
                  <ArrowUpRight size={15} strokeWidth={2.4} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ======================================================================== */
  /* DESKTOP VARIANT                                                          */
  /* ======================================================================== */

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="group inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none"
        style={{
          backgroundColor: COLORS.brassLight,
          color: COLORS.navy,
          boxShadow: "0 2px 10px rgba(232,163,61,0.28)",
        }}
      >
        <span>Dashboard</span>
        <ChevronDown
          size={15}
          strokeWidth={2.4}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-3 w-[580px] rounded-2xl shadow-[0_20px_50px_rgba(13,24,44,0.22)] z-[60] flex flex-col overflow-hidden"
            style={{
              backgroundColor: COLORS.surface,
              maxHeight: "calc(100vh - 120px)",
            }}
          >
            {/* Profile header — fixed at top */}
            <div className="p-4 pb-2 shrink-0">
              <div
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
                style={{ backgroundColor: "white" }}
              >
                <UserAvatar user={user} size={44} />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[14.5px] font-medium truncate"
                    style={{ color: COLORS.navy }}
                  >
                    {user?.firstName} {user?.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p
                      className="text-[11.5px] font-mono uppercase tracking-wide"
                      style={{ color: COLORS.muted }}
                    >
                      {user?.role || "Student"}
                    </p>
                    {user?.techCenter && (
                      <>
                        <span style={{ color: COLORS.border }}>•</span>
                        <p
                          className="text-[11.5px] truncate"
                          style={{ color: COLORS.muted }}
                        >
                          {user.techCenter.name}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable links area */}
            <div className="flex-1 min-h-0 overflow-y-auto header-scroll-area px-4 pb-2">
              <div className="space-y-4">
                {dashboardGroups.map((groupName) => {
                  const groupLinks = dashboardQuickLinks.filter(
                    (l) => l.group === groupName
                  );
                  if (groupLinks.length === 0) return null;

                  return (
                    <div key={groupName}>
                      <p
                        className="text-[10px] font-mono uppercase tracking-[0.16em] mb-2 px-1"
                        style={{ color: COLORS.subtle }}
                      >
                        {groupName}
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {groupLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors hover:bg-white"
                            style={{ color: COLORS.navy }}
                          >
                            <span
                              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg"
                              style={{
                                color: COLORS.brass,
                                backgroundColor: "rgba(185,138,62,0.10)",
                              }}
                            >
                              {link.icon}
                            </span>
                            <span className="truncate">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer CTA — fixed at bottom */}
            <div
              className="p-3 shrink-0"
              style={{
                backgroundColor: "white",
                boxShadow: "inset 0 1px 0 rgba(18,32,59,0.06)",
              }}
            >
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-[13.5px] font-bold transition-transform hover:-translate-y-px"
                style={{
                  backgroundColor: COLORS.navy,
                  color: COLORS.white,
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowUpRight size={15} strokeWidth={2.4} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ONLINE USERS INLINE — text only, no cards                                  */
/* -------------------------------------------------------------------------- */

function OnlineUsersInline({
  onlineUsers,
  currentUserId,
  limit = 6,
}: {
  onlineUsers: any[];
  currentUserId?: string;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!onlineUsers || onlineUsers.length === 0) return null;

  const visible = expanded ? onlineUsers : onlineUsers.slice(0, limit);
  const remaining = onlineUsers.length - limit;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Live dot */}
      <span className="relative flex size-2 shrink-0">
        <span
          className="online-ping absolute inline-flex size-full rounded-full"
          style={{ backgroundColor: "#4ADE80" }}
        />
        <span
          className="relative inline-flex size-2 rounded-full"
          style={{ backgroundColor: "#22C55E" }}
        />
      </span>

      {/* Count */}
      <span
        className="font-mono text-[10px] uppercase tracking-[0.14em] whitespace-nowrap shrink-0"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {onlineUsers.length} online
      </span>

      {/* Names */}
      <span className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        {visible.map((u, i) => {
          const isSelf = u.userId === currentUserId;
          const name = isSelf
            ? "You"
            : `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
              u.fullName ||
              "User";

          return (
            <span
              key={u.userId || i}
              className="flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap"
              style={{
                color: isSelf
                  ? COLORS.brassBright
                  : "rgba(255,255,255,0.82)",
              }}
            >
              {name}
              {i < visible.length - 1 && (
                <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
              )}
            </span>
          );
        })}

        {!expanded && remaining > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-[11px] font-mono whitespace-nowrap transition-colors hover:underline"
            style={{ color: COLORS.brassLight }}
          >
            +{remaining} more
          </button>
        )}

        {expanded && onlineUsers.length > limit && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-[11px] font-mono whitespace-nowrap transition-colors hover:underline"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            show less
          </button>
        )}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HEADER — THREE ROWS                                                        */
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

  const { data: unreadCount } = useUnreadNotificationCount(!!user);
  const { data: announcementCount } = useAnnouncementCount(!!user);
  const { data: unreadMessageCount } = useUnreadMessageCount();
  const onlineUsers = useOnlineUsers(user);

  const allOnlineUsers = user?.id
    ? [
        {
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          image: user.profileImageUrl,
          techCenter: user.techCenter,
          connectedAt: new Date().toISOString(),
        },
        ...onlineUsers.filter((u) => u.userId !== user?.id),
      ]
    : onlineUsers;

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
            ? "0 12px 36px rgba(13,24,44,0.28)"
            : "0 6px 22px rgba(13,24,44,0.16)",
        }}
      >
        {/* ================================================================== */}
        {/* ROW 1 — TICKER (HIDES ON SCROLL — mobile + desktop)                */}
        {/* ================================================================== */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            scrolled
              ? "max-h-0 opacity-0 -translate-y-full"
              : "max-h-12 opacity-100 translate-y-0"
          }`}
        >
          <TickerStrip />
        </div>

        {/* ================================================================== */}
        {/* ROW 2 — MAIN NAVIGATION BAR                                        */}
        {/* ================================================================== */}
        <div style={{ backgroundColor: COLORS.navy }}>
          <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8">
            {/* ---------- DESKTOP (lg+) ---------- */}
            <div
              className={`hidden items-center justify-between gap-4 transition-all duration-300 lg:flex ${
                scrolled ? "h-[64px]" : "h-[74px]"
              }`}
            >
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
                  className="h-auto w-[120px] object-contain transition-transform duration-300 group-hover:scale-[1.015] lg:w-[136px]"
                />
              </Link>

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

              <div className="flex shrink-0 items-center gap-2">
                {isLoading ? (
                  <div
                    aria-hidden="true"
                    className="h-10 w-28 animate-pulse rounded-xl"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  />
                ) : user ? (
                  <>
                    <StatusIcons
                      unreadCount={unreadCount}
                      unreadMessageCount={unreadMessageCount}
                      announcementCount={announcementCount}
                    />

                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 ml-1 px-2 py-1.5 rounded-xl transition-colors hover:bg-white/10"
                      style={{ color: "rgba(255,255,255,0.94)" }}
                    >
                      <UserAvatar user={user} size={34} />
                      <div className="hidden xl:block min-w-0">
                        <p className="text-[13.5px] font-medium leading-tight truncate max-w-[140px]">
                          {user?.firstName} {user?.lastName}
                        </p>
                        {user?.techCenter && (
                          <p className="text-[10px] font-mono uppercase tracking-wide opacity-80 truncate max-w-[140px]">
                            {user.techCenter.name}
                          </p>
                        )}
                      </div>
                    </Link>

                    <DashboardDropdown user={user} />
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuth("login")}
                      className="inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-semibold rounded-xl transition-colors duration-200 hover:bg-white/10 motion-reduce:transition-none"
                      style={{
                        color: "rgba(255,255,255,0.92)",
                        backgroundColor: "rgba(255,255,255,0.06)",
                      }}
                    >
                      <LogIn size={16} strokeWidth={2} />
                      Login
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuth("register")}
                      className="group inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none"
                      style={{
                        backgroundColor: COLORS.brassLight,
                        color: COLORS.navy,
                        boxShadow: "0 2px 10px rgba(232,163,61,0.28)",
                      }}
                    >
                      Get Started
                      <ArrowUpRight
                        size={15}
                        strokeWidth={2.2}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ---------- MOBILE / TABLET (up to lg) ---------- */}
            <div
              className={`flex items-center justify-between gap-2 transition-all duration-300 lg:hidden ${
                scrolled ? "h-[64px]" : "h-[74px]"
              }`}
            >
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
                  className="h-auto w-[96px] object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:w-[116px]"
                />
              </Link>

              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                {isLoading ? (
                  <div
                    aria-hidden="true"
                    className="h-9 w-9 animate-pulse rounded-lg"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                  />
                ) : user ? (
                  <>
                    <StatusIcons
                      unreadCount={unreadCount}
                      unreadMessageCount={unreadMessageCount}
                      announcementCount={announcementCount}
                      compact
                    />

                    <Link
                      href="/dashboard/profile"
                      aria-label="Open profile"
                      className="flex items-center justify-center rounded-xl transition-colors"
                    >
                      <UserAvatar user={user} size={32} />
                    </Link>

                    <DashboardDropdown user={user} variant="mobile" />
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="inline-flex h-9 items-center justify-center gap-1.5 px-3.5 text-[12.5px] font-semibold rounded-lg transition-colors"
                    style={{
                      color: COLORS.white,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <LogIn size={15} strokeWidth={2} />
                    Login
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((current) => !current)}
                  aria-label={
                    mobileMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  aria-expanded={mobileMenuOpen}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200"
                  style={{
                    color: COLORS.white,
                    backgroundColor: mobileMenuOpen
                      ? "rgba(232,163,61,0.24)"
                      : "rgba(255,255,255,0.08)",
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
                        <X size={19} strokeWidth={2.2} />
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
                        <Menu size={21} strokeWidth={2.2} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* ROW 3 — IDENTITY STRIP (always visible)                            */}
        {/* ================================================================== */}
        <div style={{ backgroundColor: COLORS.navy }}>
          <div className="mx-auto flex min-h-10 max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <p
              className="font-serif text-[13px] italic sm:text-[15px]"
              style={{ color: "rgba(247,246,242,0.9)" }}
            >
              Student Self Service Portal
            </p>

            <p
              className="font-mono text-[9px] uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.18em]"
              style={{ color: "rgba(232,163,61,0.9)" }}
            >
              All education in one place
            </p>
          </div>
        </div>

        {/* ================================================================== */}
        {/* ROW 4 — ONLINE USERS STRIP (always visible, desktop + mobile)      */}
        {/* ================================================================== */}
        {user && allOnlineUsers.length > 0 && (
          <div
            style={{
              backgroundColor: COLORS.navyDeep,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="mx-auto flex min-h-9 max-w-[1440px] items-center px-4 py-1.5 sm:px-6 lg:px-8 overflow-hidden">
              <OnlineUsersInline
                onlineUsers={allOnlineUsers}
                currentUserId={user?.id}
                limit={8}
              />
            </div>
          </div>
        )}

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
                className="fixed inset-0 top-[64px] z-40 lg:hidden"
                style={{ backgroundColor: "rgba(13,24,44,0.48)" }}
              />

              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{
                  duration: 0.24,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="absolute inset-x-3 top-full z-50 overflow-hidden rounded-2xl shadow-[0_22px_55px_rgba(13,24,44,0.3)] lg:hidden"
                style={{
                  backgroundColor: COLORS.surface,
                }}
              >
                <nav aria-label="Mobile navigation" className="p-3">
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
                          className="group flex min-h-12 items-center justify-between rounded-xl px-4 text-[14.5px] font-semibold transition-colors"
                          style={{
                            backgroundColor: active ? "white" : "transparent",
                            color: active ? COLORS.navy : "#4B564C",
                            boxShadow: active
                              ? "0 2px 10px rgba(18,32,59,0.06)"
                              : "none",
                          }}
                        >
                          <span className="flex items-center gap-3">
                            {active && (
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: COLORS.brass }}
                              />
                            )}
                            <span>{item.label}</span>
                          </span>

                          <ArrowUpRight
                            size={16}
                            strokeWidth={1.8}
                            className={`transition-all duration-200 ${
                              active
                                ? "opacity-100"
                                : "opacity-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-70"
                            }`}
                            style={{
                              color: active ? COLORS.brass : COLORS.subtle,
                            }}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}

                  <div className="h-3" />

                  {user ? (
                    <>
                      <div
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                        style={{
                          backgroundColor: "white",
                          boxShadow: "0 2px 10px rgba(18,32,59,0.06)",
                        }}
                      >
                        <UserAvatar user={user} size={46} />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[15px] font-semibold truncate"
                            style={{ color: COLORS.navy }}
                          >
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p
                            className="text-[11px] font-mono uppercase tracking-wide truncate mt-0.5"
                            style={{ color: COLORS.muted }}
                          >
                            {user?.role || "Student"}
                            {user?.techCenter && ` • ${user.techCenter.name}`}
                          </p>
                        </div>
                        <Link
                          href="/dashboard/profile"
                          onClick={closeMobileMenu}
                          aria-label="Open profile"
                          className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-[#F1F1EC]"
                          style={{ color: COLORS.brass }}
                        >
                          <ArrowUpRight size={16} strokeWidth={2.2} />
                        </Link>
                      </div>

                      <div
                        className="mt-3 px-3 py-3 rounded-xl text-center"
                        style={{
                          backgroundColor: "rgba(185,138,62,0.12)",
                        }}
                      >
                        <p
                          className="text-[10.5px] font-mono uppercase tracking-[0.14em]"
                          style={{ color: COLORS.brass }}
                        >
                          Tap the Dashboard button above to access your portal
                        </p>
                      </div>

                      <div
                        className="mt-4 flex items-center justify-center gap-2 pt-3 text-[10px] font-medium uppercase tracking-[0.15em]"
                        style={{
                          color: COLORS.subtle,
                          boxShadow: "inset 0 1px 0 rgba(18,32,59,0.06)",
                        }}
                      >
                        <GraduationCap
                          size={14}
                          strokeWidth={1.7}
                          style={{ color: COLORS.brass }}
                        />
                        <span>SELFLESS CE Student Portal</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openAuth("login")}
                          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[14px] font-semibold transition-colors hover:bg-[#F1F1EC]"
                          style={{
                            color: COLORS.navy,
                            boxShadow: "0 2px 10px rgba(18,32,59,0.06)",
                          }}
                        >
                          <LogIn size={16} />
                          Login
                        </button>

                        <button
                          type="button"
                          onClick={() => openAuth("register")}
                          className="flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-bold transition-transform hover:-translate-y-px"
                          style={{
                            backgroundColor: COLORS.brassLight,
                            color: COLORS.navy,
                            boxShadow: "0 2px 10px rgba(232,163,61,0.28)",
                          }}
                        >
                          Get Started
                          <ArrowUpRight size={16} />
                        </button>
                      </div>

                      <div
                        className="mt-4 flex items-center justify-center gap-2 pt-3 text-[10px] font-medium uppercase tracking-[0.15em]"
                        style={{
                          color: COLORS.subtle,
                          boxShadow: "inset 0 1px 0 rgba(18,32,59,0.06)",
                        }}
                      >
                        <GraduationCap
                          size={14}
                          strokeWidth={1.7}
                          style={{ color: COLORS.brass }}
                        />
                        <span>SELFLESS CE Student Portal</span>
                      </div>
                    </>
                  )}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultType={authModalType}
      />
    </>
  );
}