import {BrandLogo} from './BrandLogo';
import {WaveFooter} from './WaveFooter';

/**
 * The splash look from DESIGN.md section 6.1: logo, name, ministry line, tagline
 * and the blue and yellow wave.
 *
 * Shared by the splash screen and the root loading state, so the first paint of
 * the app and the splash screen are the same thing.
 */
export function SplashScreen() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-surface px-6">
      <div className="relative z-10 flex -translate-y-10 flex-col items-center">
        <BrandLogo size={112} />
        <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-primary">
          UCJM
        </h1>
        <p className="mt-1 text-center text-base text-text">
          Unity in Christ Jesus Ministries
        </p>
        <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-muted">
          One Heart · One Voice · His Glory
        </p>
      </div>
      <WaveFooter />
    </div>
  );
}
