'use client';

import {RefreshCw} from 'lucide-react';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

/** A short message plus a retry button (DESIGN.md section 8). */
export function ErrorState({message, onRetry}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface px-6 py-10 text-center shadow-card">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger/10 font-heading text-lg font-semibold text-danger">
        !
      </span>
      <p className="max-w-[30ch] text-sm text-text">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-pill border border-primary px-5 text-sm font-semibold text-primary transition-colors duration-150 ease-out active:bg-accent-soft"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
