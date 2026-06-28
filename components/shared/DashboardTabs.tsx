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
    <div className="flex gap-6 flex-wrap">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              text-sm font-medium transition-colors duration-200
              ${isActive 
                ? 'text-white underline underline-offset-4 decoration-2' 
                : 'text-gray-400 hover:text-gray-200'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
