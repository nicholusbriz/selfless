'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstall(false);
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    setDeferredPrompt(null);
  };

  if (!showInstall && !showSuccess) return null;

  // Success message when app is installed
  if (showSuccess) {
    return (
      <div className="fixed top-6 left-6 z-50 animate-fade-in-up">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-5 shadow-2xl border border-white/30 backdrop-blur-lg max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Successfully Installed!</p>
                <p className="text-green-100 text-xs">App is now on your device</p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Install prompt
  return (
    <div className="fixed top-6 left-6 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-5 shadow-2xl border border-white/30 backdrop-blur-lg max-w-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <img
                src="/freedom.png"
                alt="App Icon"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm mb-1">Install App</p>
              <p className="text-purple-100 text-xs leading-relaxed">
                Add Freedom City Tech Center to your home screen for quick access
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-purple-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all duration-300"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
