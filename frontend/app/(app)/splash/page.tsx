'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {SplashScreen} from '@/components/app/SplashScreen';
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

  return <SplashScreen />;
}
