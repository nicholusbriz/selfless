"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Award, Check, ChevronDown, ChevronRight, Circle,
  Crown, Gamepad2, Globe, Grid, List, Loader2, Megaphone,
  Package, Phone, PlayCircle, Plus, Save, Search, Shield, Shirt,
  Stethoscope, Target, Trophy, User, UserCheck, UserCog, Users, X, Zap, AlertTriangle
} from "lucide-react";
import {
  useTeam, useRegisterForTeam, useLeaveTeam, useUpdateTeamMembership,
} from "@/hooks/useTeam";
import { useAuth } from "@/lib/hooks/useAuth";

// Types
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

export type SportType = "FOOTBALL" | "VOLLEYBALL" | "NETBALL" | "BASKETBALL" | "ATHLETICS";
export type TeamRole = "PLAYER" | "COACH" | "KIT_MANAGER" | "CHEERLEADER" | "TEAM_MANAGER" | "MEDICAL" | "REFEREE";
export type FormationKey = "4-3-3" | "4-2-3-1" | "4-4-2";

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

// Solid, non-gradient role colors for badges (light theme)
const roleBadgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  PLAYER: { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-600" },
  COACH: { bg: "bg-amber-500", text: "text-white", border: "border-amber-600" },
  KIT_MANAGER: { bg: "bg-orange-500", text: "text-white", border: "border-orange-600" },
  CHEERLEADER: { bg: "bg-pink-500", text: "text-white", border: "border-pink-600" },
  TEAM_MANAGER: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
  MEDICAL: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
  REFEREE: { bg: "bg-slate-600", text: "text-white", border: "border-slate-700" },
};

// Short labels for role badges
const roleShortLabels: Record<string, string> = {
  PLAYER: "PLAYER",
  COACH: "COACH",
  KIT_MANAGER: "KIT",
  CHEERLEADER: "SUPPORT",
  TEAM_MANAGER: "MANAGER",
  MEDICAL: "MEDICAL",
  REFEREE: "OFFICIAL",
};

// Position abbreviation for vacant pitch slots
const positionAbbrev: Record<string, string> = {
  goalkeeper: "GK",
  defender: "DEF",
  midfielder: "MID",
  forward: "ATT",
};

const formations: Record<FormationKey, { name: string; lines: { label: string; count: number; roleType: string }[] }> = {
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

const ease = [0.16, 1, 0.3, 1] as const;

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

function RoleBadge({ teamRole, size = "sm" }: { teamRole: string; size?: "xs" | "sm" }) {
  const style = roleBadgeStyles[teamRole] ?? roleBadgeStyles.PLAYER;
  const label = roleShortLabels[teamRole] ?? "PLAYER";
  const sizeClass = size === "xs" ? "text-[8px] px-1 py-0.5" : "text-[9px] px-1.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center rounded font-bold uppercase tracking-wider ${style.bg} ${style.text} ${sizeClass} shadow-sm`}
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
    xl: "h-24 w-24 text-2xl",
  }[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200 font-bold text-slate-600 select-none ${sizeClasses} ${className}`}
    >
      {member.user.profileImageUrl ? (
        <img
          src={member.user.profileImageUrl}
          alt={fullName(member)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-700 font-black">
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
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

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

  // Sport and View states
  const [selectedSport, setSelectedSport] = useState<SportType>("FOOTBALL");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [positionFilter, setPositionFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formationKey, setFormationKey] = useState<FormationKey>("4-3-3");

  const videoRef = useRef<HTMLDivElement>(null);
  const techCenterId = user?.techCenterId || null;

  const { data, isLoading, error } = useTeam(techCenterId, selectedSport) as {
    data: TeamData | null | undefined;
    isLoading: boolean;
    error: Error | null;
  };

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
  const techCenterName = teamMembers[0]?.techCenter?.name || "Tech Center";

  // Role categorizations
  const players = useMemo(() => teamMembers.filter((m) => m.teamRole === "PLAYER"), [teamMembers]);
  const staff = useMemo(() => teamMembers.filter((m) => m.teamRole !== "PLAYER"), [teamMembers]);
  const activeCount = useMemo(() => teamMembers.filter((m) => m.isActive).length, [teamMembers]);

  // Position options
  const positionOptions = useMemo(() => {
    return ["All", ...Array.from(new Set(teamMembers.map((m) => m.position).filter((p): p is string => Boolean(p))))];
  }, [teamMembers]);

  // Filtered members for display
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

  // Handlers
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
      // Ensure pitch & grid refetch immediately
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
  };

  // Grouped members for official club grid
  const squadGrouped = useMemo(() => {
    if (selectedSport !== "FOOTBALL") {
      return [{ category: "Squad", members: filteredMembers }];
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

  // Tactical Lineup Computation for Pitch — WITH POSITIONAL LOCK
  const tacticalLineup = useMemo(() => {
    const formation = formations[formationKey];
    const availablePlayers = [...players];

    const assignedIds = new Set<string>();
    const linesWithPlayers = formation.lines.map((line) => {
      // Positional lock: ONLY fill from players matching the line's roleType.
      // No cascading fallback — a defender slot stays empty rather than
      // pulling in a midfielder when no defender is available.
      const matched: TeamMember[] = [];
      for (const p of availablePlayers) {
        if (assignedIds.has(p.id)) continue;
        if (matchesRoleType(p.position, line.roleType)) {
          matched.push(p);
          assignedIds.add(p.id);
        }
        if (matched.length === line.count) break;
      }

      const slots: (TeamMember | null)[] = [...matched];
      while (slots.length < line.count) {
        slots.push(null);
      }

      return {
        label: line.label,
        roleType: line.roleType,
        slots,
      };
    });

    // Bench: any player not assigned to a pitch line
    const bench = availablePlayers.filter((p) => !assignedIds.has(p.id));

    // Count actual starters on pitch
    const startersOnPitch = linesWithPlayers
      .flatMap((l) => l.slots)
      .filter((s): s is TeamMember => s !== null).length;

    // Count vacant slots
    const vacantSlots = linesWithPlayers
      .flatMap((l) => l.slots)
      .filter((s) => s === null).length;

    return { linesWithPlayers, bench, startersOnPitch, vacantSlots };
  }, [players, formationKey]);

  // Squad size warning (football only)
  const showSquadWarning = selectedSport === "FOOTBALL" && players.length < 11;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700 p-6 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-sm font-bold tracking-wider uppercase text-slate-700">
            Loading {sport.name} Squad...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600 border border-red-200">
            <X className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-900">Squad Data Unavailable</h1>
          <p className="mt-2 text-xs text-slate-500">
            We were unable to load the {sport.name} squad records for this Tech Center.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-900 transition hover:bg-amber-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-200 selection:text-slate-900">
      {/* Top Club Header Banner */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.back()}
                aria-label="Back"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-emerald-700 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-slate-900 font-black shadow-sm">
                <Shield className="h-5 w-5 fill-current" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-black tracking-wider text-slate-900">SELFLESS FC</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-700 border border-slate-200">
                    Official Hub
                  </span>
                </div>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {techCenterName} • {sport.name} Division
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(true)}
              className="flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-3 transition hover:border-emerald-600 hover:bg-slate-50"
            >
              <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="User" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-emerald-700">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              <span className="hidden text-xs font-semibold text-slate-600 sm:inline max-w-28 truncate">
                {user?.firstName || "Profile"}
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Sport Switcher Tabs */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs border-b border-slate-200 pb-2">
          {(Object.entries(sports) as [SportType, SportConfig][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const active = selectedSport === key;
            return (
              <button
                key={key}
                onClick={() => changeSport(key)}
                className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 font-bold transition ${
                  active
                    ? "bg-slate-100 text-emerald-700 border border-slate-200 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cfg.name}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </nav>

        {/* Squad size warning */}
        {showSquadWarning && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                Squad below full strength
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Only {players.length} {players.length === 1 ? "player" : "players"} registered.{" "}
                {11 - players.length} starting {11 - players.length === 1 ? "slot" : "slots"} currently vacant on the pitch.
              </p>
            </div>
          </div>
        )}

        {/* Club Squad Metrics Bar */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Roster</span>
              <Users className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{totalMembers}</p>
            <p className="mt-0.5 text-[10px] text-slate-500 font-semibold">Registered squad</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Field Players</span>
              <Shirt className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{players.length}</p>
            <p className="mt-0.5 text-[10px] text-slate-500 font-semibold">Ready for selection</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Technical Staff</span>
              <Crown className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{staff.length}</p>
            <p className="mt-0.5 text-[10px] text-slate-500 font-semibold">Coaches & Managers</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Active Status</span>
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{activeCount}</p>
            <p className="mt-0.5 text-[10px] text-slate-500 font-semibold">Confirmed match-ready</p>
          </div>
        </section>

        {/* Current User Membership Banner */}
        <section>
          {currentUserMembership?.teamType === selectedSport ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 border border-slate-200 text-emerald-700 font-mono font-black text-base">
                    #{currentUserMembership.jerseyNumber ?? "—"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900">Your Squad Registration</p>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200">
                        {roles[currentUserMembership.teamRole as TeamRole]?.name ?? currentUserMembership.teamRole}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Position: <span className="text-slate-700 font-semibold">{currentUserMembership.position || "Unassigned"}</span>
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditMembership}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      <UserCog className="h-3.5 w-3.5 text-emerald-600" /> Edit Role
                    </button>
                    <button
                      onClick={() => handleLeaveTeam(currentUserMembership.id)}
                      disabled={leaveMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {leaveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      Leave Squad
                    </button>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="mt-4 pt-4 border-t border-slate-200 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Jersey Number</label>
                    <input
                      type="number"
                      value={editJerseyNumber}
                      onChange={(e) => setEditJerseyNumber(e.target.value)}
                      placeholder="e.g. 10"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Position</label>
                    <select
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
                    >
                      {sport.positions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateMembership}
                      disabled={updateMutation.isPending}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-slate-900 transition hover:bg-amber-600 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
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
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-slate-900">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Join the {sport.name} Squad</p>
                  <p className="text-xs text-slate-500">Register your jersey number and position</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-emerald-600" />
            </button>
          )}
        </section>

        {/* Join Squad Form */}
        <AnimatePresence>
          {showJoinForm && !currentUserMembership && (
            <motion.section
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Register for {sport.name}
                  </h3>
                  <button
                    onClick={() => setShowJoinForm(false)}
                    aria-label="Close"
                    className="rounded-lg p-1 text-slate-500 hover:text-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as TeamRole)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
                    >
                      {(Object.entries(roles) as [TeamRole, RoleConfig][]).map(([k, cfg]) => (
                        <option key={k} value={k}>
                          {cfg.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Jersey Number</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={jerseyNumber}
                      onChange={(e) => setJerseyNumber(e.target.value)}
                      placeholder="e.g. 7"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-600"
                    >
                      <option value="">Select Position</option>
                      {sport.positions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleJoinTeam}
                    disabled={registerMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-900 transition hover:bg-amber-600 disabled:opacity-50"
                  >
                    {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Confirm Registration
                  </button>
                  <button
                    onClick={() => setShowJoinForm(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Squad Controls */}
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <span>{sport.name} Squad</span>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {filteredMembers.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500">Official active roster and tactical positions</p>
            </div>

            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "grid"
                    ? "bg-amber-500 text-slate-900 shadow"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>

              {selectedSport === "FOOTBALL" && (
                <button
                  onClick={() => document.getElementById("formation-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                >
                  <Shirt className="h-3.5 w-3.5" />
                  <span>Formation</span>
                </button>
              )}

              <button
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "list"
                    ? "bg-amber-500 text-slate-900 shadow"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Roster List</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search player name, position, or jersey #..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-600 shadow-sm"
              />
            </div>

            <div className="relative min-w-[140px] flex-1 sm:flex-none">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full sm:w-48 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-emerald-600 shadow-sm"
              >
                {positionOptions.map((p) => (
                  <option key={p} value={p}>
                    {p === "All" ? "All Positions" : p}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {selectedSport === "FOOTBALL" && (
              <div className="relative min-w-[140px] flex-1 sm:flex-none">
                <select
                  value={formationKey}
                  onChange={(e) => setFormationKey(e.target.value as FormationKey)}
                  className="w-full sm:w-40 appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-bold text-emerald-700 outline-none shadow-sm"
                >
                  <option value="4-3-3">Tactical 4-3-3</option>
                  <option value="4-2-3-1">Tactical 4-2-3-1</option>
                  <option value="4-4-2">Tactical 4-4-2</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-700" />
              </div>
            )}
          </div>
        </section>

        {/* FORMATION PITCH VIEW */}
        {selectedSport === "FOOTBALL" && (
          <section id="formation-section" className="mt-8 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1 w-7 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Team formation</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border-4 border-emerald-900 bg-emerald-700 shadow-xl">
              <div className="absolute inset-0 bg-emerald-700" />

              <div className="absolute inset-3 rounded-lg border-2 border-white/50 pointer-events-none sm:inset-4" />

              <div className="absolute left-3 right-3 top-1/2 h-[2px] bg-white/50 -translate-y-1/2 pointer-events-none sm:left-4 sm:right-4" />

              <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/50 pointer-events-none sm:h-36 sm:w-36" />
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 pointer-events-none" />

              <div className="absolute left-1/2 top-3 h-20 w-44 -translate-x-1/2 border-2 border-t-0 border-white/50 pointer-events-none sm:top-4 sm:h-24 sm:w-56" />
              <div className="absolute left-1/2 top-3 h-9 w-24 -translate-x-1/2 border-2 border-t-0 border-white/50 pointer-events-none sm:top-4 sm:h-11 sm:w-32" />
              <div className="absolute left-1/2 top-16 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80 pointer-events-none sm:top-20" />

              <div className="absolute left-1/2 bottom-3 h-20 w-44 -translate-x-1/2 border-2 border-b-0 border-white/50 pointer-events-none sm:bottom-4 sm:h-24 sm:w-56" />
              <div className="absolute left-1/2 bottom-3 h-9 w-24 -translate-x-1/2 border-2 border-b-0 border-white/50 pointer-events-none sm:bottom-4 sm:h-11 sm:w-32" />
              <div className="absolute left-1/2 bottom-16 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80 pointer-events-none sm:bottom-20" />

              <div className="relative z-10 flex min-h-[580px] flex-col justify-between py-8 px-4 sm:px-8 sm:min-h-[640px]">
                {tacticalLineup.linesWithPlayers.map((line, lineIdx) => (
                  <div key={`${line.label}-${lineIdx}`} className="w-full">
                    <div className="flex justify-around items-center gap-2">
                      {line.slots.map((member, slotIdx) => {
                        if (!member) {
                          const abbrev = positionAbbrev[line.roleType] ?? "OPEN";
                          return (
                            <div
                              key={`empty-${lineIdx}-${slotIdx}`}
                              className="flex flex-col items-center gap-1"
                            >
                              <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full border-2 border-dashed border-white/70 bg-black/30 text-white text-xs font-black">
                                {abbrev}
                              </div>
                              <span className="text-[9px] font-bold text-white/80 uppercase tracking-wider">
                                Vacant
                              </span>
                            </div>
                          );
                        }

                        return (
                          <motion.button
                            key={member.id}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMember(member)}
                            className="group flex flex-col items-center gap-1.5 transition text-center focus-visible:outline-none"
                          >
                            <div className="relative">
                              <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-white bg-white shadow-lg overflow-hidden ring-2 ring-black/30">
                                {member.user.profileImageUrl ? (
                                  <img
                                    src={member.user.profileImageUrl}
                                    alt={fullName(member)}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center font-black text-xs text-emerald-700 bg-emerald-50">
                                    {initials(member.user.firstName, member.user.lastName)}
                                  </div>
                                )}
                              </div>

                              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-amber-500 text-slate-900 font-mono font-black text-[9px] sm:text-[10px] border border-white shadow">
                                {member.jerseyNumber ?? "—"}
                              </span>
                            </div>

                            <div className="rounded bg-black/70 px-2 py-0.5 backdrop-blur-sm border border-white/10 max-w-[90px] sm:max-w-[110px] truncate shadow">
                              <p className="text-[10px] sm:text-xs font-black text-white leading-tight truncate">
                                {member.user.lastName || member.user.firstName}
                              </p>
                              <p className="text-[8px] font-semibold text-emerald-300 uppercase truncate">
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

            {/* Dynamic formation info below pitch */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {formations[formationKey].lines[formations[formationKey].lines.length - 1].label}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {formations[formationKey].name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-700">
                    Starting {tacticalLineup.startersOnPitch}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {tacticalLineup.vacantSlots > 0
                      ? `${tacticalLineup.vacantSlots} slot${tacticalLineup.vacantSlots === 1 ? "" : "s"} vacant`
                      : "Tap player for bio"}
                  </p>
                </div>
              </div>
            </div>

            {tacticalLineup.bench.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                    Substitutes & Reserves ({tacticalLineup.bench.length})
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Available for rotation</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {tacticalLineup.bench.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-left transition hover:border-emerald-600 hover:bg-white"
                    >
                      <div className="relative">
                        <PlayerAvatar member={m} size="sm" />
                        <span className="absolute -bottom-1 -right-1 font-mono text-[8px] font-bold bg-amber-500 text-slate-900 rounded-full px-1">
                          {m.jerseyNumber ?? "—"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {m.user.lastName || m.user.firstName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{m.position || "Squad"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ROSTER LIST VIEW */}
        {viewMode === "list" && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Player Name</div>
              <div className="col-span-3">Position</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No squad members match the current filter.
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const roleConfig = roles[member.teamRole as TeamRole] ?? roles.PLAYER;
                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="w-full flex items-center justify-between gap-3 p-3 text-left transition hover:bg-slate-50 sm:grid sm:grid-cols-12 sm:gap-3 sm:px-4 sm:py-3.5 focus-visible:outline-none"
                    >
                      <div className="hidden sm:col-span-1 sm:flex sm:items-center sm:justify-center font-mono font-black text-sm text-emerald-700">
                        {member.jerseyNumber ? `#${member.jerseyNumber}` : "—"}
                      </div>

                      <div className="flex min-w-0 items-center gap-3 sm:col-span-5">
                        <div className="relative shrink-0">
                          <PlayerAvatar member={member} size="md" />
                          <span className="sm:hidden absolute -bottom-1 -right-1 font-mono text-[9px] font-black bg-amber-500 text-slate-900 px-1.5 py-0.2 rounded-full border border-white">
                            {member.jerseyNumber ? `${member.jerseyNumber}` : "—"}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 leading-tight break-words">
                            {fullName(member)}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 sm:hidden">
                            <RoleBadge teamRole={member.teamRole} size="xs" />
                            <span className="text-xs font-semibold text-emerald-700">
                              {member.position || roleConfig.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:col-span-3 sm:block">
                        <span className="inline-flex rounded bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 border border-slate-200">
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
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
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

        {/* CARDS GRID VIEW — with role badges for staff */}
        {viewMode === "grid" && (
          <section className="space-y-8">
            {filteredMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Shirt className="mx-auto h-10 w-10 text-emerald-600 mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Players Found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search terms or position filter.
                </p>
              </div>
            ) : (
              squadGrouped.map((group) => (
                <div key={group.category} className="space-y-3">
                  <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      {group.category}
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ({group.members.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {group.members.map((member) => {
                      const roleConfig = roles[member.teamRole as TeamRole] ?? roles.PLAYER;
                      return (
                        <motion.button
                          key={member.id}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMember(member)}
                          className="group relative flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm transition hover:shadow-lg focus-visible:outline-none"
                        >
                          {/* Portrait Frame */}
                          <div className="relative aspect-[3/3.8] w-full overflow-hidden bg-emerald-50">
                            {member.user.profileImageUrl ? (
                              <img
                                src={member.user.profileImageUrl}
                                alt={fullName(member)}
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-black text-4xl text-emerald-600/50 bg-emerald-50">
                                {initials(member.user.firstName, member.user.lastName)}
                              </div>
                            )}

                            {/* Jersey # Badge */}
                            <div className="absolute top-2.5 right-2.5 flex items-center justify-center rounded-lg bg-white px-2 py-1 font-mono font-black text-xs text-emerald-700 shadow-sm">
                              #{member.jerseyNumber ?? "—"}
                            </div>

                            {/* Role badge (top-left) — shows for ALL roles */}
                            <div className="absolute top-2.5 left-2.5">
                              <RoleBadge teamRole={member.teamRole} size="xs" />
                            </div>

                            {/* Active status (bottom-left of portrait) */}
                            {member.isActive && (
                              <span className="absolute bottom-2.5 left-2.5 rounded bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow-sm">
                                Active
                              </span>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="px-3 py-2.5 bg-slate-50">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                              {member.user.firstName}
                            </p>
                            <p className="text-base font-black tracking-tight text-slate-900 leading-tight uppercase truncate">
                              {member.user.lastName || member.user.firstName}
                            </p>
                            <p className="text-xs font-bold text-emerald-700 truncate mt-0.5">
                              {member.teamRole === "PLAYER"
                                ? (member.position || roleConfig.name)
                                : roleConfig.name}
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

        {/* Club Highlights Section */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-slate-900">
                <PlayCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Club Media & Footage</h3>
                <p className="text-xs text-slate-500">Match footage, drills, and team highlights</p>
              </div>
            </div>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-slate-200">
              Season Reel
            </span>
          </div>

          <div ref={videoRef} className="bg-black">
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

      {/* MODALS */}
      <AnimatePresence>
        {showProfileModal && user && (
          <Modal onClose={() => setShowProfileModal(false)}>
            <div className="relative bg-slate-50 p-6 text-center text-slate-900 border-b border-slate-200">
              <button
                onClick={() => setShowProfileModal(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full border-2 border-emerald-600 bg-slate-100 overflow-hidden">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="User" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-emerald-700" />
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="p-5 space-y-3 text-xs bg-white text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Tech Center</span>
                <span className="font-bold">{techCenterName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Club Sport</span>
                <span className="font-bold text-emerald-700">{sport.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Squad Status</span>
                <span className="font-bold">
                  {currentUserMembership ? "Registered Member" : "Not Registered"}
                </span>
              </div>

              {user.phoneNumber && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Contact
                  </span>
                  <span className="font-mono">{user.phoneNumber}</span>
                </div>
              )}

              <button
                onClick={() => setShowProfileModal(false)}
                className="mt-4 w-full rounded-lg bg-amber-500 py-2.5 text-xs font-black text-slate-900 transition hover:bg-amber-600"
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        {selectedMember && (
          <Modal onClose={() => setSelectedMember(null)}>
            <div className="relative bg-slate-50 p-6 text-center text-slate-900 border-b border-slate-200">
              <button
                onClick={() => setSelectedMember(null)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-emerald-600 shadow-md">
                <PlayerAvatar member={selectedMember} size="xl" className="h-full w-full" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-emerald-700">
                  #{selectedMember.jerseyNumber ?? "—"}
                </span>
                <RoleBadge teamRole={selectedMember.teamRole} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {fullName(selectedMember)}
              </h3>
              <p className="text-xs text-slate-500">{selectedMember.user.email}</p>
            </div>

            <div className="p-5 space-y-3 bg-white text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Position</span>
                  <p className="mt-1 font-black text-slate-900 text-sm">
                    {selectedMember.position || "Squad"}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Squad Role</span>
                  <p className="mt-1 font-black text-emerald-700 text-sm">
                    {roles[selectedMember.teamRole as TeamRole]?.name ?? selectedMember.teamRole}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Tech Center</span>
                  <span className="font-semibold">{selectedMember.techCenter?.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedMember.isActive ? "Match Active" : "Reserve"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Joined Squad</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedMember.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="mt-4 w-full rounded-lg bg-amber-500 py-2.5 text-xs font-black text-slate-900 transition hover:bg-amber-600"
              >
                Close Player Card
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
}