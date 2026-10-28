'use client';

import {useEffect} from 'react';
import {useAndroidBackButton} from '@/lib/capacitor/backButton';

/**
 * Wraps the app to handle Capacitor-specific behavior:
 * - Android back button
 * - Status bar styling
 * - Splash screen auto-hide
 *
 * No-op when running in a browser.
 */
export function CapacitorProvider({children}: {children: React.ReactNode}) {
  useAndroidBackButton();

  useEffect(() => {
    async function setup() {
      try {
        const {StatusBar} = await import('@capacitor/status-bar');
        await StatusBar.setStyle({style: 'DARK' as never});
        await StatusBar.setBackgroundColor({color: '#0b3d91'});
      } catch {
        // Not running in Capacitor (web) — no-op.
      }

      try {
        const {SplashScreen} = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch {
        // Not running in Capacitor (web) — no-op.
      }
    }

    void setup();
  }, []);

  return <>{children}</>;
}