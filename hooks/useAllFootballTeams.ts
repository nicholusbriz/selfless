import { useQuery } from '@tanstack/react-query';
import { useTechCenters } from './useTechCenters';
import { isJsonObject, readJsonObject } from '@/lib/api-response';

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

function isTeamMember(value: unknown): value is TeamMember {
  if (!isJsonObject(value) || !isJsonObject(value.user) || !isJsonObject(value.techCenter)) {
    return false;
  }

  const country = value.techCenter.country;
  return (
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.techCenterId === 'string' &&
    typeof value.teamType === 'string' &&
    typeof value.teamRole === 'string' &&
    (typeof value.jerseyNumber === 'number' || value.jerseyNumber === null) &&
    (typeof value.position === 'string' || value.position === null) &&
    typeof value.isActive === 'boolean' &&
    typeof value.joinedAt === 'string' &&
    typeof value.user.id === 'string' &&
    typeof value.user.firstName === 'string' &&
    typeof value.user.lastName === 'string' &&
    typeof value.user.email === 'string' &&
    (typeof value.user.profileImageUrl === 'string' || value.user.profileImageUrl === null) &&
    (typeof value.user.phoneNumber === 'string' || value.user.phoneNumber === null) &&
    typeof value.techCenter.id === 'string' &&
    typeof value.techCenter.name === 'string' &&
    (country === null ||
      (isJsonObject(country) && typeof country.name === 'string'))
  );
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
              const teamData = await readJsonObject(teamResponse);
              return {
                techCenterId: techCenter.id,
                techCenterName: techCenter.name,
                members: Array.isArray(teamData.teamMembers)
                  ? teamData.teamMembers.filter(isTeamMember)
                  : [],
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

      // Return all teams (including those with no members)
      return teamsData;
    },
    enabled: !!techCenters && !techCentersLoading,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
