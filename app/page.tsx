'use client';

import { useRouter } from 'next/navigation';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function Page() {
  const router = useRouter();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-600/20 via-transparent to-purple-700/20"></div>

        {/* Floating animated elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-pink-400/20 rounded-full blur-3xl animate-float animation-delay-3000"></div>

        <div className="w-full max-w-4xl relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border-2 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <div className="text-center mb-12">
              {/* Enhanced Logo */}
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full mb-8 shadow-2xl shadow-purple-500/40 p-3 animate-bounce-in">
                <img
                  src="/freedom.png"
                  alt="Freedom City Tech Center Logo"
                  className="w-full h-full object-contain animate-glow"
                />
              </div>

              {/* Enhanced Title */}
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 animate-slide-in-right drop-shadow-2xl">
                Freedom City Tech Center
              </h1>

              {/* Enhanced Subtitle */}
              <p className="text-2xl md:text-3xl font-medium text-white/90 mb-4 animate-slide-in-left drop-shadow-lg">
                Tech Centre Tracking System
              </p>

              {/* Tagline */}
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
                <span className="text-white font-semibold text-lg">🌟️ Naturing Resilient minds</span>
              </div>
            </div>

            {/* Enhanced Buttons */}
            <div className="space-y-6 animate-fade-in-up">
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white font-bold py-6 px-8 rounded-2xl hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/40"
              >
                <span className="flex items-center justify-center text-xl">
                  <span className="mr-3 text-2xl">🚀</span>
                  <span>Create Account</span>
                </span>
                <div className="text-emerald-100 text-sm mt-2">Start your journey with us</div>
              </button>

              <div className="text-center animate-fade-in animation-delay-200">
                <span className="text-white/70 text-lg bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  OR
                </span>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold py-6 px-8 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/40"
              >
                <span className="flex items-center justify-center text-xl">
                  <span className="mr-3 text-2xl">🔐</span>
                  <span>Sign In</span>
                </span>
                <div className="text-blue-100 text-sm mt-2">Access your dashboard</div>
              </button>
            </div>

            {/* Enhanced Footer */}
            <div className="text-center mt-12 animate-fade-in-up animation-delay-400">
              <div className="flex items-center justify-center space-x-8 text-white/60">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
                  <span className="text-sm">Fast</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-400"></div>
                  <span className="text-sm">Professional</span>
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
