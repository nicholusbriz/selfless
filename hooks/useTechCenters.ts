import { useQuery } from '@tanstack/react-query';

export interface TechCenter {
  id: string;
  name: string;
  country: {
    id: string;
    name: string;
    code: string;
  } | null;
  isActive: boolean;
}

export function useTechCenters() {
  return useQuery({
    queryKey: ['tech-centers'],
    queryFn: async () => {
      const response = await fetch('/api/tech-centers');
      if (!response.ok) {
        throw new Error('Failed to fetch tech centers');
      }
      return response.json() as Promise<TechCenter[]>;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
