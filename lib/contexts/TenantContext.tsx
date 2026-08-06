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
    color: '#D4952A',
    accentColor: '#B8860B',
    description: 'Freedom City Tech Center',
  },
  'jinja': {
    id: 'jinja',
    name: 'Jinja',
    slug: 'jinja',
    displayName: 'Jinja',
    color: '#0D9488',
    accentColor: '#0F766E',
    description: 'Jinja Tech Center',
  },
  'mbale': {
    id: 'mbale',
    name: 'Mbale',
    slug: 'mbale',
    displayName: 'Mbale',
    color: '#2563EB',
    accentColor: '#1D4ED8',
    description: 'Mbale Tech Center',
  },
  'sseta': {
    id: 'sseta',
    name: 'Sseta',
    slug: 'sseta',
    displayName: 'Sseta',
    color: '#7C3AED',
    accentColor: '#6D28D9',
    description: 'Sseta Tech Center',
  },
  'masaka': {
    id: 'masaka',
    name: 'Masaka',
    slug: 'masaka',
    displayName: 'Masaka',
    color: '#DB2777',
    accentColor: '#BE185D',
    description: 'Masaka Tech Center',
  },
  'lira': {
    id: 'lira',
    name: 'Lira',
    slug: 'lira',
    displayName: 'Lira',
    color: '#EA580C',
    accentColor: '#C2410C',
    description: 'Lira Tech Center',
  },
  'ntinda': {
    id: 'ntinda',
    name: 'Ntinda',
    slug: 'ntinda',
    displayName: 'Ntinda',
    color: '#0891B2',
    accentColor: '#0E7490',
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
