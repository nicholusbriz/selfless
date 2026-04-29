'use client';

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export default function LoadingButton({ 
  isLoading,
  loadingText = "Loading...",
  children,
  className = '',
  disabled = false,
  type = 'button',
  onClick
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      className={className}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
