'use client';

import { useRouter } from 'next/navigation';
import RippleButton from '@/components/RippleButton';

export default function ClearCachePage() {
  const router = useRouter();

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('Local storage cleared! You can now go back to the home page.');
    router.push('/');
  };

  const checkLocalStorage = () => {
    const user = localStorage.getItem('user');
    alert(`User data in localStorage: ${user ? 'YES' : 'NO'}\n\nData: ${user || 'None'}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">🔧 Debug Tools</h1>
        
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-cyan-300 font-semibold mb-2">Local Storage Status</h3>
            <p className="text-gray-300 text-sm mb-4">
              Check if there's any cached user data that might be causing authentication issues.
            </p>
            <RippleButton
              onClick={checkLocalStorage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🔍 Check Local Storage
            </RippleButton>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="text-orange-300 font-semibold mb-2">Clear Cache</h3>
            <p className="text-gray-300 text-sm mb-4">
              Clear all local storage data to fix authentication issues.
            </p>
            <RippleButton
              onClick={clearLocalStorage}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🗑️ Clear Local Storage
            </RippleButton>
          </div>

          <div className="pt-4 border-t border-white/10">
            <RippleButton
              onClick={() => router.push('/')}
              className="w-full text-cyan-300 hover:text-white font-medium py-2 transition-colors"
            >
              ← Back to Home
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
