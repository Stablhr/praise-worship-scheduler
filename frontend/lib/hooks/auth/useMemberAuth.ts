import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {memberLogin, memberRegister, type MeResponse} from '@/lib/api/authApi';
import {meQueryKey} from './useMeQuery';

export type SignInInput = {email: string; password: string};
export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  position: string;
};

/**
 * Team member sign-in and sign-up with email and password.
 *
 * Anyone in the ministry can `signUp`, and an admin can also add someone in
 * advance so they can sign up and claim the email. Both save the member into
 * the React Query cache and send them home.
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
    signUp: (input: SignUpInput) => run(() => memberRegister(input))
  };
}
