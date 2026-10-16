'use client';

import type {ComponentProps, ReactNode} from 'react';
import {ChevronDown} from 'lucide-react';
import {Label} from '@/components/ui/label';
import {cn} from '@/lib/utils';

type SelectFieldProps = {
  id: string;
  label: string;
  /** Shown under the field in red and linked to it for screen readers. */
  error?: string | null;
  /** Small helper text shown when there is no error. */
  hint?: ReactNode;
} & Omit<ComponentProps<'select'>, 'id'>;

/**
 * A labelled select, styled to match FormField (DESIGN.md section 4).
 *
 * This is a native `select` on purpose: on a phone it opens the operating
 * system picker, which is friendlier and more accessible than a custom popup,
 * and it costs the app nothing.
 */
export function SelectField({
  id,
  label,
  error,
  hint,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="w-full">
      <Label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </Label>

      <div className="relative mt-2">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={cn(
            'h-12 w-full appearance-none rounded-card border border-border bg-surface pl-4 pr-11 text-base text-text md:text-base focus-visible:border-primary focus-visible:outline-none',
            error && 'border-danger',
            className
          )}
          {...props}
        >
          {children}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted"
        />
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs leading-4 text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-4 text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
