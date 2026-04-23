'use client';

import { useRouter } from 'next/navigation';
import RippleButton from '@/components/RippleButton';

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full mb-4 shadow-lg shadow-purple-500/50">
              <span className="text-4xl text-white font-bold">SF</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent mb-3">
              Selfless CE Freedom City
            </h1>
            <p className="text-cyan-300 text-xl mb-6 font-medium">
              Tech Center Cleaning Registration
            </p>
            <p className="text-gray-300 text-sm italic mb-8">
              &quot;Nurturing Resilient Minds&quot; 💻🚀
            </p>
          </div>

          <div className="space-y-4">
            <RippleButton
              onClick={() => router.push('/register')}
              className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105"
            >
              📝 Create Account
            </RippleButton>

            <div className="text-center">
              <span className="text-gray-400 text-sm">or</span>
            </div>

            <RippleButton
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105"
            >
              🔐 Login to System
            </RippleButton>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-cyan-300 font-semibold mb-2">Welcome to Selfless CE!</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Join our community of volunteers at the Freedom City Tech Center.
                Help us maintain a clean and inspiring learning environment.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            Need help? Contact our admin team
          </p>
        </div>
      </div>
    </div>
  );
}
