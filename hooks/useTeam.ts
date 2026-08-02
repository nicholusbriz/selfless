import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

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
  techCenter: {
    id: string;
    name: string;
    country: {
      name: string;
    } | null;
  };
}

export interface TeamData {
  teamMembers: TeamMember[];
  currentUserMembership: TeamMember | null;
  totalMembers: number;
}

// Hook to fetch team members for a tech center and team type
export function useTeam(techCenterId: string | null, teamType: string) {
  return useQuery({
    queryKey: ['team', techCenterId, teamType],
    queryFn: async () => {
      if (!techCenterId || !teamType) return null;
      
      const response = await axios.get<TeamData>(`/api/team/${techCenterId}/${teamType}`);
      return response.data;
    },
    enabled: !!techCenterId && !!teamType,
    staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
    gcTime: 30 * 60 * 1000, // 30 minutes - cache data for longer
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if cached data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
}

// Hook to register for team with optimistic updates
export function useRegisterForTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { techCenterId: string; teamType: string; teamRole: string; jerseyNumber: number; position: string }) => {
      const response = await axios.post('/api/team/register', data);
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches for all team queries
      await queryClient.cancelQueries({ queryKey: ['team'] });

      // Snapshot previous values for all team types
      const previousDataMap = new Map<string, TeamData>();
      const teamTypes = ['FOOTBALL', 'VOLLEYBALL', 'NETBALL', 'BASKETBALL', 'ATHLETICS'];
      
      teamTypes.forEach(teamType => {
        const queryKey = ['team', variables.techCenterId, teamType];
        const data = queryClient.getQueryData<TeamData>(queryKey);
        if (data) {
          previousDataMap.set(teamType, JSON.parse(JSON.stringify(data)));
        }
      });

      // Optimistically update the specific team type being joined
      queryClient.setQueryData<TeamData>(['team', variables.techCenterId, variables.teamType], (old) => {
        if (!old) {
          // Create new data if none exists
          return {
            teamMembers: [],
            currentUserMembership: null,
            totalMembers: 0
          };
        }

        // Add the new member optimistically
        const newMember: TeamMember = {
          id: 'temp-id-' + Date.now(),
          userId: 'current-user',
          techCenterId: variables.techCenterId,
          teamType: variables.teamType,
          teamRole: variables.teamRole,
          jerseyNumber: variables.jerseyNumber,
          position: variables.position,
          isActive: true,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: {
            id: 'current-user',
            firstName: 'You',
            lastName: '',
            email: '',
            profileImageUrl: null,
            phoneNumber: null
          },
          techCenter: old.teamMembers[0]?.techCenter || {
            id: variables.techCenterId,
            name: '',
            country: null
          }
        };

        return {
          ...old,
          teamMembers: [...old.teamMembers, newMember],
          currentUserMembership: newMember,
          totalMembers: old.totalMembers + 1
        };
      });

      return { previousDataMap };
    },
    onError: (err, variables, context) => {
      // Rollback all queries on error
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, teamType) => {
          queryClient.setQueryData(['team', variables.techCenterId, teamType], data);
        });
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch only the specific team to ensure server state
      queryClient.invalidateQueries({ queryKey: ['team', variables.techCenterId, variables.teamType] });
    },
  });
}

// Hook to leave team with optimistic updates
export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const response = await axios.post('/api/football-team/leave', { teamId });
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches for all team queries
      await queryClient.cancelQueries({ queryKey: ['team'] });

      // Get all team queries
      const queries = queryClient.getQueriesData<TeamData>({ queryKey: ['team'] });

      // Snapshot previous data
      const previousDataMap = new Map<string, TeamData>();
      queries.forEach(([queryKey, previousData]) => {
        if (previousData) {
          const key = queryKey.join('-');
          previousDataMap.set(key, JSON.parse(JSON.stringify(previousData)));
        }
      });

      // Optimistically update all queries
      queries.forEach(([queryKey, previousData]) => {
        if (previousData) {
          queryClient.setQueryData<TeamData>(queryKey, (old) => {
            if (!old) return old;

            return {
              ...old,
              teamMembers: old.teamMembers.filter(member => member.id !== variables),
              currentUserMembership: old.currentUserMembership?.id === variables ? null : old.currentUserMembership,
              totalMembers: old.totalMembers - 1
            };
          });
        }
      });

      return { previousDataMap };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((data, key) => {
          const queryKey = key.split('-');
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch all team queries
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

// Hook to update team membership with optimistic updates
export function useUpdateTeamMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { teamId: string; jerseyNumber: number; position: string }) => {
      const response = await axios.put('/api/football-team/update', data);
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['team'] });

      // Get all team queries
      const queries = queryClient.getQueriesData<TeamData>({ queryKey: ['team'] });

      // Optimistically update all queries
      queries.forEach(([queryKey, previousData]) => {
        if (previousData) {
          queryClient.setQueryData<TeamData>(queryKey, (old) => {
            if (!old) return old;

            return {
              ...old,
              teamMembers: old.teamMembers.map(member => 
                member.id === variables.teamId 
                  ? { 
                      ...member, 
                      jerseyNumber: variables.jerseyNumber,
                      position: variables.position,
                      updatedAt: new Date().toISOString()
                    }
                  : member
              ),
              currentUserMembership: old.currentUserMembership?.id === variables.teamId
                ? {
                    ...old.currentUserMembership,
                    jerseyNumber: variables.jerseyNumber,
                    position: variables.position,
                    updatedAt: new Date().toISOString()
                  }
                : old.currentUserMembership
            };
          });
        }
      });

      return { previousData: queries };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch all team queries
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}