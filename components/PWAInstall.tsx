'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X, Apple } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const lastShownRef = useRef<number>(0);

  const isHomePage = pathname === '/';

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
              (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isInstalled) return;

    let removeControllerListener = () => {};

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      const hadController = Boolean(navigator.serviceWorker.controller);

      const handleControllerChange = () => {
        if (hadController) {
          window.location.reload();
        }
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      removeControllerListener = () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };

      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration);
          // Check the deployment version immediately instead of waiting for the browser interval.
          registration.update();
        })
        .catch((error) => {
          console.log('[SW] Service Worker registration failed:', error);
        });
    }

    // Check if we showed it in last 2 minutes
    const now = Date.now();
    if (lastShownRef.current && (now - lastShownRef.current) < 2 * 60 * 1000) {
      return removeControllerListener;
    }

    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(installEvent);
      if (isHomePage) {
        setShowInstall(true);
        lastShownRef.current = Date.now();
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (iOS && isHomePage) {
      const timer = setTimeout(() => {
        setShowIOSGuide(true);
        lastShownRef.current = Date.now();
      }, 2000);
      return () => {
        clearTimeout(timer);
        removeControllerListener();
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      removeControllerListener();
    };
  }, [isHomePage]);

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
          initial={{ y: 24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          role="dialog"
          aria-label="Install Selfless"
          className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-5 sm:w-[min(22rem,calc(100vw-2.5rem))]"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-18px_rgba(15,23,42,0.45)]">
            <div className="flex items-start gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A365D] text-white shadow-sm">
                {isIOS ? <Apple className="h-5 w-5" /> : <Download className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">Install Selfless</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Keep your learning portal one tap away.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss install prompt"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 py-3.5">
            {!isIOS ? (
              <>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A365D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153475] focus:outline-none focus:ring-2 focus:ring-[#3182CE]/40 focus:ring-offset-2"
                >
                  <Download className="h-4 w-4" />
                  Install App
                </button>
              </>
            ) : (
              <>
                <p className="text-xs leading-5 text-slate-600">
                  Tap <span className="font-semibold text-slate-900">Share</span>, then choose <span className="font-semibold text-slate-900">Add to Home Screen</span>.
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <Apple className="h-3.5 w-3.5" />
                  <span>Available in Safari on iPhone and iPad</span>
                </div>
              </>
            )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}