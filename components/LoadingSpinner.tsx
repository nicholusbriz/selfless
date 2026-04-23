import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'border-violet-500', 
  className = '',
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const borderClasses = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${borderClasses[size]} ${color} rounded-full animate-spin border-t-transparent`}
        ></div>
        <div
          className={`absolute inset-0 ${sizeClasses[size]} ${borderClasses[size]} ${color} rounded-full animate-ping opacity-20`}
        ></div>
      </div>
      {text && (
        <p className="mt-3 text-sm text-violet-300 animate-pulse">{text}</p>
      )}
    </div>
  );
}
