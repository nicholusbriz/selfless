"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Award, ChevronRight, Circle,
  Globe, Grid, List, Loader2, Megaphone,
  Package, Phone, PlayCircle, Plus, Save, Search, Shield, Shirt,
  Stethoscope, Target, Trophy, User, UserCog, Users, X, Zap, AlertTriangle
} from "lucide-react";
import {
  useTeam, useRegisterForTeam, useLeaveTeam, useUpdateTeamMembership,
} from "@/hooks/useTeam";
import { useAuth } from "@/lib/hooks/useAuth";
import { getResponseError, isRecord } from "../response-guards";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────────── */

export interface TeamMember {
  id: string;
  userId: string;
  techCenterId: string;
  teamType: string;
  teamRole: string;
  jerseyNumber: number | null;
  position: string | null;
  isActive: boolean;
  joinedAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
    phoneNumber: string | null;
  };
  techCenter: { id: string; name: string; country: { name: string } | null };
}

export interface TeamData {
  teamMembers: TeamMember[];
  currentUserMembership: TeamMember | null;
  totalMembers: number;
}

interface TeamContext {
  techCenterId: string | null;
  techCenter: {
    id: string;
    name: string;
    country: { name: string } | null;
  } | null;
}

function isTeamContext(value: unknown): value is TeamContext {
  return (
    isRecord(value) &&
    (typeof value.techCenterId === "string" || value.techCenterId === null) &&
    (value.techCenter === null ||
      (isRecord(value.techCenter) &&
        typeof value.techCenter.id === "string" &&
        typeof value.techCenter.name === "string" &&
        (value.techCenter.country === null ||
          (isRecord(value.techCenter.country) &&
            typeof value.techCenter.country.name === "string"))))
  );
}

export type SportType = "FOOTBALL" | "VOLLEYBALL" | "NETBALL" | "BASKETBALL" | "ATHLETICS";
export type TeamRole = "PLAYER" | "COACH" | "KIT_MANAGER" | "CHEERLEADER" | "TEAM_MANAGER" | "MEDICAL" | "REFEREE";

interface SportConfig {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  positions: string[];
  lines: { label: string; filter: (pos: string | null) => boolean }[];
}

interface RoleConfig {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  rank: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sports & Roles
   ───────────────────────────────────────────────────────────────────────────── */

const sports: Record<SportType, SportConfig> = {
  FOOTBALL: {
    icon: Trophy,
    name: "Football",
    description: "Official squad roster, tactical lineups & club statistics.",
    positions: ["Goalkeeper", "Defender", "Midfielder", "Forward"],
    lines: [
      { label: "Goalkeepers", filter: (p) => !!p && /goalkeeper|gk/i.test(p) },
      { label: "Defenders", filter: (p) => !!p && /defender|cb|rb|lb|back/i.test(p) },
      { label: "Midfielders", filter: (p) => !!p && /midfield|cm|cam|cdm|winger/i.test(p) },
      { label: "Forwards", filter: (p) => !!p && /forward|striker|st|cf|attacker/i.test(p) },
    ],
  },
  VOLLEYBALL: {
    icon: Circle,
    name: "Volleyball",
    description: "Build your squad and dominate the court.",
    positions: ["Setter", "Libero", "Outside Hitter", "Middle Blocker", "Opposite"],
    lines: [],
  },
  NETBALL: {
    icon: Target,
    name: "Netball",
    description: "Every position. Every play. One team.",
    positions: ["Goal Shooter", "Goal Attack", "Wing Attack", "Center", "Wing Defense", "Goal Defense"],
    lines: [],
  },
  BASKETBALL: {
    icon: Globe,
    name: "Basketball",
    description: "Court roster and team performance hub.",
    positions: ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"],
    lines: [],
  },
  ATHLETICS: {
    icon: Zap,
    name: "Athletics",
    description: "Track and field club representatives.",
    positions: ["Sprinter", "Distance Runner", "Jumper", "Thrower", "Hurdler", "Relay Runner"],
    lines: [],
  },
};

const roles: Record<TeamRole, RoleConfig> = {
  PLAYER: { icon: Users, name: "Player", rank: "Squad" },
  COACH: { icon: Trophy, name: "Head Coach", rank: "Technical Staff" },
  KIT_MANAGER: { icon: Package, name: "Kit Manager", rank: "Club Staff" },
  CHEERLEADER: { icon: Megaphone, name: "Supporter Lead", rank: "Club Staff" },
  TEAM_MANAGER: { icon: UserCog, name: "General Manager", rank: "Management" },
  MEDICAL: { icon: Stethoscope, name: "Medical Officer", rank: "Medical Staff" },
  REFEREE: { icon: Award, name: "Official", rank: "Match Official" },
};

const roleBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  PLAYER: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-700" },
  COACH: { bg: "bg-amber-600", text: "text-white", border: "border-amber-700" },
  KIT_MANAGER: { bg: "bg-orange-600", text: "text-white", border: "border-orange-700" },
  CHEERLEADER: { bg: "bg-pink-600", text: "text-white", border: "border-pink-700" },
  TEAM_MANAGER: { bg: "bg-blue-600", text: "text-white", border: "border-blue-700" },
  MEDICAL: { bg: "bg-red-600", text: "text-white", border: "border-red-700" },
  REFEREE: { bg: "bg-slate-600", text: "text-white", border: "border-slate-700" },
};

const roleShortLabels: Record<string, string> = {
  PLAYER: "PLAYER",
  COACH: "COACH",
  KIT_MANAGER: "KIT",
  CHEERLEADER: "SUPPORT",
  TEAM_MANAGER: "MANAGER",
  MEDICAL: "MEDICAL",
  REFEREE: "OFFICIAL",
};

const positionAbbrev: Record<string, string> = {
  goalkeeper: "GK",
  defender: "DEF",
  midfielder: "MID",
  forward: "ATT",
  front: "FRONT",
  back: "BACK",
  shooter: "SHOOT",
  center: "CTR",
  defense: "DEF",
  guard: "GUARD",
  sprinter: "SPR",
  thrower: "THR",
  jumper: "JMP",
  hurdler: "HRD",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Formations
   ───────────────────────────────────────────────────────────────────────────── */

type FormationLine = { label: string; count: number; roleType: string };
type FormationSet = Record<string, { name: string; lines: FormationLine[] }>;

const footballFormations: FormationSet = {
  "4-3-3": {
    name: "4-3-3 Attack",
    lines: [
      { label: "Attack", count: 3, roleType: "forward" },
      { label: "Midfield", count: 3, roleType: "midfielder" },
      { label: "Defense", count: 4, roleType: "defender" },
      { label: "Goalkeeper", count: 1, roleType: "goalkeeper" },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1 Fluid",
    lines: [
      { label: "Striker", count: 1, roleType: "forward" },
      { label: "Attacking Midfield", count: 3, roleType: "midfielder" },
      { label: "Holding Midfield", count: 2, roleType: "midfielder" },
      { label: "Defense", count: 4, roleType: "defender" },
      { label: "Goalkeeper", count: 1, roleType: "goalkeeper" },
    ],
  },
  "4-4-2": {
    name: "4-4-2 Classic",
    lines: [
      { label: "Attack", count: 2, roleType: "forward" },
      { label: "Midfield", count: 4, roleType: "midfielder" },
      { label: "Defense", count: 4, roleType: "defender" },
      { label: "Goalkeeper", count: 1, roleType: "goalkeeper" },
    ],
  },
};

const volleyballFormations: FormationSet = {
  "5-1": {
    name: "5-1 System",
    lines: [
      { label: "Front Row", count: 3, roleType: "front" },
      { label: "Back Row", count: 3, roleType: "back" },
    ],
  },
  "6-2": {
    name: "6-2 System",
    lines: [
      { label: "Front Row", count: 3, roleType: "front" },
      { label: "Back Row", count: 3, roleType: "back" },
    ],
  },
  "4-2": {
    name: "4-2 System",
    lines: [
      { label: "Front Row", count: 3, roleType: "front" },
      { label: "Back Row", count: 3, roleType: "back" },
    ],
  },
};

const netballFormations: FormationSet = {
  STANDARD: {
    name: "Standard 7",
    lines: [
      { label: "Goal Circle", count: 2, roleType: "shooter" },
      { label: "Centre Court", count: 3, roleType: "center" },
      { label: "Defensive Third", count: 2, roleType: "defense" },
    ],
  },
};

const basketballFormations: FormationSet = {
  STANDARD: {
    name: "Starting Five",
    lines: [
      { label: "Backcourt", count: 2, roleType: "guard" },
      { label: "Frontcourt", count: 2, roleType: "forward" },
      { label: "Paint", count: 1, roleType: "center" },
    ],
  },
  "SMALL-BALL": {
    name: "Small Ball",
    lines: [
      { label: "Backcourt", count: 2, roleType: "guard" },
      { label: "Wings", count: 2, roleType: "forward" },
      { label: "Paint", count: 1, roleType: "center" },
    ],
  },
};

const athleticsFormations: FormationSet = {
  RELAY: {
    name: "4x100 Relay",
    lines: [
      { label: "Leg 1", count: 1, roleType: "sprinter" },
      { label: "Leg 2", count: 1, roleType: "sprinter" },
      { label: "Leg 3", count: 1, roleType: "sprinter" },
      { label: "Anchor", count: 1, roleType: "sprinter" },
    ],
  },
  FIELD: {
    name: "Field Events",
    lines: [
      { label: "Throwers", count: 2, roleType: "thrower" },
      { label: "Jumpers", count: 2, roleType: "jumper" },
      { label: "Hurdlers", count: 1, roleType: "hurdler" },
    ],
  },
};

const formationsBySport: Record<SportType, FormationSet> = {
  FOOTBALL: footballFormations,
  VOLLEYBALL: volleyballFormations,
  NETBALL: netballFormations,
  BASKETBALL: basketballFormations,
  ATHLETICS: athleticsFormations,
};

const defaultFormationKey: Record<SportType, string> = {
  FOOTBALL: "4-3-3",
  VOLLEYBALL: "5-1",
  NETBALL: "STANDARD",
  BASKETBALL: "STANDARD",
  ATHLETICS: "RELAY",
};

const courtBg: Record<SportType, string> = {
  FOOTBALL: "bg-emerald-700 border-emerald-900",
  VOLLEYBALL: "bg-orange-700 border-orange-900",
  NETBALL: "bg-teal-700 border-teal-900",
  BASKETBALL: "bg-amber-800 border-amber-950",
  ATHLETICS: "bg-red-800 border-red-950",
};

const ease = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */

function initials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function fullName(member: TeamMember) {
  return `${member.user.firstName} ${member.user.lastName}`.trim();
}

function matchesRoleType(position: string | null, roleType: string): boolean {
  const pos = (position || "").toLowerCase();
  if (!pos) return false;
  switch (roleType) {
    case "goalkeeper": return /goalkeeper|gk/i.test(pos);
    case "defender": return /defender|cb|rb|lb|back/i.test(pos);
    case "midfielder": return /midfield|cm|cdm|cam|wing/i.test(pos);
    case "forward": return /forward|striker|st|cf|attack/i.test(pos);
    default: return false;
  }
}

function matchesSportRoleType(
  sport: SportType,
  position: string | null,
  roleType: string
): boolean {
  const pos = (position || "").toLowerCase();
  if (!pos) return false;

  switch (sport) {
    case "FOOTBALL":
      return matchesRoleType(position, roleType);

    case "VOLLEYBALL":
      if (roleType === "front") {
        return /setter|outside hitter|opposite|middle blocker|front/i.test(pos);
      }
      if (roleType === "back") {
        return /libero|defensive specialist|back/i.test(pos);
      }
      return !/libero/i.test(pos);

    case "NETBALL":
      if (roleType === "shooter") return /goal shooter|goal attack|shooter|gs|ga/i.test(pos);
      if (roleType === "center") return /wing attack|wing defense|center|wa|wd|\bc\b/i.test(pos);
      if (roleType === "defense") return /goal defense|goal keeper|defense|gd|gk/i.test(pos);
      return false;

    case "BASKETBALL":
      if (roleType === "guard") return /point guard|shooting guard|guard|pg|sg/i.test(pos);
      if (roleType === "forward") return /small forward|power forward|forward|sf|pf/i.test(pos);
      if (roleType === "center") return /center|\bc\b/i.test(pos);
      return false;

    case "ATHLETICS":
      if (roleType === "sprinter") return /sprint|relay/i.test(pos);
      if (roleType === "thrower") return /throw|shot|javelin|discus|hammer/i.test(pos);
      if (roleType === "jumper") return /jump|long|triple|high|pole/i.test(pos);
      if (roleType === "hurdler") return /hurdle/i.test(pos);
      return false;

    default:
      return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Small Components
   ───────────────────────────────────────────────────────────────────────────── */

function RoleBadge({ teamRole, size = "sm" }: { teamRole: string; size?: "xs" | "sm" }) {
  const style = roleBadgeStyles[teamRole] ?? roleBadgeStyles.PLAYER;
  const label = roleShortLabels[teamRole] ?? "PLAYER";
  const sizeClass = size === "xs" ? "text-[8px] px-1 py-0.5" : "text-[9px] px-1.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center rounded font-bold uppercase tracking-wider ${style.bg} ${style.text} ${sizeClass}`}
    >
      {label}
    </span>
  );
}

function PlayerAvatar({
  member,
  size = "md",
  className = "",
}: {
  member: TeamMember;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-20 w-20 text-2xl",
  }[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-600 select-none ${sizeClasses} ${className}`}
    >
      {member.user.profileImageUrl ? (
        <Image
          src={member.user.profileImageUrl}
          alt={fullName(member)}
          fill
          unoptimized
          sizes="80px"
          className="object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-emerald-50 font-bold text-[#55705B]">
          {initials(member.user.firstName, member.user.lastName)}
        </div>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const reduce = useReducedMotion();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease }}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${
          wide ? "max-w-2xl" : "max-w-sm"
        }`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Court Markings
   ───────────────────────────────────────────────────────────────────────────── */

function FootballPitchMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-white/50 sm:inset-4" />
      <div className="pointer-events-none absolute left-3 right-3 top-1/2 h-[2px] -translate-y-1/2 bg-white/50 sm:left-4 sm:right-4" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50 sm:h-32 sm:w-32" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
      <div className="pointer-events-none absolute left-1/2 top-3 h-20 w-44 -translate-x-1/2 border-2 border-t-0 border-white/50 sm:top-4 sm:h-24 sm:w-56" />
      <div className="pointer-events-none absolute left-1/2 top-3 h-9 w-24 -translate-x-1/2 border-2 border-t-0 border-white/50 sm:top-4 sm:h-11 sm:w-32" />
      <div className="pointer-events-none absolute left-1/2 top-16 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80 sm:top-20" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-20 w-44 -translate-x-1/2 border-2 border-b-0 border-white/50 sm:bottom-4 sm:h-24 sm:w-56" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-9 w-24 -translate-x-1/2 border-2 border-b-0 border-white/50 sm:bottom-4 sm:h-11 sm:w-32" />
      <div className="pointer-events-none absolute bottom-16 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80 sm:bottom-20" />
    </>
  );
}

function VolleyballCourtMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-3 rounded border-2 border-white/60 sm:inset-4" />
      <div className="pointer-events-none absolute left-3 right-3 top-1/2 h-[3px] -translate-y-1/2 bg-white sm:left-4 sm:right-4" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-full -translate-x-1/2 -translate-y-1/2 bg-white/20" />
      <div className="pointer-events-none absolute left-3 right-3 top-[35%] h-[1.5px] bg-white/50 sm:left-4 sm:right-4" />
      <div className="pointer-events-none absolute bottom-[35%] left-3 right-3 h-[1.5px] bg-white/50 sm:left-4 sm:right-4" />
    </>
  );
}

function NetballCourtMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-3 rounded border-2 border-white/60 sm:inset-4" />
      <div className="pointer-events-none absolute left-3 right-3 top-1/3 h-[1.5px] bg-white/60 sm:left-4 sm:right-4" />
      <div className="pointer-events-none absolute bottom-1/3 left-3 right-3 h-[1.5px] bg-white/60 sm:left-4 sm:right-4" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 sm:h-20 sm:w-20" />
      <div className="pointer-events-none absolute left-1/2 top-3 h-24 w-24 -translate-x-1/2 rounded-full border-2 border-white/60 sm:top-4 sm:h-28 sm:w-28" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full border-2 border-white/60 sm:bottom-4 sm:h-28 sm:w-28" />
    </>
  );
}

function BasketballCourtMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-3 rounded border-2 border-white/60 sm:inset-4" />
      <div className="pointer-events-none absolute left-3 right-3 top-1/2 h-[2px] bg-white/60 sm:left-4 sm:right-4" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 sm:h-20 sm:w-20" />
      <div className="pointer-events-none absolute left-1/2 top-3 h-24 w-32 -translate-x-1/2 border-2 border-t-0 border-white/60 sm:top-4 sm:h-28 sm:w-40" />
      <div className="pointer-events-none absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-orange-400 sm:top-4" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-24 w-32 -translate-x-1/2 border-2 border-b-0 border-white/60 sm:bottom-4 sm:h-28 sm:w-40" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-orange-400 sm:bottom-4" />
      <div className="pointer-events-none absolute left-1/2 top-3 h-40 w-64 -translate-x-1/2 rounded-b-full border-2 border-t-0 border-white/40 sm:top-4 sm:h-44 sm:w-72" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-40 w-64 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-white/40 sm:bottom-4 sm:h-44 sm:w-72" />
    </>
  );
}

function AthleticsTrackMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-3 rounded-3xl border-2 border-white/60 sm:inset-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="pointer-events-none absolute left-3 right-3 h-[1.5px] bg-white/40 sm:left-4 sm:right-4"
          style={{ top: `${10 + i * 12}%` }}
        />
      ))}
      <div className="pointer-events-none absolute bottom-3 left-6 top-3 w-[2px] bg-white/70 sm:left-8" />
      <div className="pointer-events-none absolute bottom-3 right-6 top-3 w-[2px] bg-white/70 sm:right-8" />
    </>
  );
}

function CourtMarkings({ sport }: { sport: SportType }) {
  switch (sport) {
    case "FOOTBALL": return <FootballPitchMarkings />;
    case "VOLLEYBALL": return <VolleyballCourtMarkings />;
    case "NETBALL": return <NetballCourtMarkings />;
    case "BASKETBALL": return <BasketballCourtMarkings />;
    case "ATHLETICS": return <AthleticsTrackMarkings />;
    default: return <FootballPitchMarkings />;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────────────────────────────────────── */

export default function FootballTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();

  // Form states
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [position, setPosition] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editJerseyNumber, setEditJerseyNumber] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [selectedRole, setSelectedRole] = useState<TeamRole>("PLAYER");

  // UI states
  const [selectedSport, setSelectedSport] = useState<SportType>("FOOTBALL");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [positionFilter, setPositionFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formationKey, setFormationKey] = useState<string>(defaultFormationKey.FOOTBALL);

  const teamContextQuery = useQuery<TeamContext>({
    queryKey: ["team-context", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/team/context");
      const result: unknown = await response.json();
      if (!response.ok) {
        throw new Error(getResponseError(result, "Failed to load team context"));
      }
      if (!isTeamContext(result)) {
        throw new Error("Invalid team context response");
      }
      return result;
    },
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
  });
  const techCenterId = teamContextQuery.data?.techCenterId ?? null;

  const { data, isLoading: teamLoading, error: teamError } = useTeam(techCenterId, selectedSport) as {
    data: TeamData | null | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const isLoading = teamContextQuery.isLoading || (Boolean(techCenterId) && teamLoading);
  const error = (teamContextQuery.error as Error | null) ?? teamError;

  if (error) {
    console.error("Football team page error:", error);
  }

  const registerMutation = useRegisterForTeam();
  const leaveMutation = useLeaveTeam();
  const updateMutation = useUpdateTeamMembership();

  useEffect(() => {
    if (!techCenterId) return;
    (["FOOTBALL", "VOLLEYBALL", "NETBALL", "BASKETBALL", "ATHLETICS"] as SportType[]).forEach((sport) => {
      queryClient.prefetchQuery({
        queryKey: ["team", techCenterId, sport],
        queryFn: async () => {
          const response = await fetch(`/api/team/${techCenterId}/${sport}`);
          if (!response.ok) throw new Error("Failed to load team data");
          return response.json() as Promise<TeamData>;
        },
        staleTime: 10 * 60 * 1000,
      });
    });
  }, [techCenterId, queryClient]);

  const teamMembers = useMemo(() => data?.teamMembers ?? [], [data?.teamMembers]);
  const currentUserMembership = data?.currentUserMembership ?? null;
  const totalMembers = data?.totalMembers ?? teamMembers.length;
  const sport = sports[selectedSport];
  const techCenterName =
    teamMembers[0]?.techCenter?.name || teamContextQuery.data?.techCenter?.name || "Tech Center";

  const players = useMemo(() => teamMembers.filter((m) => m.teamRole === "PLAYER"), [teamMembers]);
  const staff = useMemo(() => teamMembers.filter((m) => m.teamRole !== "PLAYER"), [teamMembers]);
  const activeCount = useMemo(() => teamMembers.filter((m) => m.isActive).length, [teamMembers]);

  const positionOptions = useMemo(() => {
    return ["All", ...Array.from(new Set(teamMembers.map((m) => m.position).filter((p): p is string => Boolean(p))))];
  }, [teamMembers]);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesPosition = positionFilter === "All" || m.position === positionFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        fullName(m).toLowerCase().includes(term) ||
        (m.position ?? "").toLowerCase().includes(term) ||
        m.teamRole.toLowerCase().includes(term) ||
        (m.jerseyNumber !== null && String(m.jerseyNumber).includes(term));
      return matchesPosition && matchesSearch;
    });
  }, [teamMembers, positionFilter, searchTerm]);

  const handleJoinTeam = async () => {
    if (!techCenterId || !jerseyNumber || !position) {
      alert("Please fill in jersey number and position");
      return;
    }
    try {
      await registerMutation.mutateAsync({
        techCenterId,
        teamType: selectedSport,
        teamRole: selectedRole,
        jerseyNumber: parseInt(jerseyNumber, 10),
        position,
      });
      setShowJoinForm(false);
      setJerseyNumber("");
      setPosition("");
      setSelectedRole("PLAYER");
    } catch (e) {
      console.error("Failed to join team:", e);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!window.confirm("Are you sure you want to remove your squad registration?")) return;
    try {
      await leaveMutation.mutateAsync(teamId);
      queryClient.invalidateQueries({ queryKey: ["team", techCenterId, selectedSport] });
    } catch (e) {
      console.error("Failed to leave team:", e);
    }
  };

  const handleEditMembership = () => {
    if (!currentUserMembership) return;
    setEditJerseyNumber(currentUserMembership.jerseyNumber?.toString() || "");
    setEditPosition(currentUserMembership.position || "");
    setSelectedRole((currentUserMembership.teamRole as TeamRole) || "PLAYER");
    setIsEditing(true);
  };

  const handleUpdateMembership = async () => {
    if (!currentUserMembership || !editJerseyNumber || !editPosition) {
      alert("Please provide both jersey number and position");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        teamId: currentUserMembership.id,
        jerseyNumber: parseInt(editJerseyNumber, 10),
        position: editPosition,
      });
      setIsEditing(false);
      setEditJerseyNumber("");
      setEditPosition("");
    } catch (e) {
      console.error("Failed to update team membership:", e);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditJerseyNumber("");
    setEditPosition("");
  };

  const changeSport = (next: SportType) => {
    setSelectedSport(next);
    setShowJoinForm(false);
    setIsEditing(false);
    setPositionFilter("All");
    setSearchTerm("");
    setFormationKey(defaultFormationKey[next]);
  };

  const squadGrouped = useMemo(() => {
    if (selectedSport !== "FOOTBALL") {
      const playersOnly = filteredMembers.filter((m) => m.teamRole === "PLAYER");
      const staffOnly = filteredMembers.filter((m) => m.teamRole !== "PLAYER");
      const groups: { category: string; members: TeamMember[] }[] = [];
      if (playersOnly.length > 0) groups.push({ category: "Squad", members: playersOnly });
      if (staffOnly.length > 0) groups.push({ category: "Coaching & Support Staff", members: staffOnly });
      return groups;
    }

    const gk = filteredMembers.filter((m) => m.teamRole === "PLAYER" && /goalkeeper|gk/i.test(m.position || ""));
    const def = filteredMembers.filter((m) => m.teamRole === "PLAYER" && /defender|cb|rb|lb|back/i.test(m.position || ""));
    const mid = filteredMembers.filter((m) => m.teamRole === "PLAYER" && /midfield|cm|cam|cdm|winger/i.test(m.position || ""));
    const fwd = filteredMembers.filter((m) => m.teamRole === "PLAYER" && /forward|striker|st|cf|attacker/i.test(m.position || ""));
    const unassigned = filteredMembers.filter(
      (m) =>
        m.teamRole === "PLAYER" &&
        !gk.includes(m) &&
        !def.includes(m) &&
        !mid.includes(m) &&
        !fwd.includes(m)
    );
    const staffMembers = filteredMembers.filter((m) => m.teamRole !== "PLAYER");

    const groups: { category: string; members: TeamMember[] }[] = [];
    if (gk.length > 0) groups.push({ category: "Goalkeepers", members: gk });
    if (def.length > 0) groups.push({ category: "Defenders", members: def });
    if (mid.length > 0) groups.push({ category: "Midfielders", members: mid });
    if (fwd.length > 0) groups.push({ category: "Forwards", members: fwd });
    if (unassigned.length > 0) groups.push({ category: "Other Squad", members: unassigned });
    if (staffMembers.length > 0) groups.push({ category: "Coaching & Support Staff", members: staffMembers });

    return groups;
  }, [filteredMembers, selectedSport]);

  const activeFormationSet = formationsBySport[selectedSport];
  const activeFormation =
    activeFormationSet[formationKey] ?? activeFormationSet[defaultFormationKey[selectedSport]];

  const tacticalLineup = useMemo(() => {
    const formation = activeFormation;
    const pool = selectedSport === "FOOTBALL" ? [...players] : [...teamMembers];

    const assignedIds = new Set<string>();
    const linesWithPlayers = formation.lines.map((line) => {
      const matched: TeamMember[] = [];
      for (const p of pool) {
        if (assignedIds.has(p.id)) continue;
        if (matchesSportRoleType(selectedSport, p.position, line.roleType)) {
          matched.push(p);
          assignedIds.add(p.id);
        }
        if (matched.length === line.count) break;
      }

      const slots: (TeamMember | null)[] = [...matched];
      while (slots.length < line.count) slots.push(null);

      return { label: line.label, roleType: line.roleType, slots };
    });

    const bench = pool.filter((p) => !assignedIds.has(p.id));
    const startersOnPitch = linesWithPlayers.flatMap((l) => l.slots).filter((s): s is TeamMember => s !== null).length;
    const vacantSlots = linesWithPlayers.flatMap((l) => l.slots).filter((s) => s === null).length;

    return { linesWithPlayers, bench, startersOnPitch, vacantSlots };
  }, [players, teamMembers, activeFormation, selectedSport]);

  const suggestionsByLine = useMemo(() => {
    const map = new Map<string, TeamMember | null>();
    const usedIds = new Set<string>();

    tacticalLineup.linesWithPlayers.forEach((line, idx) => {
      const vacantCount = line.slots.filter((s) => s === null).length;
      for (let i = 0; i < vacantCount; i++) {
        const candidate = tacticalLineup.bench.find(
          (p) =>
            !usedIds.has(p.id) &&
            matchesSportRoleType(selectedSport, p.position, line.roleType)
        );
        if (candidate) usedIds.add(candidate.id);
        map.set(`${line.label}-${idx}-${i}`, candidate ?? null);
      }
    });

    return map;
  }, [tacticalLineup, selectedSport]);

  const promotionTarget = (() => {
    if (!selectedMember) return null;
    const isOnBench = tacticalLineup.bench.some((p) => p.id === selectedMember.id);
    if (!isOnBench) return null;

    for (const line of tacticalLineup.linesWithPlayers) {
      const vacantIdx = line.slots.findIndex((s) => s === null);
      if (
        vacantIdx !== -1 &&
        matchesSportRoleType(selectedSport, selectedMember.position, line.roleType)
      ) {
        return { lineLabel: line.label, roleType: line.roleType };
      }
    }
    return null;
  })();

  const handlePromoteToXI = async (member: TeamMember, targetRoleType: string) => {
    if (!member) return;

    const positionByRole: Record<string, Record<string, string>> = {
      FOOTBALL: { goalkeeper: "Goalkeeper", defender: "Defender", midfielder: "Midfielder", forward: "Forward" },
      VOLLEYBALL: { front: "Outside Hitter", back: "Libero" },
      NETBALL: { shooter: "Goal Shooter", center: "Center", defense: "Goal Defense" },
      BASKETBALL: { guard: "Point Guard", forward: "Small Forward", center: "Center" },
      ATHLETICS: { sprinter: "Sprinter", thrower: "Thrower", jumper: "Jumper", hurdler: "Hurdler" },
    };

    const nextPosition =
      positionByRole[selectedSport]?.[targetRoleType] ?? member.position ?? "";

    try {
      await updateMutation.mutateAsync({
        teamId: member.id,
        jerseyNumber: member.jerseyNumber ?? 0,
        position: nextPosition,
      });
      setSelectedMember(null);
      queryClient.invalidateQueries({
        queryKey: ["team", techCenterId, selectedSport],
      });
    } catch (e) {
      console.error("Promotion failed:", e);
    }
  };

  const showSquadWarning = selectedSport === "FOOTBALL" && players.length < 11;

  /* ────────────── Loading ────────────── */

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F1EC] p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#55705B]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Loading {sport.name} squad…
          </span>
        </div>
      </div>
    );
  }

  /* ────────────── Error ────────────── */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F1EC] p-6">
        <div className="max-w-sm rounded-2xl border border-red-200 bg-white p-6 text-center">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
            <X className="h-5 w-5" />
          </div>
          <h1 className="text-base font-bold text-slate-900">Squad data unavailable</h1>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            We couldn&apos;t load the {sport.name} squad records.
          </p>
          {error.message && (
            <p className="mt-2 text-xs text-red-600">Error: {error.message}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[#55705B] px-4 text-xs font-bold text-white transition hover:bg-[#465e4c]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!techCenterId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F1EC] p-6">
        <div className="max-w-sm rounded-xl border border-[#DADCD3] bg-white p-6 text-center">
          <h1 className="text-base font-bold text-slate-900">Sports unavailable</h1>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {user?.role === "super_admin"
              ? "This Super Admin account has no previous tech center to join a team from."
              : "Your account is not assigned to a tech center."}
          </p>
        </div>
      </div>
    );
  }

  /* ────────────── Main ────────────── */

  return (
    <main className="min-h-screen bg-[#F1F1EC] text-[#12203B] selection:bg-amber-200 selection:text-[#12203B]">
      {/* Compact hero header */}
      <header className="border-b border-[#DADCD3] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-[#55705B] transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#12203B] text-[#E8A33D]">
              <Shield className="h-5 w-5 fill-current" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold leading-tight text-slate-900">
                Freedom FC
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {techCenterName} · {sport.name}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition hover:border-[#55705B]"
          >
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-slate-100">
              {user?.profileImageUrl ? (
              <Image src={user.profileImageUrl} alt="" fill unoptimized sizes="28px" className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[#55705B]">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            <span className="hidden max-w-24 truncate text-xs font-semibold text-slate-600 sm:inline">
              {user?.firstName || "Profile"}
            </span>
          </button>
        </div>
      </header>

      {/* Sticky sport tabs */}
      <nav className="sticky top-0 z-30 border-b border-[#DADCD3] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-2 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {(Object.entries(sports) as [SportType, SportConfig][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const active = selectedSport === key;
              return (
                <button
                  key={key}
                  onClick={() => changeSport(key)}
                  aria-pressed={active}
                  className={`relative flex shrink-0 items-center gap-1.5 px-3 py-3 text-xs font-semibold transition ${
                    active ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cfg.name}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#E8A33D]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl space-y-5 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        {/* Squad warning */}
        {showSquadWarning && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-xs font-bold text-amber-900">Squad below full strength</p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                Only {players.length} {players.length === 1 ? "player" : "players"} registered.{" "}
                {11 - players.length} starting{" "}
                {11 - players.length === 1 ? "slot" : "slots"} currently vacant.
              </p>
            </div>
          </div>
        )}

        {/* Inline stat strip */}
        <section>
          <div className="flex items-center divide-x divide-slate-200 rounded-xl border border-[#DADCD3] bg-white">
            {[
              { label: "Roster", value: totalMembers },
              { label: "Players", value: players.length },
              { label: "Staff", value: staff.length },
              { label: "Active", value: activeCount },
            ].map((m) => (
              <div key={m.label} className="flex-1 px-3 py-3 sm:px-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {m.label}
                </p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Membership banner */}
        <section>
          {currentUserMembership?.teamType === selectedSport ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-100 font-mono text-base font-bold text-[#55705B]">
                    #{currentUserMembership.jerseyNumber ?? "—"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">Your squad registration</p>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                        {roles[currentUserMembership.teamRole as TeamRole]?.name ?? currentUserMembership.teamRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Position:{" "}
                      <span className="font-semibold text-slate-700">
                        {currentUserMembership.position || "Unassigned"}
                      </span>
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditMembership}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      <UserCog className="h-3.5 w-3.5 text-[#55705B]" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleLeaveTeam(currentUserMembership.id)}
                      disabled={leaveMutation.isPending}
                      aria-busy={leaveMutation.isPending}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-[11px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {leaveMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Leave
                    </button>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="mt-3 grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Jersey
                    </label>
                    <input
                      type="number"
                      value={editJerseyNumber}
                      onChange={(e) => setEditJerseyNumber(e.target.value)}
                      placeholder="e.g. 10"
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Position
                    </label>
                    <select
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                    >
                      {sport.positions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateMembership}
                      disabled={updateMutation.isPending}
                      aria-busy={updateMutation.isPending}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#55705B] px-3 text-xs font-bold text-white transition hover:bg-[#465e4c] disabled:opacity-50"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowJoinForm((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-[#55705B]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#E8A33D] text-slate-900">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Join the {sport.name} squad
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Register your jersey and position
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#55705B]" />
            </button>
          )}
        </section>

        {/* Join form */}
        <AnimatePresence>
          {showJoinForm && !currentUserMembership && (
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Register for {sport.name}
                  </h3>
                  <button
                    onClick={() => setShowJoinForm(false)}
                    aria-label="Close"
                    className="rounded p-1 text-slate-500 hover:text-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                    >
                      {(Object.entries(roles) as [TeamRole, RoleConfig][]).map(([k, cfg]) => (
                        <option key={k} value={k}>{cfg.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Jersey
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value)}
                      placeholder="e.g. 7"
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Position
                    </label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
                    >
                      <option value="">Select…</option>
                      {sport.positions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleJoinTeam}
                    disabled={registerMutation.isPending}
                    aria-busy={registerMutation.isPending}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#55705B] px-4 text-xs font-bold text-white transition hover:bg-[#465e4c] disabled:opacity-50"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Confirm registration
                  </button>
                  <button
                    onClick={() => setShowJoinForm(false)}
                    className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Squad toolbar */}
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                {sport.name} Squad
                <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600">
                  {filteredMembers.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Active roster and tactical positions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  document
                    .getElementById("formation-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#55705B] transition hover:bg-[#F7F6F2]"
              >
                <Shirt className="h-3.5 w-3.5" />
                View lineup
              </button>

              <div
                role="group"
                aria-label="View mode"
                className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5"
              >
                {(["grid", "list"] as const).map((mode) => {
                  const Icon = mode === "grid" ? Grid : List;
                  return (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      aria-pressed={viewMode === mode}
                      className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
                        viewMode === mode
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">
                        {mode === "grid" ? "Cards" : "List"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, position, jersey..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10 sm:w-40 sm:flex-none"
              >
                {positionOptions.map((p) => (
                  <option key={p} value={p}>
                    {p === "All" ? "All positions" : p}
                  </option>
                ))}
              </select>

              <select
                value={formationKey}
                onChange={(e) => setFormationKey(e.target.value)}
                className="h-9 flex-1 rounded-lg border border-slate-200 bg-[#F7F6F2] px-2 text-xs font-semibold text-[#55705B] outline-none focus:border-[#55705B] focus:ring-2 focus:ring-[#55705B]/10 sm:w-44 sm:flex-none"
              >
                {Object.entries(formationsBySport[selectedSport]).map(([key, f]) => (
                  <option key={key} value={key}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Formation / Lineup */}
        <section id="formation-section" className="mt-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-[#E8A33D]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#55705B]">
              {selectedSport === "FOOTBALL"
                ? "Team formation"
                : selectedSport === "VOLLEYBALL" || selectedSport === "NETBALL"
                  ? "Court lineup"
                  : selectedSport === "BASKETBALL"
                    ? "Starting five"
                    : "Event lineup"}
            </p>
          </div>

          <div className={`relative overflow-hidden rounded-2xl border-4 ${courtBg[selectedSport]}`}>
            <CourtMarkings sport={selectedSport} />

            <div className="relative z-10 flex min-h-[520px] flex-col justify-between px-3 pb-8 pt-6 sm:min-h-[600px] sm:px-8">
              {tacticalLineup.linesWithPlayers.map((line, lineIdx) => (
                <div key={`${line.label}-${lineIdx}`} className="w-full">
                  <div className="flex items-center justify-around gap-2">
                    {line.slots.map((member, slotIdx) => {
                      if (!member) {
                        const abbrev =
                          positionAbbrev[line.roleType] ??
                          line.label.slice(0, 3).toUpperCase();
                        const suggestion = suggestionsByLine.get(
                          `${line.label}-${lineIdx}-${slotIdx}`
                        );

                        return (
                          <div
                            key={`empty-${lineIdx}-${slotIdx}`}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="relative grid h-12 w-12 place-items-center rounded-full border-2 border-dashed border-white/70 bg-black/30 text-[10px] font-bold text-white sm:h-14 sm:w-14">
                              {abbrev}
                              {suggestion && (
                                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 animate-pulse rounded-full border border-white bg-amber-400" />
                              )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">
                              {suggestion ? "Bench ready" : "Vacant"}
                            </span>
                            {suggestion && (
                              <button
                                onClick={() => setSelectedMember(suggestion)}
                                className="mt-0.5 max-w-[80px] truncate rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-800 hover:bg-white"
                              >
                                {suggestion.user.lastName || suggestion.user.firstName}
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <motion.button
                          key={member.id}
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMember(member)}
                          className="flex flex-col items-center gap-1.5 text-center focus-visible:outline-none"
                        >
                          <div className="relative">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-white shadow-lg ring-2 ring-black/30 sm:h-14 sm:w-14">
                              {member.user.profileImageUrl ? (
                                <Image
                                  src={member.user.profileImageUrl}
                                  alt={fullName(member)}
                                  fill
                                  unoptimized
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-xs font-bold text-[#55705B]">
                                  {initials(member.user.firstName, member.user.lastName)}
                                </div>
                              )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#E8A33D] font-mono text-[9px] font-bold text-slate-900 sm:h-6 sm:w-6 sm:text-[10px]">
                              {member.jerseyNumber ?? "—"}
                            </span>
                          </div>

                          <div className="max-w-[110px] rounded bg-black/70 px-2 py-0.5 backdrop-blur-sm sm:max-w-[145px]">
                            <p className="break-words text-[10px] font-bold leading-tight text-white sm:text-xs">
                              {member.user.lastName || member.user.firstName}
                            </p>
                            <p className="break-words text-[8px] font-semibold uppercase text-emerald-300">
                              {member.position || line.label}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bench strip (outside court) */}
          {tacticalLineup.bench.length > 0 && (
            <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
              {tacticalLineup.bench.map((m) => {
                const ready = tacticalLineup.linesWithPlayers.some(
                  (line) =>
                    line.slots.includes(null) &&
                    matchesSportRoleType(selectedSport, m.position, line.roleType)
                );
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`flex shrink-0 items-center gap-2 rounded-lg border p-1.5 pr-3 text-left transition ${
                      ready
                        ? "border-amber-300 bg-amber-50 hover:border-amber-400"
                        : "border-slate-200 bg-white hover:border-[#55705B]"
                    }`}
                  >
                    <div className="relative">
                      <PlayerAvatar member={m} size="sm" />
                      <span className="absolute -bottom-1 -right-1 rounded-full bg-[#E8A33D] px-1 font-mono text-[8px] font-bold text-slate-900">
                        {m.jerseyNumber ?? "—"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-slate-900">
                        {m.user.lastName || m.user.firstName}
                      </p>
                      <p className="truncate text-[9px] uppercase tracking-wide text-slate-500">
                        {m.position || "Squad"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-bold text-slate-700">
                  {activeFormation.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {activeFormation.lines.map((l) => `${l.label} ×${l.count}`).join(" · ")}
                </p>
              </div>
              <p className="text-[10px] font-semibold text-[#55705B]">
                {tacticalLineup.startersOnPitch} starting
                {tacticalLineup.vacantSlots > 0
                  ? ` · ${tacticalLineup.vacantSlots} vacant`
                  : ""}
              </p>
            </div>
          </div>
        </section>

        {/* Roster List */}
        {viewMode === "list" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-12">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-3">Position</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No squad members match the current filter.
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const roleConfig = roles[member.teamRole as TeamRole] ?? roles.PLAYER;
                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="flex w-full items-center justify-between gap-3 p-3 text-left transition hover:bg-slate-50 sm:grid sm:grid-cols-12 sm:gap-3 sm:px-4 sm:py-3 focus-visible:outline-none"
                    >
                      <div className="hidden font-mono text-sm font-bold text-[#55705B] sm:col-span-1 sm:flex sm:items-center sm:justify-center">
                        {member.jerseyNumber ? `#${member.jerseyNumber}` : "—"}
                      </div>

                      <div className="flex min-w-0 items-center gap-2.5 sm:col-span-5">
                        <div className="relative shrink-0">
                          <PlayerAvatar member={member} size="md" />
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-[#E8A33D] px-1 font-mono text-[9px] font-bold text-slate-900 sm:hidden">
                            {member.jerseyNumber ?? "—"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {fullName(member)}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5 sm:hidden">
                            <RoleBadge teamRole={member.teamRole} size="xs" />
                            <span className="text-[11px] font-semibold text-[#55705B]">
                              {member.position || roleConfig.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:col-span-3 sm:block">
                        <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {member.position || "—"}
                        </span>
                      </div>

                      <div className="hidden sm:col-span-2 sm:block">
                        <RoleBadge teamRole={member.teamRole} />
                      </div>

                      <div className="shrink-0 sm:col-span-1 sm:text-right">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                            member.isActive
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {member.isActive ? "Active" : "Reserve"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Cards Grid */}
        {viewMode === "grid" && (
          <section className="space-y-6">
            {filteredMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Shirt className="mx-auto mb-3 h-9 w-9 text-[#55705B]" />
                <h3 className="text-sm font-bold text-slate-900">No players found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search or filter.
                </p>
              </div>
            ) : (
              squadGrouped.map((group) => (
                <div key={group.category} className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {group.category}
                    </h3>
                    <span className="font-mono text-[10px] font-semibold text-slate-400">
                      ({group.members.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {group.members.map((member) => {
                      const roleConfig = roles[member.teamRole as TeamRole] ?? roles.PLAYER;
                      const displayRole =
                        member.teamRole === "PLAYER"
                          ? member.position || roleConfig.name
                          : roleConfig.name;

                      return (
                        <motion.button
                          key={member.id}
                          type="button"
                          whileHover={{ y: -3 }}
                          onClick={() => setSelectedMember(member)}
                          className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left transition hover:border-[#55705B] hover:shadow-lg focus-visible:outline-none"
                        >
                          {member.user.profileImageUrl ? (
                            <Image
                              src={member.user.profileImageUrl}
                              alt={fullName(member)}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 25vw, 160px"
                              loading="lazy"
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center bg-slate-200 text-3xl font-bold text-slate-500">
                              {initials(member.user.firstName, member.user.lastName)}
                            </div>
                          )}

                          <div className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-sm">
                            #{member.jerseyNumber ?? "—"}
                          </div>

                          <div className="absolute left-2 top-2">
                            <RoleBadge teamRole={member.teamRole} size="xs" />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent p-3 pt-8">
                            <h3 className="truncate text-sm font-bold leading-tight text-white">
                              {fullName(member)}
                            </h3>
                            <p className="mt-0.5 truncate text-[11px] font-medium text-white/80">
                              {displayRole}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* Club Highlights */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#E8A33D] text-slate-900">
                <PlayCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Club media & footage
                </h3>
                <p className="text-[11px] text-slate-500">
                  Match footage, drills, highlights
                </p>
              </div>
            </div>
            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-[#55705B]">
              Season reel
            </span>
          </div>

          <div className="bg-black">
            <video
              controls
              playsInline
              preload="metadata"
              className="aspect-video max-h-[480px] w-full object-contain"
            >
              <source src="/football-video.mp4" type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          </div>
        </section>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showProfileModal && user && (
          <Modal onClose={() => setShowProfileModal(false)}>
            <div className="relative border-b border-slate-200 bg-slate-50 p-5 text-center">
              <button
                onClick={() => setShowProfileModal(false)}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative mx-auto mb-3 grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-[#55705B] bg-slate-100">
                {user.profileImageUrl ? (
                  <Image src={user.profileImageUrl} alt="" fill unoptimized sizes="64px" className="object-cover" />
                ) : (
                  <User className="h-7 w-7 text-[#55705B]" />
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-[11px] text-slate-500">{user.email}</p>
            </div>

            <div className="space-y-2 bg-white p-4 text-xs">
              <div className="flex justify-between border-b border-slate-200 py-1.5">
                <span className="text-slate-500">Tech center</span>
                <span className="font-semibold text-slate-900">{techCenterName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1.5">
                <span className="text-slate-500">Club sport</span>
                <span className="font-semibold text-[#55705B]">{sport.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 py-1.5">
                <span className="text-slate-500">Squad status</span>
                <span className="font-semibold text-slate-900">
                  {currentUserMembership ? "Registered" : "Not registered"}
                </span>
              </div>
              {user.phoneNumber && (
                <div className="flex justify-between py-1.5">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="h-3 w-3" /> Contact
                  </span>
                  <span className="font-mono text-slate-900">{user.phoneNumber}</span>
                </div>
              )}
            </div>
          </Modal>
        )}

        {selectedMember && (
          <Modal onClose={() => setSelectedMember(null)}>
            <div className="relative border-b border-slate-200 bg-slate-50 p-5 text-center">
              <button
                onClick={() => setSelectedMember(null)}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-[#55705B] shadow">
                <PlayerAvatar member={selectedMember} size="xl" className="h-full w-full" />
              </div>

              <div className="mb-1 flex items-center justify-center gap-2">
                <span className="font-mono text-sm font-bold text-[#55705B]">
                  #{selectedMember.jerseyNumber ?? "—"}
                </span>
                <RoleBadge teamRole={selectedMember.teamRole} />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                {fullName(selectedMember)}
              </h3>
              <p className="text-[11px] text-slate-500">{selectedMember.user.email}</p>
            </div>

            <div className="bg-white p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Position
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    {selectedMember.position || "Squad"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[#55705B]">
                    {roles[selectedMember.teamRole as TeamRole]?.name ?? selectedMember.teamRole}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 border-t border-slate-200 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tech center</span>
                  <span className="font-semibold text-slate-900">
                    {selectedMember.techCenter?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span
                    className={`font-semibold ${
                      selectedMember.isActive ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    {selectedMember.isActive ? "Match active" : "Reserve"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Joined</span>
                  <span className="tabular-nums text-slate-700">
                    {new Date(selectedMember.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {promotionTarget && (
                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
                  <p className="text-[11px] font-bold text-amber-900">
                    Promotion available · {promotionTarget.lineLabel}
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-700">
                    Matches a vacant slot on the pitch.
                  </p>
                  <button
                    onClick={() => handlePromoteToXI(selectedMember, promotionTarget.roleType)}
                    disabled={updateMutation.isPending}
                    aria-busy={updateMutation.isPending}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#E8A33D] py-2 text-xs font-bold text-slate-900 transition hover:bg-[#d39129] disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Shirt className="h-3.5 w-3.5" />
                    )}
                    Promote to lineup
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}