// lib/contexts/TenantContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export interface TechCenterConfig {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  color: string;
  accentColor: string;
  logo?: string;
  description?: string;
}

const techCenterConfigs: Record<string, TechCenterConfig> = {
  'freedom-city': {
    id: 'freedom-city',
    name: 'Freedom City',
    slug: 'freedom-city',
    displayName: 'Freedom City',
    color: '#E8A33D',
    accentColor: '#C97F1F',
    description: 'Freedom City Tech Center',
  },
  'jinja': {
    id: 'jinja',
    name: 'Jinja',
    slug: 'jinja',
    displayName: 'Jinja',
    color: '#10B981',
    accentColor: '#059669',
    description: 'Jinja Tech Center',
  },
  'mbale': {
    id: 'mbale',
    name: 'Mbale',
    slug: 'mbale',
    displayName: 'Mbale',
    color: '#3B82F6',
    accentColor: '#2563EB',
    description: 'Mbale Tech Center',
  },
  'sseta': {
    id: 'sseta',
    name: 'Sseta',
    slug: 'sseta',
    displayName: 'Sseta',
    color: '#8B5CF6',
    accentColor: '#7C3AED',
    description: 'Sseta Tech Center',
  },
  'masaka': {
    id: 'masaka',
    name: 'Masaka',
    slug: 'masaka',
    displayName: 'Masaka',
    color: '#EC4899',
    accentColor: '#DB2777',
    description: 'Masaka Tech Center',
  },
  'lira': {
    id: 'lira',
    name: 'Lira',
    slug: 'lira',
    displayName: 'Lira',
    color: '#F59E0B',
    accentColor: '#D97706',
    description: 'Lira Tech Center',
  },
  'ntinda': {
    id: 'ntinda',
    name: 'Ntinda',
    slug: 'ntinda',
    displayName: 'Ntinda',
    color: '#06B6D4',
    accentColor: '#0891B2',
    description: 'Ntinda Tech Center',
  },
};

interface TenantContextType {
  currentTechCenter: TechCenterConfig | null;
  setCurrentTechCenter: (slug: string | null) => void;
  isTenantView: boolean;
  getAllTechCenters: () => TechCenterConfig[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTechCenter, setCurrentTechCenterState] = useState<TechCenterConfig | null>(null);
  const pathname = usePathname();

  // Detect tech center from URL
  useEffect(() => {
    const match = pathname.match(/\/tech-center\/([^\/]+)/);
    if (match && match[1] && techCenterConfigs[match[1]]) {
      setCurrentTechCenterState(techCenterConfigs[match[1]]);
    } else {
      setCurrentTechCenterState(null);
    }
  }, [pathname]);

  const setCurrentTechCenter = (slug: string | null) => {
    if (slug && techCenterConfigs[slug]) {
      setCurrentTechCenterState(techCenterConfigs[slug]);
    } else {
      setCurrentTechCenterState(null);
    }
  };

  const isTenantView = currentTechCenter !== null;

  const getAllTechCenters = () => Object.values(techCenterConfigs);

  return (
    <TenantContext.Provider
      value={{
        currentTechCenter,
        setCurrentTechCenter,
        isTenantView,
        getAllTechCenters,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
