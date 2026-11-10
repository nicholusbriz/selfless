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
import { useActivityTracker } from "@/lib/hooks/useActivityTracker";
import AuthModal from "@/components/auth/AuthModal";
import GiftIcon from "@/components/GiftIcon";
import {
  useUnreadNotificationCount,
  useAnnouncementCount,
} from "@/hooks/useNotifications";
import { useUnreadMessageCount } from "@/hooks/useMessages";
import { type OnlineUser } from "@/lib/hooks/useOnlineUsers";

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
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, group: "Workspace", roles: ["student", "teacher", "admin", "dev", "super_admin"] },
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
      @media (prefers-reduced-motion: reduce) {
        .selfless-marquee-track,
        .selfless-online-marquee { animation: none !important; }
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
}: {
  onlineUsers?: OnlineUser[];
  isLoggedIn?: boolean;
}) {
  const uniqueUsers = Array.from(
    new Map(onlineUsers.map((onlineUser) => [onlineUser.userId, onlineUser])).values(),
  );
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
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: COLORS.navyDeep }}>
      <div className="flex min-h-8 items-stretch sm:min-h-9">
        <div
          className="flex shrink-0 items-center gap-1.5 px-3 sm:gap-2 sm:px-5"
          style={{
            backgroundColor: COLORS.navyDeep,
            boxShadow: "inset -1px 0 0 rgba(232,163,61,0.18)",
            borderRight: `1px solid ${COLORS.brassLight}`,
          }}
        >
          <span className="size-1.5 rounded-full" style={{ backgroundColor: isLoggedIn && onlineNames.length > 0 ? "#22C55E" : COLORS.brassLight, boxShadow: `0 0 8px ${isLoggedIn && onlineNames.length > 0 ? "#22C55E" : COLORS.brassLight}` }} />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.2em]" style={{ color: COLORS.brassLight }}>
            {isLoggedIn ? `ONLINE · ${uniqueUsers.length}` : "SELFLESS"}
          </span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            className={
              isLoggedIn && onlineNames.length > 0
                ? "selfless-online-marquee"
                : "selfless-marquee-track"
            }
            aria-label={isLoggedIn ? `Online users: ${onlineNames.join(", ")}` : undefined}
          >
            {tickerItems.map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center text-[11px] sm:text-[12.5px]" style={{ color: "rgba(255,255,255,0.78)" }}>
                <span className="px-4 sm:px-8">{item}</span>
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

function NavLink({ item, active }: { item: { label: string; href: string }; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group relative shrink-0 whitespace-nowrap px-2.5 py-1.5 text-[12.5px] font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#E8A33D] motion-reduce:transition-none lg:py-2.5 xl:px-4 xl:text-[14px]"
      style={{ color: active ? COLORS.brassLight : "rgba(255,255,255,0.78)" }}
    >
      <span className="relative group-hover:text-white group-hover:transition-colors">{item.label}</span>
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
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        <Bell size={size} strokeWidth={2.2} />
        {renderBadge(unreadCount || 0, "#A4462F")}
      </Link>

      {/* Messages */}
      <Link
        href="/dashboard/messages"
        aria-label="Messages"
        className={`relative flex items-center justify-center ${buttonSize} rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95`}
        style={{ color: "rgba(255,255,255,0.85)" }}
      >
        <MessageSquare size={size} strokeWidth={2.2} />
        {renderBadge(unreadMessageCount || 0, "#55705B")}
      </Link>

      {/* Announcements */}
      <Link
        href="/dashboard/announcements"
        aria-label="Announcements"
        className={`relative flex items-center justify-center ${buttonSize} rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-105 active:scale-95`}
        style={{ color: "rgba(255,255,255,0.85)" }}
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
          className="group inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-bold transition-all duration-200"
          style={{ backgroundColor: COLORS.brassLight, color: COLORS.navy, boxShadow: "0 2px 8px rgba(232,163,61,0.25)" }}
        >
          <LayoutDashboard size={15} strokeWidth={2.4} />
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
              className="fixed left-3 right-3 top-[130px] z-[70] rounded-2xl shadow-[0_20px_50px_rgba(13,24,44,0.35)] flex flex-col overflow-hidden sm:left-auto sm:right-4 sm:w-[380px]"
              style={{ backgroundColor: COLORS.surface, maxHeight: "calc(100vh - 150px)" }}
            >
              <div className="flex items-center gap-3 p-4 shrink-0" style={{ backgroundColor: "white" }}>
                <UserAvatar user={user} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold truncate" style={{ color: COLORS.navy }}>{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10.5px] font-mono uppercase tracking-wide mt-0.5 truncate" style={{ color: COLORS.muted }}>
                    {user?.role || "Student"}{user?.techCenter && ` • ${user.techCenter.name}`}
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto header-scroll-area p-3.5 space-y-4">
                {dashboardGroups.map((groupName) => {
                  const groupLinks = roleLinks.filter((l) => l.group === groupName);
                  if (groupLinks.length === 0) return null;
                  return (
                    <div key={groupName}>
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-2 px-1" style={{ color: COLORS.subtle }}>{groupName}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {groupLinks.map((link) => (
                          <Link key={`${link.href}-${link.group}`} href={link.href} onClick={() => setIsOpen(false)} className="group/link flex min-h-[82px] flex-col items-start justify-between rounded-xl border p-3 text-left text-[12px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]" style={{ color: COLORS.navy, borderColor: COLORS.border, backgroundColor: "rgba(255,255,255,0.62)" }}>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors group-hover/link:bg-[#12203B] group-hover/link:text-white" style={{ color: COLORS.brass, backgroundColor: "rgba(185,138,62,0.10)" }}>{link.icon}</span>
                            <span className="w-full truncate">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 shrink-0" style={{ backgroundColor: "white", boxShadow: "inset 0 1px 0 rgba(18,32,59,0.06)" }}>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-[13.5px] font-bold transition-transform hover:-translate-y-px" style={{ backgroundColor: COLORS.navy, color: COLORS.white }}>
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
        aria-label="Open dashboard navigation"
        className="group inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-bold rounded-xl transition-all duration-200 hover:-translate-y-px motion-reduce:transition-none border"
        style={{
          backgroundColor: "rgba(232, 163, 61, 0.1)",
          color: COLORS.brassLight,
          borderColor: "rgba(232, 163, 61, 0.3)",
        }}
      >
        <LayoutDashboard size={16} strokeWidth={2.3} />
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
            className="absolute right-0 top-full mt-3 w-[580px] rounded-2xl shadow-[0_20px_50px_rgba(13,24,44,0.22)] z-[60] flex flex-col overflow-hidden"
            style={{ backgroundColor: COLORS.surface, maxHeight: "calc(100vh - 120px)" }}
          >
            <div className="p-4 pb-2 shrink-0">
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ backgroundColor: "white" }}>
                <UserAvatar user={user} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-medium truncate" style={{ color: COLORS.navy }}>{user?.firstName} {user?.lastName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11.5px] font-mono uppercase tracking-wide" style={{ color: COLORS.muted }}>{user?.role || "Student"}</p>
                    {user?.techCenter && (
                      <>
                        <span style={{ color: COLORS.border }}>•</span>
                        <p className="text-[11.5px] truncate" style={{ color: COLORS.muted }}>{user.techCenter.name}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto header-scroll-area px-4 pb-2">
              <div className="space-y-4">
                {dashboardGroups.map((groupName) => {
                  const groupLinks = roleLinks.filter((l) => l.group === groupName);
                  if (groupLinks.length === 0) return null;
                  return (
                    <div key={groupName}>
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] mb-2 px-1" style={{ color: COLORS.subtle }}>{groupName}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {groupLinks.map((link) => (
                          <Link key={`${link.href}-${link.group}`} href={link.href} onClick={() => setIsOpen(false)} className="group/link flex min-h-[88px] flex-col items-start justify-between rounded-xl border p-3 text-left text-[12px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B98A3E]" style={{ color: COLORS.navy, borderColor: COLORS.border, backgroundColor: "rgba(255,255,255,0.62)" }}>
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors group-hover/link:bg-[#12203B] group-hover/link:text-white" style={{ color: COLORS.brass, backgroundColor: "rgba(185,138,62,0.10)" }}>{link.icon}</span>
                            <span className="w-full truncate">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 shrink-0" style={{ backgroundColor: "white", boxShadow: "inset 0 1px 0 rgba(18,32,59,0.06)" }}>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3 text-[13.5px] font-bold transition-transform hover:-translate-y-px" style={{ backgroundColor: COLORS.navy, color: COLORS.white }}>
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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
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
          boxShadow: scrolled ? "0 12px 36px rgba(13,24,44,0.28)" : "0 6px 22px rgba(13,24,44,0.16)",
        }}
      >
        {/* ROW 1 — TICKER */}
        <div className="overflow-hidden">
          <TickerStrip onlineUsers={user ? onlineUsers : []} isLoggedIn={Boolean(user?.id)} />
        </div>

        {/* IDENTITY STRIP — ABOVE THE NAVIGATION LINKS */}
        <div style={{ backgroundColor: COLORS.navy }}>
          <div className="mx-auto flex min-h-9 max-w-[1440px] items-center justify-between gap-3 px-4 py-1.5 sm:px-6 lg:px-8">
            <p className="font-serif text-[13px] italic sm:text-[15px]" style={{ color: "rgba(247,246,242,0.9)" }}>Student Self Service Portal</p>
            <div className="flex items-center gap-2">
              <span className="hidden h-px w-6 bg-[#E8A33D]/50 sm:block" />
              <p className="font-serif text-[12px] italic sm:text-[14px]" style={{ color: "rgba(232,163,61,0.95)" }}>Nurturing resilient minds</p>
            </div>
          </div>
        </div>

        {/* ROW 2 — MAIN NAVIGATION BAR */}
        <div style={{ backgroundColor: COLORS.navy }}>
          <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-5 lg:px-8">
            {/* ---------- DESKTOP (lg+) ---------- */}
            <div className={`hidden items-center justify-between gap-4 transition-all duration-300 lg:flex ${scrolled ? "h-[64px]" : "h-[74px]"}`}>
              {/* Enhanced Logo Area */}
              <Link href="/" aria-label="SELFLESS home" className="group flex shrink-0 items-center relative pl-3">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full" style={{ backgroundColor: COLORS.brassLight, boxShadow: `0 0 6px ${COLORS.brassLight}` }} />
                <div className="relative h-10 w-[130px] lg:h-11 lg:w-[150px]">
                  <Image src="/freedom.png" alt="SELFLESS" fill priority className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]" />
                </div>
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
                      <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.94)" }}>
                        <UserAvatar user={user} size={36} />
                        <div className="hidden xl:block min-w-0">
                          <p className="text-[13.5px] font-semibold leading-tight truncate max-w-[120px]">{user?.firstName} {user?.lastName}</p>
                          {user?.techCenter && (
                            <p className="text-[10px] font-mono uppercase tracking-wider opacity-70 truncate max-w-[120px] mt-0.5">{user.techCenter.name}</p>
                          )}
                        </div>
                      </Link>
                      <DashboardDropdown user={user} />
                    </div>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => openAuth("login")} className="inline-flex h-10 items-center gap-2 px-4 text-[13.5px] font-semibold rounded-xl transition-colors duration-200 hover:bg-white/10 motion-reduce:transition-none" style={{ color: "rgba(255,255,255,0.92)", backgroundColor: "rgba(255,255,255,0.06)" }}>
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
                <div className="relative h-9 w-[100px] sm:h-10 sm:w-[120px]">
                  <Image src="/freedom.png" alt="SELFLESS" fill priority className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]" />
                </div>
              </Link>

              <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                {isLoading ? (
                  <div aria-hidden="true" className="h-9 w-9 animate-pulse rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                ) : user ? (
                  <>
                    <StatusIcons unreadCount={unreadCount} unreadMessageCount={unreadMessageCount} announcementCount={announcementCount} compact />
                    {pathname.startsWith('/dashboard') && <GiftIcon />}
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

      <div aria-hidden="true" className="h-[152px] sm:h-[156px] lg:h-[146px]" />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultType={authModalType} />
    </>
  );
}