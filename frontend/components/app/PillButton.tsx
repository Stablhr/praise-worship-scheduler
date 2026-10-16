'use client';

import type {ComponentProps} from 'react';
import {Loader2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

type PillButtonProps = {
  /** `primary` is the filled blue button, `outline` is the white button with a blue border. */
  variant?: 'primary' | 'outline';
  /** DESIGN.md section 4: form buttons are full width. */
  fullWidth?: boolean;
  /** Shows a spinner and blocks taps while work is in flight. */
  isLoading?: boolean;
  /** Label read out while loading, so the button explains itself. */
  loadingLabel?: string;
} & Omit<ComponentProps<typeof Button>, 'variant' | 'size'>;

/**
 * The pill button from DESIGN.md section 4 (height 48, radius 24).
 * Built on the shadcn Button so focus, disabled and SVG handling stay the same.
 */
export function PillButton({
  variant = 'primary',
  fullWidth = true,
  isLoading = false,
  loadingLabel,
  className,
  children,
  disabled,
  ...props
}: PillButtonProps) {
  return (
    <Button
      className={cn(
        'h-12 gap-2 rounded-pill px-6 font-heading text-base md:text-base font-semibold',
        fullWidth && 'w-full',
        variant === 'primary' &&
          'bg-primary text-primary-foreground hover:bg-primary-dark',
        variant === 'outline' &&
          'border-primary/25 bg-surface text-primary hover:bg-secondary',
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Loader2 aria-hidden="true" className="size-5 animate-spin" />}
      {isLoading ? (loadingLabel ?? children) : children}
    </Button>
  );
}
