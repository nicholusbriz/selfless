// hooks/useAdminUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTechCenterUsersApi, type User, type UsersResponse, type UpdateUserData } from '@/lib/api/admin-tech-center-users';

// React Query Hooks
export const useAdminUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => adminTechCenterUsersApi.getUsers(params),
  });
};

export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: ['adminUser', userId],
    queryFn: () => adminTechCenterUsersApi.getUser(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) => 
      adminTechCenterUsersApi.updateUser(userId, data),
    onMutate: async ({ userId, data }: { userId: string; data: UpdateUserData }) => {
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });
      await queryClient.cancelQueries({ queryKey: ['adminUser', userId] });
      
      const previousUsers = queryClient.getQueryData(['adminUsers']) as UsersResponse;
      const previousUser = queryClient.getQueryData(['adminUser', userId]) as User;
      
      queryClient.setQueryData(['adminUsers'], (old: UsersResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          users: old.users.map(user => 
            user.id === userId 
              ? { ...user, ...data }
              : user
          ),
        };
      });
      
      queryClient.setQueryData(['adminUser', userId], (old: User | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });
      
      return { previousUsers, previousUser };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['adminUsers'], context.previousUsers);
      }
      if (context?.previousUser) {
        queryClient.setQueryData(['adminUser', variables.userId], context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser'] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) => 
      adminTechCenterUsersApi.updateUserRole(userId, roleId),
    onMutate: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });
      await queryClient.cancelQueries({ queryKey: ['adminUser', userId] });
      
      const previousUsers = queryClient.getQueryData(['adminUsers']) as UsersResponse;
      const previousUser = queryClient.getQueryData(['adminUser', userId]) as User;
      
      // Get role info from filters
      const filters = previousUsers?.filters;
      const roleInfo = filters?.roles.find(r => r.id === roleId);
      
      queryClient.setQueryData(['adminUsers'], (old: UsersResponse | undefined) => {
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
      
      queryClient.setQueryData(['adminUser', userId], (old: User | undefined) => {
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
      if (context?.previousUsers) {
        queryClient.setQueryData(['adminUsers'], context.previousUsers);
      }
      if (context?.previousUser) {
        queryClient.setQueryData(['adminUser', variables.userId], context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) => 
      adminTechCenterUsersApi.updateUserStatus(userId, status),
    onMutate: async ({ userId, status }: { userId: string; status: string }) => {
      await queryClient.cancelQueries({ queryKey: ['adminUsers'] });
      await queryClient.cancelQueries({ queryKey: ['adminUser', userId] });
      
      const previousUsers = queryClient.getQueryData(['adminUsers']) as UsersResponse;
      const previousUser = queryClient.getQueryData(['adminUser', userId]) as User;
      
      const isActive = status === 'ACTIVE';
      
      queryClient.setQueryData(['adminUsers'], (old: UsersResponse | undefined) => {
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
      
      queryClient.setQueryData(['adminUser', userId], (old: User | undefined) => {
        if (!old) return old;
        return { ...old, status: status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', isActive };
      });
      
      return { previousUsers, previousUser };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['adminUsers'], context.previousUsers);
      }
      if (context?.previousUser) {
        queryClient.setQueryData(['adminUser', variables.userId], context.previousUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser'] });
    },
  });
};
