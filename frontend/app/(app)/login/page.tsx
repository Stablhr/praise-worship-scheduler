'use client';

import {useEffect, useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {Eye, EyeOff} from 'lucide-react';
import {BrandLogo} from '@/components/app/BrandLogo';
import {FormField} from '@/components/app/FormField';
import {PillButton} from '@/components/app/PillButton';
import {SelectField} from '@/components/app/SelectField';
import {WaveFooter} from '@/components/app/WaveFooter';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useMemberAuth} from '@/lib/hooks/auth/useMemberAuth';
import {MEMBER_POSITIONS} from '@/lib/members/positions';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
  validatePosition
} from '@/lib/validation/memberAccount';

/** `sign-in` is the everyday path; `sign-up` creates an account. */
type Mode = 'sign-in' | 'sign-up';

type FieldName = 'name' | 'email' | 'password' | 'confirmation' | 'position';
type FieldErrors = Partial<Record<FieldName, string>>;

const COPY: Record<
  Mode,
  {
    heading: string;
    description: string;
    submit: string;
    loading: string;
    switchPrompt: string;
    switchAction: string;
    footnote: string;
  }
> = {
  'sign-in': {
    heading: 'Welcome back!',
    description: 'Sign in to see who is serving and what songs are planned.',
    submit: 'Sign in',
    loading: 'Signing in…',
    switchPrompt: 'New here?',
    switchAction: 'Create an account',
    footnote: 'Anyone in the ministry can create an account.'
  },
  'sign-up': {
    heading: 'Create your account',
    description:
      'Choose the position you serve in. The Chairman or Pastor can change it later.',
    submit: 'Create my account',
    loading: 'Creating…',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
    footnote: 'Use the email you will keep for the ministry.'
  }
};

/** Login and sign-up screen (DESIGN.md section 6.2, email and password). */
export default function LoginPage() {
  const router = useRouter();
  const {isSuccess} = useMeQuery();
  const {signIn, signUp, isSubmitting, error, resetError} = useMemberAuth();

  const [mode, setMode] = useState<Mode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [position, setPosition] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const copy = COPY[mode];

  useEffect(() => {
    if (isSuccess) router.replace('/home');
  }, [isSuccess, router]);

  const errorMessage = error
    ? getFriendlyErrorMessage(
        error,
        mode === 'sign-in'
          ? 'We could not sign you in. Please check your email and password and try again.'
          : 'We could not create your account. Please try again.'
      )
    : null;

  function switchMode() {
    setMode(current => (current === 'sign-in' ? 'sign-up' : 'sign-in'));
    setFieldErrors({});
    setConfirmation('');
    resetError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;

    if (mode === 'sign-up') {
      const nameError = validateName(name);
      const positionError = validatePosition(position);
      const confirmationError = validatePasswordConfirmation(
        password,
        confirmation
      );

      if (nameError) nextErrors.name = nameError;
      if (positionError) nextErrors.position = positionError;
      if (confirmationError) nextErrors.confirmation = confirmationError;
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (mode === 'sign-in') {
      await signIn({email: email.trim(), password});
      return;
    }

    await signUp({
      name: name.trim(),
      email: email.trim(),
      password,
      position
    });
  }

  const togglePassword = (
    <button
      type="button"
      onClick={() => setShowPassword(current => !current)}
      className="flex items-center gap-1 text-xs font-medium text-primary"
      aria-pressed={showPassword}
    >
      {showPassword ? (
        <EyeOff aria-hidden="true" className="size-4" />
      ) : (
        <Eye aria-hidden="true" className="size-4" />
      )}
      {showPassword ? 'Hide' : 'Show'}
    </button>
  );

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-surface px-6 pt-[env(safe-area-inset-top)]">
      <WaveFooter />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-8">
        <BrandLogo size={80} />
        <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-primary">
          UCJM
        </h1>
        <p className="mt-1 text-sm font-medium text-muted">
          Praise &amp; Worship Ministry
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[480px] pb-[calc(88px+env(safe-area-inset-bottom))]">
        <h2 className="font-heading text-xl font-semibold leading-7 text-text">
          {copy.heading}
        </h2>
        <p className="mt-1 text-sm leading-5 text-muted">{copy.description}</p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-5 text-danger"
          >
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {mode === 'sign-up' && (
            <FormField
              id="name"
              label="Your name"
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={event => setName(event.target.value)}
              error={fieldErrors.name}
            />
          )}

          <FormField
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="you@example.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
            error={fieldErrors.email}
          />

          <FormField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            value={password}
            onChange={event => setPassword(event.target.value)}
            error={fieldErrors.password}
            labelAction={togglePassword}
            hint={
              mode === 'sign-up'
                ? 'At least 8 characters, with a capital letter, a small letter, a number and a symbol.'
                : undefined
            }
          />

          {mode === 'sign-up' && (
            <>
              <FormField
                id="confirmation"
                label="Repeat password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmation}
                onChange={event => setConfirmation(event.target.value)}
                error={fieldErrors.confirmation}
              />

              <SelectField
                id="position"
                label="Your position"
                value={position}
                onChange={event => setPosition(event.target.value)}
                error={fieldErrors.position}
              >
                <option value="">Choose your position…</option>
                {MEMBER_POSITIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </>
          )}

          <PillButton
            type="submit"
            isLoading={isSubmitting}
            loadingLabel={copy.loading}
          >
            {copy.submit}
          </PillButton>
        </form>

        <p className="mt-4 text-center text-sm leading-5 text-muted">
          {copy.switchPrompt}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.switchAction}
          </button>
        </p>

        <p className="mt-3 text-center text-xs leading-4 text-muted">
          {copy.footnote}
        </p>
      </div>
    </div>
  );
}
