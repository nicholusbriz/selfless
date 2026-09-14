"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete: () => void;
  delay?: number;
}

const loadingMessages = [
  "Initializing platform...",
  "Connecting tech center...",
  "Checking network security...",
  "Loading educational resources...",
  "Preparing your dashboard...",
];

export default function LoadingScreen({ onComplete, delay = 2000 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, delay);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, delay / 50);

    // Message cycling animation
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, delay / loadingMessages.length);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [delay, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[#0F172A] overflow-hidden">
      
      {/* Subtle Background Texture for Depth */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(185, 138, 62, 0.08) 0%, transparent 60%)'
        }}
      />

      <div className="relative z-10 text-center space-y-10 px-6 max-w-md w-full">
        
        {/* Logo & Orbital Animation */}
        <div className="relative flex justify-center">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32">
            {/* Outer subtle ring */}
            <div className="absolute inset-0 rounded-full border border-[#B98A3E]/20 animate-[spin_8s_linear_infinite]" />
            
            {/* Mid pulsing ring */}
            <div className="absolute inset-2 rounded-full border-2 border-[#B98A3E]/30 animate-pulse" />
            
            {/* Inner glowing ring */}
            <div className="absolute inset-4 rounded-full border-2 border-[#B98A3E]/60 animate-[ping_3s_ease-in-out_infinite]" />
            
            {/* Logo */}
            <div className="absolute inset-6 flex items-center justify-center">
              <Image
                src="/icon-512x512.png"
                alt="Selfless CE Logo"
                width={80}
                height={80}
                className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(185,138,62,0.3)]"
                style={{
                  animation: 'fadeInScale 1s cubic-bezier(0.22, 1, 0.36, 1) forwards'
                }}
              />
            </div>
          </div>
        </div>

        {/* Typography Hierarchy */}
        <div className="space-y-4">
          <h1 
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{
              animation: 'slideUpFade 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              animationDelay: '0.2s',
              opacity: 0
            }}
          >
            Selfless CE
          </h1>
          
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-6 bg-[#B98A3E]/50" />
            <p 
              className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70"
              style={{
                animation: 'slideUpFade 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                animationDelay: '0.35s',
                opacity: 0
              }}
            >
              Student Portal
            </p>
            <span className="h-px w-6 bg-[#B98A3E]/50" />
          </div>

          <p 
            className="text-sm text-[#B98A3E] italic tracking-wide"
            style={{
              animation: 'slideUpFade 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              animationDelay: '0.5s',
              opacity: 0
            }}
          >
            Nurturing Resilient Minds
          </p>
        </div>

        {/* Refined Progress Bar & Messages */}
        <div 
          className="w-full max-w-xs mx-auto space-y-3"
          style={{
            animation: 'slideUpFade 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
            animationDelay: '0.65s',
            opacity: 0
          }}
        >
          {/* Progress Track */}
          <div className="h-[3px] bg-white/5 rounded-full overflow-hidden relative">
            {/* Glowing Progress Fill */}
            <div
              className="absolute top-0 left-0 h-full bg-[#B98A3E] rounded-full shadow-[0_0_12px_rgba(185,138,62,0.6)] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Status Text */}
          <div className="flex justify-between items-center px-1">
            <p 
              key={currentMessage} // Key forces re-render for smooth transition
              className="text-[11px] font-medium text-white/50 tracking-wide"
              style={{
                animation: 'messageFade 0.4s ease-out forwards'
              }}
            >
              {loadingMessages[currentMessage]}
            </p>
            <p className="text-[11px] font-bold text-[#B98A3E] tabular-nums tracking-wider">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes messageFade {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}