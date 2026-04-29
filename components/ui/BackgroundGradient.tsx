'use client';

interface BackgroundGradientProps {
  className?: string;
  showGrid?: boolean;
  children?: React.ReactNode;
}

export default function BackgroundGradient({ 
  className = "h-screen relative overflow-hidden",
  showGrid = true,
  children
}: BackgroundGradientProps) {
  return (
    <div className={`${className} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}>
      {showGrid && (
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      )}
      {children && (
        <div className="relative z-10 backdrop-blur-sm h-full">
          {children}
        </div>
      )}
    </div>
  );
}
