'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'orange' | 'emerald' | 'cyan' | 'purple';
  className?: string;
  showText?: boolean;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md',
  color = 'white',
  className = '',
  showText = false,
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  const borderClasses = {
    white: 'border-white border-t-transparent',
    orange: 'border-orange-400 border-t-white',
    emerald: 'border-emerald-400 border-t-white',
    cyan: 'border-cyan-400 border-t-transparent',
    purple: 'border-purple-400 border-t-white'
  };

  const textColors = {
    white: 'text-white',
    orange: 'text-orange-200',
    emerald: 'text-emerald-200',
    cyan: 'text-cyan-300',
    purple: 'text-purple-200'
  };

  return (
    <div className={`text-center ${className}`}>
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-4 ${borderClasses[color]} mx-auto ${showText ? 'mb-4' : ''}`}
      />
      {showText && (
        <p className={`${textColors[color]} text-xl font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
}
