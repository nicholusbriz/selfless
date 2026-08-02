'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  Heart,
  Briefcase,
  Stethoscope,
  Award,
  Circle,
  Target,
  Globe,
  Zap,
  Megaphone,
  Package,
  UserCog,
  Activity,
  CheckCircle2
} from 'lucide-react';

// Team Types
const TEAM_TYPES = [
  {
    id: 'FOOTBALL',
    name: 'Football Team',
    icon: Trophy,
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10',
    description: 'Join the football squad',
    gender: 'both'
  },
  {
    id: 'VOLLEYBALL',
    name: 'Volleyball Team',
    icon: Circle,
    color: 'from-blue-500 to-cyan-600',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    description: 'Popular for girls',
    gender: 'female'
  },
  {
    id: 'NETBALL',
    name: 'Netball Team',
    icon: Target,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    description: 'Popular for girls',
    gender: 'female'
  },
  {
    id: 'BASKETBALL',
    name: 'Basketball Team',
    icon: Globe,
    color: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10',
    description: 'For both boys and girls',
    gender: 'both'
  },
  {
    id: 'ATHLETICS',
    name: 'Athletics/Track & Field',
    icon: Zap,
    color: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10',
    description: 'For both genders',
    gender: 'both'
  }
];

// Team Roles
const TEAM_ROLES = [
  {
    id: 'PLAYER',
    name: 'Player',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    description: 'Active team member'
  },
  {
    id: 'COACH',
    name: 'Team Coach',
    icon: Trophy,
    color: 'from-yellow-500 to-orange-600',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10',
    description: 'Lead and train the team'
  },
  {
    id: 'KIT_MANAGER',
    name: 'Kit Manager',
    icon: Package,
    color: 'from-amber-500 to-yellow-600',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    description: 'Equipment management'
  },
  {
    id: 'CHEERLEADER',
    name: 'Cheerleader',
    icon: Megaphone,
    color: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-500/30',
    bgColor: 'bg-pink-500/10',
    description: 'Spirit and support'
  },
  {
    id: 'TEAM_MANAGER',
    name: 'Team Manager',
    icon: UserCog,
    color: 'from-teal-500 to-cyan-600',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-500/10',
    description: 'Organizational role'
  },
  {
    id: 'MEDICAL',
    name: 'Medical/First Aid',
    icon: Stethoscope,
    color: 'from-red-500 to-rose-600',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/10',
    description: 'Health support'
  },
  {
    id: 'REFEREE',
    name: 'Referee/Umpire',
    icon: Award,
    color: 'from-slate-500 to-gray-600',
    borderColor: 'border-slate-500/30',
    bgColor: 'bg-slate-500/10',
    description: 'Officiating role'
  }
];

interface TeamRoleSelectorProps {
  gender?: string;
  onSelection: (teamType: string, teamRole: string) => void;
  selectedTeamType?: string;
  selectedTeamRole?: string;
}

export default function TeamRoleSelector({
  gender = 'both',
  onSelection,
  selectedTeamType,
  selectedTeamRole
}: TeamRoleSelectorProps) {
  const [selectedType, setSelectedType] = useState(selectedTeamType || '');
  const [selectedRole, setSelectedRole] = useState(selectedTeamRole || '');

  // Filter team types based on gender
  const availableTeamTypes = TEAM_TYPES.filter(
    team => team.gender === 'both' || team.gender === gender
  );

  const handleTeamTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    onSelection(typeId, selectedRole);
  };

  const handleTeamRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    onSelection(selectedType, roleId);
  };

  return (
    <div className="space-y-6">
      {/* Team Types Section */}
      <div>
        <h3 className="text-lg font-semibold text-[#F5F0E8] mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#E8A33D]" />
          Select Your Team
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableTeamTypes.map((team) => {
            const Icon = team.icon;
            const isSelected = selectedType === team.id;
            
            return (
              <motion.button
                key={team.id}
                type="button"
                onClick={() => handleTeamTypeSelect(team.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? `${team.borderColor} ${team.bgColor} border-[#E8A33D]` 
                    : 'border-[#2A2438] bg-[#0B0912]/50 hover:border-[#E8A33D]/50'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-[#E8A33D]" />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${team.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-[#F5F0E8]">{team.name}</p>
                    <p className="text-xs text-[#A79C8C] mt-1">{team.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Team Roles Section */}
      <div>
        <h3 className="text-lg font-semibold text-[#F5F0E8] mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#E8A33D]" />
          Select Your Role
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEAM_ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.button
                key={role.id}
                type="button"
                onClick={() => handleTeamRoleSelect(role.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? `${role.borderColor} ${role.bgColor} border-[#E8A33D]` 
                    : 'border-[#2A2438] bg-[#0B0912]/50 hover:border-[#E8A33D]/50'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-[#E8A33D]" />
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${role.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium text-[#F5F0E8]">{role.name}</p>
                    <p className="text-xs text-[#A79C8C] mt-1">{role.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Special Styling for Support Roles */}
      {(selectedRole === 'CHEERLEADER' || selectedRole === 'KIT_MANAGER') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border-2 ${
            selectedRole === 'CHEERLEADER'
              ? 'bg-pink-500/10 border-pink-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {selectedRole === 'CHEERLEADER' ? (
              <Heart className="w-6 h-6 text-pink-500" />
            ) : (
              <Package className="w-6 h-6 text-amber-500" />
            )}
            <div>
              <p className="font-medium text-[#F5F0E8]">
                {selectedRole === 'CHEERLEADER' ? 'Cheerleader Squad' : 'Kit Management Team'}
              </p>
              <p className="text-sm text-[#A79C8C]">
                {selectedRole === 'CHEERLEADER'
                  ? 'Bring energy and spirit to the games!'
                  : 'Keep the team equipped and ready!'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}