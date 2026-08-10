"use client";

import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  delay?: number;
}

export default function LoadingScreen({ onComplete, delay = 2000 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  const loadingMessages = [
    "Initializing platform...",
    "Connecting tech center...",
    "Checking network security...",
    "Loading educational resources...",
    "Preparing your dashboard..."
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1117]">
      <div className="text-center space-y-8">
        {/* Logo */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-[#E8A33D] opacity-20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-[#E8A33D] opacity-40 animate-pulse" />
            <img
              src="/icon-512x512.png"
              alt="Selfless CE Logo"
              className="relative w-full h-full object-contain"
              style={{
                animation: 'fadeIn 0.8s ease-out forwards'
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 
            className="text-3xl md:text-4xl font-bold text-white"
            style={{
              animation: 'slideUp 0.6s ease-out forwards',
              animationDelay: '0.2s',
              opacity: 0
            }}
          >
            Selfless CE
          </h1>
          <p 
            className="text-lg md:text-xl text-[#A79C8C]"
            style={{
              animation: 'slideUp 0.6s ease-out forwards',
              animationDelay: '0.4s',
              opacity: 0
            }}
          >
            Student Self Service Portal
          </p>
          <p 
            className="text-sm md:text-base text-[#E8A33D] italic tracking-wide"
            style={{
              animation: 'slideUp 0.6s ease-out forwards',
              animationDelay: '0.5s',
              opacity: 0
            }}
          >
            Nurturing Resilient Minds
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div 
          className="w-64 mx-auto space-y-2"
          style={{
            animation: 'slideUp 0.6s ease-out forwards',
            animationDelay: '0.6s',
            opacity: 0
          }}
        >
          <div className="h-1 bg-[#2A2438] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E8A33D] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#6B6358] text-center">
            {loadingMessages[currentMessage]} {Math.round(progress)}%
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
