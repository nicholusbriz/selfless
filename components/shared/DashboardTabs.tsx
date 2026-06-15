'use client';

import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface DashboardTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex gap-2 mb-6 flex-shrink-0 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium whitespace-nowrap transition-all text-xs sm:text-sm ${
              isActive
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}