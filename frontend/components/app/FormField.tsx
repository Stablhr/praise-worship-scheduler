'use client';

import type {ComponentProps, ReactNode} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {cn} from '@/lib/utils';

type FormFieldProps = {
  id: string;
  label: string;
  /** Shown under the field in red and linked to it for screen readers. */
  error?: string | null;
  /** Small helper text shown when there is no error. */
  hint?: ReactNode;
  /** Anything shown at the right of the label, such as "Show" on a password. */
  labelAction?: ReactNode;
} & Omit<ComponentProps<'input'>, 'id'>;

/**
 * A labelled input from DESIGN.md section 4: 48 high, rounded, 16 side padding.
 * Wraps the shadcn Input and Label instead of building new form controls.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  labelAction,
  className,
  ...props
}: FormFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </Label>
        {labelAction}
      </div>

      <Input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={cn(
          // `md:text-base` too: the shadcn Input ships `md:text-xs`, and tailwind-merge
          // treats responsive variants as separate classes, so both must be overridden.
          'mt-2 h-12 rounded-card border-border bg-surface px-4 text-base md:text-base text-text placeholder:text-muted focus-visible:border-primary',
          error && 'border-danger',
          className
        )}
        {...props}
      />

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
