import {SplashScreen} from '@/components/app/SplashScreen';

/**
 * Shown while a screen is still coming in. It is the splash look on purpose:
 * opening `/` redirects to `/splash`, so the first paint and the splash screen
 * are the same picture instead of a flash of empty text.
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <SplashScreen />
    </div>
  );
}
