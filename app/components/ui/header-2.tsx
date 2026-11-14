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
  UserCog,
  School,
  Shield,
  Award,
  DollarSign,
  Settings,
  Key,
  Database,
  Check,
  Mail,
} from "lucide-react";

import { useAuth } from "@/lib/hooks/useAuth";
import { siteTheme } from "@/lib/site-theme";
import { useActivityTracker } from "@/lib/hooks/useActivityTracker";
import AuthModal from "@/components/auth/AuthModal";

import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from "@/hooks/useNotifications";
import { useUnreadMessageCount } from "@/hooks/useMessages";
import { type OnlineUser } from "@/lib/hooks/useOnlineUsers";

/* -------------------------------------------------------------------------- */
/* COLORS                                                                     */
/* -------------------------------------------------------------------------- */

const COLORS = siteTheme;

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
  { label: "Students", href: "/dashboard/students", icon: <Users className="w-5 h-5" />, group: "Workspace", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Connections", href: "/dashboard/connections", icon: <User className="w-5 h-5" />, group: "Workspace", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Atbriz AI", href: "/dashboard/ai", icon: <Code className="w-5 h-5" />, group: "Workspace", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "English Hub", href: "/dashboard/english-hub", icon: <BookOpen className="w-5 h-5" />, group: "Workspace", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Courses", href: "/dashboard/courses", icon: <BookMarked className="w-5 h-5" />, group: "Academics", roles: ["student", "teacher", "admin", "dev"] },
  { label: "Course Units", href: "/dashboard/course-units", icon: <BookMarked className="w-5 h-5" />, group: "Academics", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "My Grades", href: "/dashboard/grades", icon: <BarChart3 className="w-5 h-5" />, group: "Academics", roles: ["student", "teacher", "admin", "dev"] },
  { label: "Tutors", href: "/dashboard/admin/teachers", icon: <GraduationCap className="w-5 h-5" />, group: "Academics", roles: ["student", "teacher", "admin"] },
  { label: "Internships", href: "/dashboard/internships", icon: <Briefcase className="w-5 h-5" />, group: "Opportunities", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Live Streaming", href: "/dashboard/live-streaming", icon: <Radio className="w-5 h-5" />, group: "Media", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Posts", href: "/dashboard/gallery", icon: <Images className="w-5 h-5" />, group: "Media", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Media Approvals", href: "/dashboard/media-approvals", icon: <Check className="w-5 h-5" />, group: "Media", roles: ["dev", "super_admin"] },
  { label: "Support Groups", href: "/dashboard/support-groups", icon: <HeartHandshake className="w-5 h-5" />, group: "Community", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Temple Trips", href: "/dashboard/temple-trips", icon: <Building2 className="w-5 h-5" />, group: "Community", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Sports", href: "/dashboard/football-team", icon: <Trophy className="w-5 h-5" />, group: "Community", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Cleaning Rota", href: "/dashboard/cleaning", icon: <Calendar className="w-5 h-5" />, group: "Campus", roles: ["student", "teacher", "admin"] },
  { label: "Chat", href: "/dashboard/messages", icon: <MessageSquare className="w-5 h-5" />, group: "Communication", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Announcements", href: "/dashboard/announcements", icon: <Megaphone className="w-5 h-5" />, group: "Communication", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: <Bell className="w-5 h-5" />, group: "Communication", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Policy Book", href: "/dashboard/policies", icon: <FileText className="w-5 h-5" />, group: "Information", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "IT Support", href: "/dashboard/support", icon: <LifeBuoy className="w-5 h-5" />, group: "Information", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "My Profile", href: "/dashboard/profile", icon: <User className="w-5 h-5" />, group: "Account", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
  { label: "Admin Dashboard", href: "/dashboard/admin", icon: <Shield className="w-5 h-5" />, group: "Administration", roles: ["admin"] },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" />, group: "Administration", roles: ["admin"] },
  { label: "Manage Tutors", href: "/dashboard/admin/teachers", icon: <UserCog className="w-5 h-5" />, group: "Administration", roles: ["admin"] },
  { label: "Assign Grades", href: "/dashboard/teacher/grades", icon: <Award className="w-5 h-5" />, group: "Administration", roles: ["admin", "teacher"] },
  { label: "Tuition", href: "/dashboard/admin/tuition", icon: <DollarSign className="w-5 h-5" />, group: "Administration", roles: ["admin"] },
  { label: "Tech Center", href: "/dashboard/admin/tech-centers", icon: <School className="w-5 h-5" />, group: "Administration", roles: ["admin"] },
  { label: "Cleaning Management", href: "/dashboard/admin/cleaning", icon: <Settings className="w-5 h-5" />, group: "Administration", roles: ["admin"] },
  { label: "Manage Grades", href: "/dashboard/manage-grades", icon: <Award className="w-5 h-5" />, group: "System", roles: ["dev", "super_admin"] },
  { label: "System Overview", href: "/dashboard/super-admin", icon: <Shield className="w-5 h-5" />, group: "System", roles: ["dev", "super_admin"] },
  { label: "All Tech Centers", href: "/dashboard/super-admin/centers", icon: <School className="w-5 h-5" />, group: "System", roles: ["dev", "super_admin"] },
  { label: "All Users", href: "/dashboard/super-admin/users", icon: <Users className="w-5 h-5" />, group: "System", roles: ["dev", "super_admin"] },
  { label: "Send Emails", href: "/dashboard/super-admin/email", icon: <Mail className="w-5 h-5" />, group: "System", roles: ["dev", "super_admin"] },
  { label: "Dev Dashboard", href: "/dashboard/dev", icon: <Code className="w-5 h-5" />, group: "Developers", roles: ["dev"] },
  { label: "Cleaning Management", href: "/dashboard/dev/cleaning", icon: <Settings className="w-5 h-5" />, group: "Developers", roles: ["dev", "super_admin"] },
  { label: "English Class", href: "/dashboard/dev/english-hub", icon: <BookOpen className="w-5 h-5" />, group: "Developers", roles: ["dev", "super_admin"] },
  { label: "Password Resets", href: "/dashboard/dev/password-resets", icon: <Key className="w-5 h-5" />, group: "Developers", roles: ["dev"] },
  { label: "Knowledge Base", href: "/dashboard/dev/knowledge-base", icon: <Database className="w-5 h-5" />, group: "Developers", roles: ["dev"] },
  { label: "Activity Logs", href: "/dashboard/dev/logs", icon: <FileText className="w-5 h-5" />, group: "Developers", roles: ["dev"] },
];

const dashboardGroups = [
  "Workspace",
  "Academics",
  "Opportunities",
  "Media",
  "Community",
  "Campus",
  "Communication",
  "Information",
  "Administration",
  "System",
  "Developers",
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
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
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
      @keyframes selflessOnlineMarquee {
        from { transform: translateX(100%); }
        to { transform: translateX(-100%); }
      }
      .selfless-online-marquee {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        animation: selflessOnlineMarquee 32s linear infinite;
        will-change: transform;
      }
      .selfless-online-marquee:hover { animation-play-state: paused; }
      @keyframes selflessAvatarPop {
        from { opacity: 0; transform: scale(0.3) translateY(8px); }
        60% { opacity: 1; transform: scale(1.08) translateY(-1px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .selfless-avatar-pop {
        animation: selflessAvatarPop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      @media (prefers-reduced-motion: reduce) {
        .selfless-marquee-track,
        .selfless-online-marquee,
        .selfless-avatar-pop { animation: none !important; }
      }
      .header-scroll-area {
        scrollbar-width: thin;
        scrollbar-color: rgba(18,32,59,0.15) transparent;
      }
      .header-scroll-area::-webkit-scrollbar { width: 6px; }
      .header-scroll-area::-webkit-scrollbar-track { background: transparent; }
      .header-scroll-area::-webkit-scrollbar-thumb {
        background-color: rgba(18,32,59,0.15);
        border-radius: 999px;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .header-nav-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .header-nav-scroll::-webkit-scrollbar { display: none; }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/* TICKER STRIP                                                               */
/* -------------------------------------------------------------------------- */

function TickerStrip({
  onlineUsers = [],
  isLoggedIn = false,
  overlay = false,
}: {
  onlineUsers?: OnlineUser[];
  isLoggedIn?: boolean;
  overlay?: boolean;
}) {
  const uniqueUsers = Array.from(
    new Map(onlineUsers.map((onlineUser) => [onlineUser.userId, onlineUser])).values(),
  );
  const [currentOnlineIndex, setCurrentOnlineIndex] = useState(0);

  useEffect(() => {
    if (uniqueUsers.length <= 1) {
      setCurrentOnlineIndex(0);
      return;
    }
    setCurrentOnlineIndex((previous) => previous % uniqueUsers.length);
  }, [uniqueUsers.length]);

  useEffect(() => {
    if (uniqueUsers.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentOnlineIndex((previous) => (previous + 1) % uniqueUsers.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [uniqueUsers.length]);

  const onlineNames = uniqueUsers.map(
    (onlineUser) =>
      `${onlineUser.firstName || ""} ${onlineUser.lastName || ""}`.trim() ||
      onlineUser.fullName ||
      "User",
  );
  const tickerItems =
    onlineNames.length > 0
      ? onlineNames
      : isLoggedIn
        ? ["Connecting to online users..."]
        : tickerPhrases;
  const showOnline = isLoggedIn && onlineNames.length > 0;


  return (
    <div className={`relative overflow-hidden ${overlay ? "backdrop-blur-md" : ""}`} style={{ backgroundColor: overlay ? "rgba(13,24,44,0.55)" : COLORS.navyDeep }}>
      <div className="flex min-h-9 items-stretch sm:min-h-10">
        <div
          className="flex shrink-0 items-center gap-2.5 px-3 sm:gap-3 sm:px-5"
          style={{
            backgroundColor: overlay ? "rgba(13,24,44,0.7)" : COLORS.navyDeep,
            boxShadow: "inset -1px 0 0 rgba(232,163,61,0.18)",
            borderRight: `1px solid ${COLORS.brassLight}`,
          }}
        >
          <span
            className="relative flex size-2 items-center justify-center"
            aria-hidden="true"
          >
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: showOnline ? "#22C55E" : COLORS.brassLight }}
            />
            <span
              className="relative inline-flex size-1.5 rounded-full"
              style={{ backgroundColor: showOnline ? "#22C55E" : COLORS.brassLight, boxShadow: `0 0 8px ${showOnline ? "#22C55E" : COLORS.brassLight}` }}
            />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.2em]" style={{ color: COLORS.brassLight }}>
            SELFLESS
          </span>
        </div>

        <div
          className="relative flex-1 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div
            className={
              showOnline
                ? "flex h-full items-center lg:justify-center"
                : "selfless-marquee-track"
            }
            aria-label={showOnline ? `Online users: ${onlineNames.join(", ")}` : undefined}
          >
            {showOnline ? (
              <AnimatePresence mode="wait">
                {(() => {
                  const onlineUser = uniqueUsers[currentOnlineIndex % uniqueUsers.length];
                  if (!onlineUser) return null;

                  const name =
                    `${onlineUser.firstName || ""} ${onlineUser.lastName || ""}`.trim() ||
                    onlineUser.fullName ||
                    "User";
                  const initials = name
                    .split(" ")
                    .map((part) => part.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <motion.div
                      key={onlineUser.userId}
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-2.5 px-4 sm:px-6"
                    >
                      <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/25">
                        {onlineUser.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={onlineUser.image}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span
                            className="flex h-full w-full items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: COLORS.brass }}
                          >
                            {initials}
                          </span>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#0D182C] bg-[#22C55E]" />
                      </span>

                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-[11px] font-bold sm:text-[12px]" style={{ color: COLORS.brassLight }}>
                          {name}
                        </span>
                        <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px]">
                          <span className="font-semibold" style={{ color: "#22C55E" }}>
                            Online
                          </span>
                          {onlineUser.techCenter?.name && (
                            <>
                              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                              <span className="truncate" style={{ color: "rgba(255,255,255,0.65)" }}>
                                {onlineUser.techCenter.name}
                              </span>
                            </>
                          )}
                        </span>
                      </span>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            ) : (
              tickerItems.map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center text-[11px] sm:text-[12.5px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                  <span className="px-4 sm:px-8">{item}</span>
                  <span style={{ color: "rgba(232,163,61,0.6)" }}>·</span>
                </span>
              ))
            )}
          </div>
        </div>

        <a
          href="https://selfless-ce.web.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 px-3 text-[9px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 hover:bg-white/10 sm:px-4 sm:text-[10px]"
          style={{
            color: "rgba(255,255,255,0.75)",
            borderLeft: "1px solid rgba(232,163,61,0.18)",
          }}
        >
          Official site
          <ArrowUpRight size={10} strokeWidth={2.4} />
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* NAV LINK                                                                   */
/* -------------------------------------------------------------------------- */

function NavLink({ item, active }: { item: { label: string; href: string }; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group relative shrink-0 whitespace-nowrap px-2.5 py-1.5 text-[12.5px] font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#E8A33D] motion-reduce:transition-none lg:py-2.5 xl:px-4 xl:text-[14px]"
      style={{ color: active ? COLORS.brassLight : "rgba(255,255,255,0.95)" }}
    >
      <span className="relative group-hover:text-white group-hover:transition-colors">{item.label}</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-2.5 bottom-0 h-[2px] rounded-full transition-transform duration-300 motion-reduce:transition-none"
        style={{
          backgroundColor: COLORS.brassLight,
          transform: active ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
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
        style={{ width: size, height: size, boxShadow: "0 0 0 2px rgba(255,255,255,0.14)" }}
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
/* STATUS ICONS (ENHANCED)                                                    */
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
  const size = compact ? 16 : 18;
  const buttonSize = compact ? "w-9 h-9" : "w-10 h-10";
  const badgeSize = compact ? "min-w-[16px] h-[16px] text-[9px]" : "min-w-[18px] h-[18px] text-[10px]";

  const renderBadge = (count: number, color: string) => {
    if (!count || count <= 0) return null;
    return (
      <span
        className={`absolute -top-0.5 -right-0.5 ${badgeSize} px-1 rounded-full text-white font-mono font-bold flex items-center justify-center border-2`}
        style={{ backgroundColor: color, borderColor: COLORS.navy }}
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <div className="flex items-center gap-1">
      {/* Notifications */}
      <Link
        href="/dashboard/notifications"
        aria-label="Notifications"
        className={`relative flex items-center justify-center ${buttonSize} rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95`}
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        <Bell size={size} strokeWidth={2.2} />
        {renderBadge(unreadCount || 0, "#A4462F")}
      </Link>

      {/* Messages */}
      <Link
        href="/dashboard/messages"
        aria-label="Messages"
        className={`relative flex items-center justify-center ${buttonSize} rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95`}
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        <MessageSquare size={size} strokeWidth={2.2} />
        {renderBadge(unreadMessageCount || 0, "#55705B")}
      </Link>

      {/* Announcements */}
      <Link
        href="/dashboard/announcements"
        aria-label="Announcements"
        className={`relative flex items-center justify-center ${buttonSize} rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95`}
        style={{ color: "rgba(255,255,255,0.78)" }}
      >
        <Megaphone size={size} strokeWidth={2.2} />
        {renderBadge(announcementCount || 0, "#3E5C76")}
      </Link>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD DROPDOWN                                                         */
/* -------------------------------------------------------------------------- */

function DashboardDropdown({ user, variant = "desktop" }: { user: any; variant?: "desktop" | "mobile" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userRole =
    typeof user?.role === "string"
      ? user.role.toLowerCase().replace(/[\s-]+/g, "_")
      : "student";
  const roleLinks = dashboardQuickLinks.filter((link) =>
    link.roles.includes(userRole)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ======================================================================== */
  /* MOBILE VARIANT                                                           */
  /* ======================================================================== */
  if (variant === "mobile") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Open dashboard menu"
          className="group inline-flex h-9 items-center gap-1.5 px-3 text-[12.5px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none border"
          style={{
            backgroundColor: "rgba(232, 163, 61, 0.1)",
            color: COLORS.brassLight,
            borderColor: "rgba(232, 163, 61, 0.3)",
          }}
        >
          <span className="whitespace-nowrap">Dashboard</span>
          <ChevronDown size={14} strokeWidth={2.6} className={`transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-3 right-3 top-[120px] z-[70] rounded-xl border shadow-[0_16px_40px_rgba(13,24,44,0.3)] flex flex-col overflow-hidden sm:left-auto sm:right-4 sm:w-[360px]"
              style={{ backgroundColor: "white", borderColor: COLORS.border, maxHeight: "calc(100vh - 140px)" }}
            >
              {/* Slim user header */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 shrink-0" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                <UserAvatar user={user} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: COLORS.navy }}>{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wide truncate" style={{ color: COLORS.muted }}>
                    {user?.role || "Student"}{user?.techCenter ? ` • ${user.techCenter.name}` : ""}
                  </p>
                </div>
              </div>

              {/* Flat link grid — no categories */}
              <div className="flex-1 min-h-0 overflow-y-auto header-scroll-area px-2 py-2">
                <div className="grid grid-cols-2 gap-x-1">
                  {roleLinks.map((link) => (
                    <Link
                      key={`${link.href}-${link.label}`}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="truncate rounded-md px-2 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-[#12203B]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]"
                      style={{ color: COLORS.navy }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="shrink-0 px-3 py-2.5" style={{ borderTop: `1px solid ${COLORS.border}` }}>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold transition-colors hover:opacity-90" style={{ backgroundColor: COLORS.navy, color: COLORS.white }}>
                  <span>Go to Dashboard</span>
                  <ArrowUpRight size={14} strokeWidth={2.4} />
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
        aria-label="Open dashboard navigation"
        className="group inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none border"
        style={{
          backgroundColor: "rgba(232, 163, 61, 0.1)",
          color: COLORS.brassLight,
          borderColor: "rgba(232, 163, 61, 0.3)",
        }}
      >
        <span>Dashboard</span>
        <ChevronDown size={15} strokeWidth={2.4} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-[640px] rounded-xl border shadow-[0_16px_40px_rgba(13,24,44,0.22)] z-[60] flex flex-col overflow-hidden"
            style={{ backgroundColor: "white", borderColor: COLORS.border, maxHeight: "calc(100vh - 100px)" }}
          >
            {/* Slim user header */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 shrink-0" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <UserAvatar user={user} size={30} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: COLORS.navy }}>{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] font-mono uppercase tracking-wide truncate" style={{ color: COLORS.muted }}>
                  {user?.role || "Student"}{user?.techCenter ? ` • ${user.techCenter.name}` : ""}
                </p>
              </div>
            </div>

            {/* Flat link grid — no categories */}
            <div className="flex-1 min-h-0 overflow-y-auto header-scroll-area px-2 py-2">
              <div className="grid grid-cols-3 gap-x-1">
                {roleLinks.map((link) => (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="truncate rounded-md px-2 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-[#12203B]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]"
                    style={{ color: COLORS.navy }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="shrink-0 px-3 py-2.5" style={{ borderTop: `1px solid ${COLORS.border}` }}>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-[12.5px] font-bold transition-colors hover:opacity-90" style={{ backgroundColor: COLORS.navy, color: COLORS.white }}>
                <span>Go to Dashboard</span>
                <ArrowUpRight size={14} strokeWidth={2.4} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HEADER — THREE ROWS                                                        */
/* -------------------------------------------------------------------------- */

interface Header2Props {
  onlineUsers?: OnlineUser[];
  isLoadingOnlineUsers?: boolean;
}

export default function Header2({ onlineUsers = [], isLoadingOnlineUsers = false }: Header2Props) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">("login");

  const headerRef = useRef<HTMLElement | null>(null);

  const { data: unreadCount } = useUnreadNotificationCount(!!user);
  const { data: announcementCount } = useAnnouncementCount(!!user);
  const { data: unreadMessageCount } = useUnreadMessageCount();
  useActivityTracker(Boolean(user?.id));

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 18);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);


  const openAuth = (type: "login" | "register") => {
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const isOverlayPage = pathname === "/";
  const overlayHeader = isOverlayPage && !scrolled;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <MarqueeStyles />

      <header
        ref={headerRef}
        className={`${isOverlayPage ? "fixed inset-x-0 top-0" : "sticky top-0"} z-50 transition-all duration-300 ${overlayHeader ? "backdrop-blur-md" : ""}`}
        style={{
          backgroundColor: overlayHeader ? "transparent" : COLORS.navy,
          boxShadow: overlayHeader ? "none" : scrolled ? "0 12px 36px rgba(13,24,44,0.28)" : "0 6px 22px rgba(13,24,44,0.16)",
        }}
      >
        {/* Gradient scrim — keeps header readable over hero images */}
        {overlayHeader && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{
              background:
                "linear-gradient(to bottom, rgba(13,24,44,0.35) 0%, rgba(13,24,44,0.18) 55%, transparent 100%)",
            }}
          />
        )}

        {/* ROW 1 — TICKER */}
        <div className="relative overflow-hidden">
          <TickerStrip onlineUsers={user ? onlineUsers : []} isLoggedIn={Boolean(user?.id)} overlay={overlayHeader} />
        </div>

        {/* ROW 2 — MAIN NAVIGATION BAR */}
        <div
          className={overlayHeader ? "relative backdrop-blur-md" : ""}
          style={{
            backgroundColor: overlayHeader ? "transparent" : COLORS.navy,
            borderBottom: overlayHeader ? "1px solid rgba(255,255,255,0.10)" : undefined,
          }}
        >
          <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8">
            {/* ---------- DESKTOP (lg+) ---------- */}
            <div className={`hidden items-center justify-between gap-4 transition-all duration-300 lg:flex ${scrolled ? "h-[64px]" : "h-[74px]"}`}>
              {/* Enhanced Logo Area */}
              <Link href="/" aria-label="SELFLESS home" className="group flex shrink-0 items-center relative pl-3">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: COLORS.brassLight, boxShadow: `0 0 6px ${COLORS.brassLight}` }} />
                <div className="flex flex-col">
                  <div className="relative h-10 w-[130px] lg:h-11 lg:w-[150px]">
                    <Image src="/freedom.png" alt="SELFLESS" fill priority className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]" />
                  </div>
                  <span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.24em] text-white/50 sm:text-[9px]" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    Student Portal
                  </span>
                </div>
                <span className="ml-4 hidden border-l border-white/15 pl-4 font-serif text-[13px] italic text-white/70 2xl:block" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                  Nurturing resilient minds
                </span>
              </Link>

              <motion.nav initial="hidden" animate="visible" variants={navMotion} aria-label="Primary navigation" className="flex min-w-0 flex-1 items-center justify-center">
                <div className="flex items-center">
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} active={isActive(item.href)} />
                  ))}
                </div>
              </motion.nav>

              <div className="flex shrink-0 items-center gap-2">
                {isLoading ? (
                  <div aria-hidden="true" className="h-10 w-28 animate-pulse rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                ) : user ? (
                  <>
                    <StatusIcons unreadCount={unreadCount} unreadMessageCount={unreadMessageCount} announcementCount={announcementCount} />
                    <div className="flex items-center gap-3 pl-2 border-l border-white/10 ml-1">
                      <Link href="/dashboard/profile" aria-label="Open profile" className="flex items-center rounded-xl transition-colors hover:bg-white/10">
                        <UserAvatar user={user} size={36} />
                      </Link>
                      <DashboardDropdown user={user} />
                    </div>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => openAuth("login")} className="inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-semibold rounded-xl transition-colors duration-200 hover:bg-white/10 motion-reduce:transition-none" style={{ color: "rgba(255,255,255,0.92)", backgroundColor: "rgba(255,255,255,0.06)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                      <LogIn size={16} strokeWidth={2} /> Login
                    </button>
                    <button type="button" onClick={() => openAuth("register")} className="group inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none" style={{ backgroundColor: COLORS.brassLight, color: COLORS.navy, boxShadow: "0 2px 10px rgba(232,163,61,0.28)" }}>
                      Get Started <ArrowUpRight size={15} strokeWidth={2.2} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ---------- MOBILE / TABLET (up to lg) ---------- */}
            <div className={`flex items-center justify-between gap-2 transition-all duration-300 lg:hidden ${scrolled ? "h-[50px]" : "h-[54px]"}`}>
              {/* Enhanced Mobile Logo */}
              <Link href="/" aria-label="SELFLESS home" className="group flex min-w-0 shrink items-center relative pl-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ backgroundColor: COLORS.brassLight, boxShadow: `0 0 4px ${COLORS.brassLight}` }} />
                <div className="flex flex-col">
                  <div className="relative h-9 w-[100px] sm:h-10 sm:w-[120px]">
                    <Image src="/freedom.png" alt="SELFLESS" fill priority className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]" />
                  </div>
                  <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-[0.22em] text-white/50 sm:text-[8px]" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                    Student Portal
                  </span>
                </div>
              </Link>

              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                {isLoading ? (
                  <div aria-hidden="true" className="h-9 w-9 animate-pulse rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                ) : user ? (
                  <>
                    <StatusIcons unreadCount={unreadCount} unreadMessageCount={unreadMessageCount} announcementCount={announcementCount} compact />
                    {/* GiftIcon removed — dashboard layout renders it */}
                    <Link href="/dashboard/profile" aria-label="Open profile" className="flex items-center justify-center rounded-xl transition-colors hover:bg-white/10">
                      <UserAvatar user={user} size={34} />
                    </Link>
                    <DashboardDropdown user={user} variant="mobile" />
                  </>
                ) : (
                  <button type="button" onClick={() => openAuth("login")} className="inline-flex h-9 items-center justify-center gap-1.5 px-3.5 text-[12.5px] font-semibold rounded-lg transition-colors" style={{ color: COLORS.white, backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <LogIn size={15} strokeWidth={2} /> Login
                  </button>
                )}
              </div>
            </div>

            <nav aria-label="Primary navigation" className="header-nav-scroll flex min-w-0 items-center overflow-x-auto whitespace-nowrap py-0 lg:hidden">
              <div className="mx-auto flex min-w-max items-center">
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </div>
            </nav>
          </div>
        </div>

      </header>


      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultType={authModalType} />
    </>
  );
}