import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {memberLogin, memberRegister, type MeResponse} from '@/lib/api/authApi';
import {meQueryKey} from './useMeQuery';

export type SignInInput = {email: string; password: string};
export type SetUpAccountInput = {name: string; email: string; password: string};

/**
 * Team member sign-in with email and password.
 *
 * `signIn` is the everyday path. `setUpAccount` is the one-time path for a
 * member an admin just added, where they pick their own name and password.
 * Both save the member into the React Query cache and send them home.
 */
export function useMemberAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function run(action: () => Promise<MeResponse>) {
    setIsSubmitting(true);
    setError(null);

    try {
      const {user} = await action();
      queryClient.setQueryData(meQueryKey, {user});
      router.replace('/home');
    } catch (caught) {
      setError(caught);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    error,
    isSubmitting,
    resetError: () => setError(null),
    signIn: (input: SignInInput) => run(() => memberLogin(input)),
    setUpAccount: (input: SetUpAccountInput) => run(() => memberRegister(input))
  };
}
