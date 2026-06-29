'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstall() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [lastShown, setLastShown] = useState<number>(0);

  const isHomePage = pathname === '/';

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    // Force redirect to home page on PWA initial launch only (use sessionStorage to prevent loops)
    if (isInstalled && pathname !== '/') {
      const hasRedirected = sessionStorage.getItem('pwa_redirected_to_home');
      
      if (!hasRedirected) {
        console.log('[PWA] Initial launch detected, redirecting to home');
        sessionStorage.setItem('pwa_redirected_to_home', 'true');
        window.location.href = '/';
      }
    }

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration);
          // Force update the service worker
          registration.update();
        })
        .catch((error) => {
          console.log('[SW] Service Worker registration failed:', error);
        });
    }

    // Check if we showed it in last 5 minutes
    const now = Date.now();
    if (lastShown && (now - lastShown) < 5 * 60 * 1000) return;

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (isHomePage) {
        setShowInstall(true);
        setLastShown(Date.now());
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (iOS && isHomePage) {
      const timer = setTimeout(() => {
        setShowIOSGuide(true);
        setLastShown(Date.now());
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (!iOS && isHomePage && deferredPrompt) {
      setShowInstall(true);
      setLastShown(Date.now());
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isHomePage, lastShown, deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install`);
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
    setShowIOSGuide(false);
    // Will show again after 5 minutes
  };

  if (!isHomePage) return null;

  return (
    <AnimatePresence>
      {(showInstall || showIOSGuide) && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-2 sm:top-20 sm:left-4 z-50"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-2xl px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-4 border border-white/20">
            {!/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
              <>
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 text-white text-sm font-medium hover:opacity-90"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
                <button onClick={handleDismiss} className="text-white/60 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-white text-xs">
                  <Apple className="w-4 h-4" />
                  <span>Share → Add to Home Screen</span>
                </div>
                <button onClick={handleDismiss} className="text-white/60 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}