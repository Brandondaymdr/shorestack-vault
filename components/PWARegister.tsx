'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err);
        });
    }

    // Request persistent storage for IndexedDB
    if (navigator.storage?.persist) {
      navigator.storage.persist().then((granted) => {
        if (granted) {
          console.log('[PWA] Persistent storage granted');
        }
      });
    }
  }, []);

  return null;
}
