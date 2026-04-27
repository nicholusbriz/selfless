'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/atbriz.jpg"
            alt="Background"
            fill
            className="object-cover"
            style={{
              filter: 'brightness(0.3) contrast(1.1) saturate(0.8) blur(0.8px)',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            priority
          />

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          {/* Floating animated elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
          <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl animate-float animation-delay-3000"></div>

          <div className="w-full max-w-5xl relative z-10">
            <div className="p-6">
              <div className="text-center mb-6">
                {/* Enhanced Logo */}
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 rounded-full mb-4 shadow-2xl shadow-cyan-500/50 p-2" style={{ boxShadow: '0 0 40px rgba(6, 182, 212, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)' }}>
                  <Image
                    src="/freedom.png"
                    alt="Freedom City Tech Center Logo"
                    width={128}
                    height={128}
                    className="w-full h-full object-contain"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))' }}
                  />
                </div>

                {/* Enhanced Title */}
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-white to-purple-300 bg-clip-text text-transparent mb-4" style={{
                  textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)',
                  letterSpacing: '0.02em'
                }}>
                  FREEDOM CITY TECH CENTER
                </h1>

                {/* Enhanced Subtitle */}
                <p className="text-lg md:text-xl font-light text-cyan-200 mb-4 uppercase tracking-widest" style={{
                  textShadow: '0 0 20px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)',
                  letterSpacing: '0.15em'
                }}>
                  Tech Center Tracking System
                </p>

                {/* Tagline */}
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 backdrop-blur-md px-6 py-3 rounded-full border border-cyan-400/40" style={{
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                }}>
                  <span className="text-cyan-100 font-bold text-base tracking-wide" style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.8)' }}>✨ Nurturing Resilient Minds</span>
                </div>
              </div>

              {/* Enhanced Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/register')}
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 uppercase tracking-wider"
                  style={{
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <span className="flex items-center justify-center text-xl">
                    <span className="mr-3 text-2xl">🚀</span>
                    <span>Create Account</span>
                  </span>
                  <div className="text-cyan-100 text-sm mt-2 font-light">Start Your Journey With Us</div>
                </button>

                <div className="text-center">
                  <span className="text-cyan-200 text-lg bg-cyan-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-cyan-400/40 uppercase tracking-wider" style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.8)' }}>
                    OR
                  </span>
                </div>

                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 uppercase tracking-wider"
                  style={{
                    boxShadow: '0 0 30px rgba(147, 51, 234, 0.4), 0 0 60px rgba(99, 102, 241, 0.2)',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <span className="flex items-center justify-center text-xl">
                    <span className="mr-3 text-2xl">🔐</span>
                    <span>Sign In</span>
                  </span>
                  <div className="text-purple-100 text-sm mt-2 font-light">Access Your Dashboard</div>
                </button>
              </div>

              {/* Enhanced Footer */}
              <div className="text-center mt-6">
                <div className="flex items-center justify-center space-x-8 text-white/60">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm">Secure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-sm">Fast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm">Professional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PWAInstallPrompt />
    </>
  );
}
