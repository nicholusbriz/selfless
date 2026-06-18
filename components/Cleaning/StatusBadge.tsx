import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  count: number;
  status: 'attended' | 'pending' | 'no-show';
}

const statusConfig = {
  attended: { 
    icon: CheckCircle, 
    color: 'text-green-400', 
    bg: 'bg-green-500/20', 
    border: 'border-green-500/30',
  },
  pending: { 
    icon: Clock, 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-500/20', 
    border: 'border-yellow-500/30',
  },
  'no-show': { 
    icon: XCircle, 
    color: 'text-red-400', 
    bg: 'bg-red-500/20', 
    border: 'border-red-500/30',
  }
};

export default function StatusBadge({ count, status }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (count === 0) return null;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bg} border ${config.border}`}>
      {config.icon && <config.icon className={`w-3 h-3 ${config.color}`} />}
      <span className={`text-xs font-medium ${config.color}`}>{count}</span>
    </div>
  );
}
