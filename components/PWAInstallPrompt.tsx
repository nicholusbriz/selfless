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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);
  }, []);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = 'standalone' in window.navigator && !!(window.navigator as { standalone?: boolean }).standalone;

    // Show install prompt for iOS users after a delay
    if (isIOSDevice && !isStandalone) {
      const timer = setTimeout(() => {
        // Check if user hasn't dismissed before
        const hasDismissed = localStorage.getItem('pwa-ios-dismissed');
        if (!hasDismissed) {
          setShowInstall(true);
        }
      }, 3000); // Show after 3 seconds
      return () => clearTimeout(timer);
    }
  }, []);

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
    // Remember iOS dismissal
    if (isIOS) {
      localStorage.setItem('pwa-ios-dismissed', 'true');
    }
  };

  if (!showInstall && !showSuccess) return null;

  // Success message when app is installed
  if (showSuccess) {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-4 shadow-2xl border border-white/30 backdrop-blur-lg max-w-md">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">Successfully Installed!</p>
              <p className="text-green-100 text-sm">Freedom City Tech Center is now on your desktop</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Install prompt
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 shadow-2xl border border-white/30 backdrop-blur-lg max-w-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Install Freedom City Tech Center</p>
              <p className="text-blue-100 text-xs">
                {isIOS ? "Tap Share then 'Add to Home Screen'" : "Add to your home screen for quick access"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Install App
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              title="Dismiss"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>
        </div>
        {isIOS && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-blue-100 text-xs">
              <span>👆</span>
              <span>Tap the Share button in Safari, then &quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
