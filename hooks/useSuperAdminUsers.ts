// hooks/useSuperAdminUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi, type User, type UsersResponse, type UpdateUserData } from '@/lib/api/admin-users';

// React Query Hooks
export const useSuperAdminUsers = (params?: {
  page?: number;
  limit?: number;
  techCenterId?: string;
  country?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: ['superAdminUsers', params],
    queryFn: () => adminUsersApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useSuperAdminUser = (userId: string) => {
  return useQuery({
    queryKey: ['superAdminUser', userId],
    queryFn: () => adminUsersApi.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSuperAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      adminUsersApi.updateUser(userId, data),
    onMutate: async ({ userId, data }: { userId: string; data: UpdateUserData }) => {
      await queryClient.cancelQueries({ queryKey: ['superAdminUsers'] });
      await queryClient.cancelQueries({ queryKey: ['superAdminUser', userId] });

      const previousUsers = queryClient.getQueriesData<UsersResponse>({
        queryKey: ['superAdminUsers'],
      });
      const previousUser = queryClient.getQueryData(['superAdminUser', userId]) as User;

      previousUsers.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: UsersResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.map(user =>
              user.id === userId ? { ...user, ...data } : user
            ),
          };
        });
      });

      queryClient.setQueryData(['superAdminUser', userId], (old: User | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousUsers, previousUser };
    },
    onError: (err, variables, context) => {
      context?.previousUsers?.forEach(([queryKey, previousData]) => {
        if (previousData) queryClient.setQueryData(queryKey, previousData);
      });
      if (context?.previousUser) {
        queryClient.setQueryData(['superAdminUser', variables.userId], context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminUser'] });
    },
  });
};

export const useUpdateSuperAdminUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      adminUsersApi.updateUserRole(userId, roleId),
    onMutate: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['superAdminUsers'] });
      await queryClient.cancelQueries({ queryKey: ['superAdminUser', userId] });

      const previousUsers = queryClient.getQueriesData<UsersResponse>({
        queryKey: ['superAdminUsers'],
      });
      const previousUser = queryClient.getQueryData(['superAdminUser', userId]) as User;

      const filters = previousUsers.find(([, data]) => data)?.[1]?.filters;
      const roleInfo = filters?.roles.find(r => r.id === roleId);

      previousUsers.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: UsersResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.map(user =>
              user.id === userId
                ? {
                    ...user,
                    roleId,
                    role: roleInfo ? {
                      id: roleId,
                      name: roleInfo.name,
                      displayName: roleInfo.displayName,
                    } : user.role
                  }
                : user
            ),
          };
        });
      });

      queryClient.setQueryData(['superAdminUser', userId], (old: User | undefined) => {
        if (!old) return old;
        return {
          ...old,
          roleId,
          role: roleInfo ? {
            id: roleId,
            name: roleInfo.name,
            displayName: roleInfo.displayName,
          } : old.role,
        };
      });

      return { previousUsers, previousUser };
    },
    onError: (err, variables, context) => {
      context?.previousUsers?.forEach(([queryKey, previousData]) => {
        if (previousData) queryClient.setQueryData(queryKey, previousData);
      });
      if (context?.previousUser) {
        queryClient.setQueryData(['superAdminUser', variables.userId], context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminUser'] });
    },
  });
};

export const useUpdateSuperAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminUsersApi.updateUserStatus(userId, status),
    onMutate: async ({ userId, status }: { userId: string; status: string }) => {
      await queryClient.cancelQueries({ queryKey: ['superAdminUsers'] });
      await queryClient.cancelQueries({ queryKey: ['superAdminUser', userId] });

      const previousUsers = queryClient.getQueriesData<UsersResponse>({
        queryKey: ['superAdminUsers'],
      });
      const previousUser = queryClient.getQueryData(['superAdminUser', userId]) as User;

      const isActive = status === 'ACTIVE';

      previousUsers.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, (old: UsersResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.map(user =>
              user.id === userId
                ? { ...user, status: status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', isActive }
                : user
            ),
          };
        });
      });

      queryClient.setQueryData(['superAdminUser', userId], (old: User | undefined) => {
        if (!old) return old;
        return { ...old, status: status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', isActive };
      });

      return { previousUsers, previousUser };
    },
    onError: (err, variables, context) => {
      context?.previousUsers?.forEach(([queryKey, previousData]) => {
        if (previousData) queryClient.setQueryData(queryKey, previousData);
      });
      if (context?.previousUser) {
        queryClient.setQueryData(['superAdminUser', variables.userId], context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminUser'] });
    },
  });
};

export const useDeleteSuperAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.deleteUser(userId),
    onMutate: async (userId: string) => {
      // Cancel any in-flight fetches for both cache keys
      await queryClient.cancelQueries({ queryKey: ['superAdminUsers'] });
      await queryClient.cancelQueries({ queryKey: ['superAdminUser', userId] });
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });

      const previousSuperAdminUsers = queryClient.getQueriesData<UsersResponse>({
        queryKey: ['superAdminUsers'],
      });
      const previousUser = queryClient.getQueryData(['superAdminUser', userId]) as User;
      const previousAdminUsers = queryClient.getQueriesData<UsersResponse>({
        queryKey: ['adminUsers'],
      });

      const removeUserFromList = (old: UsersResponse | undefined) => {
        if (!old || !old.users.some((user) => user.id === userId)) return old;
        return {
          ...old,
          users: old.users.filter((user) => user.id !== userId),
          pagination: old.pagination
            ? { ...old.pagination, total: Math.max(0, old.pagination.total - 1) }
            : old.pagination,
        };
      };

      previousSuperAdminUsers.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, removeUserFromList);
      });

      previousAdminUsers.forEach(([queryKey]) => {
        queryClient.setQueryData(queryKey, removeUserFromList);
      });

      queryClient.removeQueries({ queryKey: ['superAdminUser', userId], exact: true });

      return { previousSuperAdminUsers, previousAdminUsers, previousUser };
    },
    onError: (err, userId, context) => {
      // Roll back both caches on failure
      context?.previousSuperAdminUsers?.forEach(([queryKey, previousData]) => {
        if (previousData) queryClient.setQueryData(queryKey, previousData);
      });
      context?.previousAdminUsers?.forEach(([queryKey, previousData]) => {
        if (previousData) queryClient.setQueryData(queryKey, previousData);
      });
      if (context?.previousUser) {
        queryClient.setQueryData(['superAdminUser', userId], context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superAdminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminUser'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};