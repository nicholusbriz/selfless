'use client';

import { useRouter } from 'next/navigation';

interface DashboardButtonProps {
  text?: string;
  className?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function DashboardButton({
  text = "Go to Dashboard",
  className = "",
  icon = "🏠",
  size = 'md',
  variant = 'primary',
  fullWidth = true,
  disabled = false,
  onClick
}: DashboardButtonProps) {
  const router = useRouter();

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-4 px-8 text-lg',
    lg: 'py-6 px-12 text-xl'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-amber-500/25',
    secondary: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-emerald-500/25',
    outline: 'bg-transparent border-2 border-white/30 hover:bg-white/10 text-white hover:border-white/50'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation behavior
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        router.push(`/dashboard?${urlParams.toString()}`);
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        font-bold rounded-lg transition-all duration-300 transform hover:scale-102 flex items-center justify-center gap-3 ${className}
      `}
    >
      <span className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
        {icon}
      </span>
      <span className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'}`}>
        {text}
      </span>
    </button>
  );
}
