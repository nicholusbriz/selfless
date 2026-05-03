'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'hero' | 'admin' | 'course' | 'announcement' | 'cleaning';
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

const LogoConfig = {
  xs: { width: 24, height: 24, container: 'w-6 h-6' },
  sm: { width: 80, height: 80, container: 'w-20 h-20' },
  md: { width: 96, height: 96, container: 'w-24 h-24' },
  lg: { width: 128, height: 128, container: 'w-32 h-32' },
  xl: { width: 160, height: 160, container: 'w-40 h-40' },
  '2xl': { width: 192, height: 192, container: 'w-48 h-48' }
} as const;

const VariantStyles = {
  default: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800',
  hero: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950',
  admin: 'bg-gradient-to-br from-purple-700 via-indigo-700 to-pink-800',
  course: 'bg-gradient-to-br from-emerald-600 via-green-700 to-teal-800',
  announcement: 'bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800',
  cleaning: 'bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-800'
} as const;

export default function Logo({
  size = 'md',
  variant = 'default',
  className = '',
  style,
  loading = 'lazy',
  priority = false
}: LogoProps) {
  const config = LogoConfig[size];
  const variantStyle = VariantStyles[variant];

  const baseClasses = `inline-flex items-center justify-center ${config.container} ${variantStyle} rounded-full shadow-2xl p-2 relative transition-all duration-300 hover:scale-105`;
  const combinedClassName = `${baseClasses} ${className}`;

  const defaultStyle = {
    boxShadow: variant === 'hero'
      ? '0 0 80px rgba(59, 130, 246, 0.8), 0 0 160px rgba(99, 102, 241, 0.6), inset 0 0 60px rgba(255, 255, 255, 0.2), 0 0 200px rgba(59, 130, 246, 0.3)'
      : variant === 'admin'
        ? '0 0 60px rgba(147, 51, 234, 0.8), 0 0 120px rgba(99, 102, 241, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.15), 0 0 150px rgba(147, 51, 234, 0.3)'
        : variant === 'announcement'
          ? '0 0 60px rgba(6, 182, 212, 0.8), 0 0 120px rgba(59, 130, 246, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.15), 0 0 150px rgba(6, 182, 212, 0.3)'
          : variant === 'course'
            ? '0 0 60px rgba(16, 185, 129, 0.8), 0 0 120px rgba(5, 150, 105, 0.5), inset 0 0 40px rgba(255, 255, 255, 0.15), 0 0 150px rgba(16, 185, 129, 0.3)'
            : '0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(99, 102, 241, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.15), 0 0 100px rgba(59, 130, 246, 0.3)',
    ...style
  };

  return (
    <div className={combinedClassName} style={defaultStyle}>
      {/* Modern animated backgrounds */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {variant === 'hero' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse-slow"></div>
        )}
        {variant === 'admin' && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 animate-pulse-slow"></div>
        )}
        {variant === 'announcement' && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 animate-pulse-slow"></div>
        )}
        {variant === 'course' && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 animate-pulse-slow"></div>
        )}
        {variant === 'cleaning' && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse-slow"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent animate-shimmer"></div>
      </div>

      <Image
        src="/freedom.png"
        alt="Freedom City Tech Center Logo"
        width={config.width}
        height={config.height}
        className={`w-full h-full object-contain relative z-10 transition-all duration-300 ${variant === 'hero' ? 'animate-glow' : ''
          }`}
        style={{
          filter: variant === 'hero'
            ? 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.95)) brightness(1.1) contrast(1.1)'
            : variant === 'admin'
              ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) brightness(1.1) contrast(1.1)'
              : variant === 'announcement'
                ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) brightness(1.1) contrast(1.1)'
                : variant === 'course'
                  ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) brightness(1.1) contrast(1.1)'
                  : 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.7)) brightness(1.05) contrast(1.05)'
        }}
        loading={loading}
        priority={priority}
      />
    </div>
  );
}
