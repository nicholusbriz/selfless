'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center">
      <Icon className="w-12 h-12 mx-auto mb-4 text-gray-500" />
      <p className="text-gray-400">{title}</p>
      <p className="text-sm mt-2 text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}