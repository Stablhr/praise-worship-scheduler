'use client';

import {useEffect} from 'react';
import type {ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {AppShellSkeleton} from '@/components/app/AppShellSkeleton';
import {ErrorState} from '@/components/app/ErrorState';

/**
 * Protected route wrapper.
 * - still checking: skeleton
 * - signed out (401): go to the login screen
 * - network or server problem: short message and a retry button
 */
export function RequireAuth({children}: {children: ReactNode}) {
  const router = useRouter();
  const {data, isLoading, isFetching, isError, error, refetch} = useMeQuery();

  const status =
    (error as {status?: number | null} | null | undefined)?.status ?? null;
  const isSignedOut = isError && typeof status === 'number';
  const hasServerProblem = isError && status === null;

  useEffect(() => {
    if (isSignedOut) router.replace('/login');
  }, [isSignedOut, router]);

  if (isLoading || isFetching || isSignedOut) return <AppShellSkeleton />;

  if (hasServerProblem || !data) {
    return (
      <div className="mx-auto w-full max-w-[480px] px-4 py-6">
        <ErrorState
          message={getFriendlyErrorMessage(
            error,
            'We could not reach the server. Please try again.'
          )}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
