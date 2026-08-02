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

export interface FootballTeamData {
  teamMembers: TeamMember[];
  currentUserMembership: TeamMember | null;
  totalMembers: number;
}

// Hook to fetch football team members for a tech center
export function useFootballTeam(techCenterId: string | null) {
  return useQuery({
    queryKey: ['football-team', techCenterId],
    queryFn: async () => {
      if (!techCenterId) return null;
      
      const response = await axios.get<FootballTeamData>(`/api/football-team/${techCenterId}`);
      return response.data;
    },
    enabled: !!techCenterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to register for football team with optimistic updates
export function useRegisterForFootballTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { techCenterId: string; jerseyNumber?: number; position?: string; teamRole?: string }) => {
      const response = await axios.post('/api/football-team/register', data);
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['football-team', variables.techCenterId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<FootballTeamData>(['football-team', variables.techCenterId]);

      // Optimistically update
      queryClient.setQueryData<FootballTeamData>(['football-team', variables.techCenterId], (old) => {
        if (!old) return old;

        // Add the new member optimistically
        const newMember: TeamMember = {
          id: 'temp-id',
          userId: 'current-user',
          techCenterId: variables.techCenterId,
          teamType: 'FOOTBALL',
          teamRole: variables.teamRole || 'PLAYER',
          jerseyNumber: variables.jerseyNumber || null,
          position: variables.position || null,
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

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['football-team', variables.techCenterId], context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: ['football-team', variables.techCenterId] });
    },
  });
}

// Hook to leave football team with optimistic updates
export function useLeaveFootballTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const response = await axios.post('/api/football-team/leave', { teamId });
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['football-team'] });

      // Get all football team queries
      const queries = queryClient.getQueriesData<FootballTeamData>({ queryKey: ['football-team'] });

      // Optimistically update all queries
      queries.forEach(([queryKey, previousData]) => {
        if (previousData) {
          queryClient.setQueryData<FootballTeamData>(queryKey, (old) => {
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
      // Refetch all football team queries
      queryClient.invalidateQueries({ queryKey: ['football-team'] });
    },
  });
}

// Hook to update football team membership with optimistic updates
export function useUpdateFootballTeamMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { teamId: string; jerseyNumber?: number; position?: string }) => {
      const response = await axios.put('/api/football-team/update', data);
      return response.data;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['football-team'] });

      // Get all football team queries
      const queries = queryClient.getQueriesData<FootballTeamData>({ queryKey: ['football-team'] });

      // Optimistically update all queries
      queries.forEach(([queryKey, previousData]) => {
        if (previousData) {
          queryClient.setQueryData<FootballTeamData>(queryKey, (old) => {
            if (!old) return old;

            return {
              ...old,
              teamMembers: old.teamMembers.map(member => 
                member.id === variables.teamId 
                  ? { 
                      ...member, 
                      jerseyNumber: variables.jerseyNumber !== undefined ? variables.jerseyNumber : member.jerseyNumber,
                      position: variables.position !== undefined ? variables.position : member.position,
                      updatedAt: new Date().toISOString()
                    }
                  : member
              ),
              currentUserMembership: old.currentUserMembership?.id === variables.teamId
                ? {
                    ...old.currentUserMembership,
                    jerseyNumber: variables.jerseyNumber !== undefined ? variables.jerseyNumber : old.currentUserMembership.jerseyNumber,
                    position: variables.position !== undefined ? variables.position : old.currentUserMembership.position,
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
      // Refetch all football team queries
      queryClient.invalidateQueries({ queryKey: ['football-team'] });
    },
  });
}
