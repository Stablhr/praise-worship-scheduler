'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {GoogleSignInButton} from '@/components/auth/GoogleSignInButton';
import {BrandLogo} from '@/components/app/BrandLogo';
import {WaveFooter} from '@/components/app/WaveFooter';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {useGoogleSignIn} from '@/lib/hooks/auth/useGoogleSignIn';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';

/** Login screen (DESIGN.md section 6.2). Google is the only way in. */
export default function LoginPage() {
  const router = useRouter();
  const {isSuccess} = useMeQuery();
  const {signIn, isSigningIn, error} = useGoogleSignIn();

  useEffect(() => {
    if (isSuccess) router.replace('/home');
  }, [isSuccess, router]);

  const errorMessage = error
    ? getFriendlyErrorMessage(error, 'We could not sign you in. Please try again.')
    : null;

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-surface px-6 pt-[env(safe-area-inset-top)]">
      <WaveFooter />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <BrandLogo size={96} />
        <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-primary">
          UCJM
        </h1>
        <p className="mt-1 text-sm font-medium text-muted">
          Praise &amp; Worship Ministry
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[480px] pb-[calc(88px+env(safe-area-inset-bottom))]">
        <h2 className="font-heading text-xl font-semibold leading-7 text-text">
          Welcome back!
        </h2>
        <p className="mt-1 text-sm leading-5 text-muted">
          Sign in to see who is serving and what songs are planned.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-5 text-danger"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-5">
          <GoogleSignInButton onClick={signIn} isLoading={isSigningIn} />
        </div>

        <p className="mt-3 text-center text-xs leading-4 text-muted">
          Only members added by the Chairman or Pastor can sign in.
        </p>
      </div>
    </div>
  );
}
