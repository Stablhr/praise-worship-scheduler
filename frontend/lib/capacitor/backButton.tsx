'use client';

import {useEffect} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {App} from '@capacitor/app';

/**
 * Handles the Android hardware back button. On the home screen it exits the app;
 * on inner screens it navigates back. No-op on web.
 */
export function useAndroidBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let listener: {remove: () => void} | null = null;

    async function setup() {
      try {
        listener = await App.addListener('backButton', ({canGoBack}) => {
          if (pathname === '/home' || pathname === '/splash' || pathname === '/login') {
            App.exitApp();
          } else if (canGoBack) {
            router.back();
          } else {
            router.push('/home');
          }
        });
      } catch {
        // Not running in Capacitor (web) — no-op.
      }
    }

    void setup();

    return () => {
      listener?.remove();
    };
  }, [router, pathname]);
}