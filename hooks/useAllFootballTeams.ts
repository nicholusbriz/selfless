import { useQuery } from '@tanstack/react-query';
import { useTechCenters } from './useTechCenters';

interface TeamMember {
  id: string;
  userId: string;
  techCenterId: string;
  teamType: string;
  teamRole: string;
  jerseyNumber: number | null;
  position: string | null;
  isActive: boolean;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
    phoneNumber: string | null;
  };
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    } | null;
  };
}

interface FootballTeam {
  techCenterId: string;
  techCenterName: string;
  members: TeamMember[];
}

export function useAllFootballTeams() {
  const { data: techCenters, isLoading: techCentersLoading } = useTechCenters();

  return useQuery({
    queryKey: ['all-football-teams'],
    queryFn: async () => {
      if (!techCenters) return [];

      // Fetch football team members for each tech center
      const teamsData: FootballTeam[] = await Promise.all(
        techCenters.map(async (techCenter: { id: string; name: string }) => {
          try {
            const teamResponse = await fetch(`/api/football-team/${techCenter.id}`);
            if (teamResponse.ok) {
              const teamData = await teamResponse.json();
              return {
                techCenterId: techCenter.id,
                techCenterName: techCenter.name,
                members: teamData.teamMembers || []
              };
            }
            return {
              techCenterId: techCenter.id,
              techCenterName: techCenter.name,
              members: []
            };
          } catch (err) {
            console.error(`Error fetching team for ${techCenter.name}:`, err);
            return {
              techCenterId: techCenter.id,
              techCenterName: techCenter.name,
              members: []
            };
          }
        })
      );

      // Filter out teams with no members
      return teamsData.filter(team => team.members.length > 0);
    },
    enabled: !!techCenters && !techCentersLoading,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
