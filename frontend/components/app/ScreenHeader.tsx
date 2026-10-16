import type {ReactNode} from 'react';
import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';

type ScreenHeaderProps = {
  title: string;
  /** Shows a back arrow on inner screens. */
  backHref?: string;
  /** Contextual action on the right, for example the yellow "+" button. */
  action?: ReactNode;
};

/** Plain top bar for every screen except Home (DESIGN.md section 5). */
export function ScreenHeader({title, backHref, action}: ScreenHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-[480px] items-center gap-1 px-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Go back"
            className="flex size-11 items-center justify-center rounded-full text-text transition-colors duration-150 ease-out active:bg-accent-soft"
          >
            <ChevronLeft className="size-6" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        ) : (
          <span className="w-2" aria-hidden="true" />
        )}

        <h1 className="flex-1 truncate px-1 font-heading text-xl font-semibold leading-7 text-text">
          {title}
        </h1>

        {action}
      </div>
    </header>
  );
}
