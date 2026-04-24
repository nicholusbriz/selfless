'use client';

import { useRouter } from 'next/navigation';
import RippleButton from '@/components/RippleButton';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative">

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="glass-card rounded-3xl p-8 border border-white/20 shadow-glow-lg hover-lift">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50 p-2 animate-bounce-in">
              <img
                src="/freedom.png"
                alt="Freedom City Tech Center Logo"
                className="w-full h-full object-contain animate-glow"
              />
            </div>
            <h1 className="text-5xl font-bold text-gradient-primary mb-3 animate-slide-in-right text-shadow-lg">
              Freedom City Tech Center
            </h1>
            <p className="text-cyan-300 text-xl mb-8 font-medium animate-slide-in-left">
              Cleaning Registration System
            </p>
          </div>

          <div className="space-y-4 animate-fade-in-up">
            <RippleButton
              onClick={() => router.push('/register')}
              className="btn-primary w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">📝</span>
                Create Account
              </span>
            </RippleButton>

            <div className="text-center animate-fade-in">
              <span className="text-gray-400 text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">or</span>
            </div>

            <RippleButton
              onClick={() => router.push('/login')}
              className="btn-secondary w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">🔐</span>
                Login to System
              </span>
            </RippleButton>
          </div>

          <div className="mt-8 text-center animate-fade-in-up animation-delay-300">
            <div className="glass-morphism rounded-lg p-6 border border-white/10 hover-lift">
              <h3 className="text-cyan-300 font-semibold mb-3 text-gradient-primary">Welcome to Selfless CE!</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Join our community of volunteers at the Freedom City Tech Center.
                Help us maintain a clean and inspiring learning environment.
              </p>
              <div className="flex items-center justify-center space-x-2 text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Be part of something amazing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Need help? Contact our admin team
          </p>
        </div>
      </div>
      <PWAInstallPrompt />
    </div >
  );
}
