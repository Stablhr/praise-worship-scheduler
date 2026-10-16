'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {signInWithGoogle} from '@/lib/api/authApi';
import {
  GOOGLE_ERROR,
  requestGoogleAuthCode
} from '@/lib/google/googleIdentity';
import {meQueryKey} from '@/lib/hooks/auth/useMeQuery';

type UseGoogleSignInResult = {
  signIn: () => Promise<void>;
  isSigningIn: boolean;
  /** The last failure, ready for getFriendlyErrorMessage(). */
  error: unknown;
  clearError: () => void;
};

/** The one way a member signs in: Google, then the backend checks the team list. */
export function useGoogleSignIn(): UseGoogleSignInResult {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const signIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    setError(null);

    try {
      const code = await requestGoogleAuthCode();
      const {user} = await signInWithGoogle({code});

      queryClient.setQueryData(meQueryKey, {user});
      router.replace('/home');
    } catch (caught) {
      // Closing the Google popup is not a failure worth showing a banner for.
      if (caught instanceof Error && caught.message === GOOGLE_ERROR.popupClosed) {
        return;
      }
      setError(caught);
    } finally {
      setIsSigningIn(false);
    }
  };

  return {signIn, isSigningIn, error, clearError: () => setError(null)};
}
