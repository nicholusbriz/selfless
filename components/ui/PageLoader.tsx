'use client';

import BackgroundImage from './BackgroundImage';

interface PageLoaderProps {
  text?: string;
  color?: 'white' | 'orange' | 'emerald' | 'cyan' | 'purple';
}

export default function PageLoader({
  text = "Loading...",
  color = 'white'
}: PageLoaderProps) {

  return (
    <BackgroundImage className="h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Subtle animated elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-white/10 rounded-full blur-3xl animate-float animation-delay-1000"></div>
      <div className="absolute bottom-40 right-1/4 w-28 h-28 bg-white/10 rounded-full blur-3xl animate-float animation-delay-3000"></div>

      <div className="relative z-10 text-center">
        {/* Main loader container with glass morphism */}
        <div className="glass-card rounded-3xl p-12 mx-auto max-w-md animate-scale-in shadow-glow-lg">

          {/* Simple logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-8 shadow-xl p-3 animate-scale-in">
            <div className="w-full h-full bg-white/10 rounded-full"></div>
          </div>

          {/* Simple spinner */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto relative">
              {/* Single spinning ring */}
              <div className={`absolute inset-0 rounded-full border-2 border-white/20 animate-spin ${color === 'white' ? 'border-t-white' : `border-t-${color}-400`
                }`}></div>

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${color === 'white' ? 'bg-white/60' : `bg-${color}-400/60`
                  }`}></div>
              </div>
            </div>
          </div>

          {/* Simple loading text */}
          <div className="space-y-4">
            <h3 className={`text-3xl font-bold text-white animate-slide-in-up`}>
              {text}
            </h3>

            {/* Animated dots */}
            <div className="flex justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full animate-bounce ${color === 'white' ? 'bg-white' : `bg-${color}-400`
                }`}></div>
              <div className={`w-3 h-3 rounded-full animate-bounce animation-delay-200 ${color === 'white' ? 'bg-white' : `bg-${color}-400`
                }`}></div>
              <div className={`w-3 h-3 rounded-full animate-bounce animation-delay-400 ${color === 'white' ? 'bg-white' : `bg-${color}-400`
                }`}></div>
            </div>

            {/* Simple progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className={`h-full bg-white/30 animate-pulse-slow`}></div>
            </div>
          </div>
        </div>

      </div>
    </BackgroundImage>
  );
}
