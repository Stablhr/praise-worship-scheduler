'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {BrandLogo} from '@/components/app/BrandLogo';
import {WaveFooter} from '@/components/app/WaveFooter';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';

const SPLASH_DURATION_MS = 1200;

/** Splash screen (DESIGN.md section 6.1). Stays for about 1.2 seconds, then opens Home or Login. */
export default function SplashPage() {
  const router = useRouter();
  const {isLoading, isSuccess} = useMeQuery();
  const [hasWaitedEnough, setHasWaitedEnough] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasWaitedEnough(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasWaitedEnough || isLoading) return;
    router.replace(isSuccess ? '/home' : '/login');
  }, [hasWaitedEnough, isLoading, isSuccess, router]);

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
