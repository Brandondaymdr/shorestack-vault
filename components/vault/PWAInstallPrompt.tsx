'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) return;
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(ios);
    if (ios) {
      setShowPrompt(true);
      return;
    }

    // Listen for beforeinstallprompt (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
  }

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="mx-4 mb-4 flex items-center gap-3 rounded-sm border border-[#1b4965]/10 bg-white px-4 py-3">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b4965" strokeWidth="2" className="flex-shrink-0">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#1b4965]">Install Vault for quick access</p>
        {isIOS && (
          <p className="text-[10px] text-[#1b4965]/50">
            Tap Share then &quot;Add to Home Screen&quot;
          </p>
        )}
      </div>
      {!isIOS && (
        <button
          onClick={handleInstall}
          className="rounded-sm bg-[#5fa8a0] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4d8f87]"
        >
          Install
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="rounded-sm p-1 text-[#1b4965]/30 hover:text-[#1b4965]/60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
