'use client';

export interface TabItem {
  id: string;
  label: string;
}

interface DashboardTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function DashboardTabs({ tabs, activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 flex-shrink-0">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 text-sm sm:text-base ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-purple-500/30'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}