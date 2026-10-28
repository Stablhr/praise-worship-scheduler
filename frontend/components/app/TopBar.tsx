'use client';

import Link from 'next/link';
import {Bell} from 'lucide-react';
import {BrandLogo} from './BrandLogo';
import {useUnreadCountQuery} from '@/lib/hooks/notifications/useNotificationsQuery';

type TopBarProps = {
  /** Wired up in Phase 6 (Notifications). */
  unreadCount?: number;
};

/**
 * Blue top bar used on Home (DESIGN.md section 5).
 * The bell opens /notifications. The profile photo is now in the bottom tab bar.
 */
export function TopBar({unreadCount: propUnreadCount = 0}: TopBarProps) {
  const {data: fetchedCount} = useUnreadCountQuery();
  const unreadCount = fetchedCount ?? propUnreadCount;

  return (
    <header className="sticky top-0 z-30 bg-primary pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-2 pl-2">
          <BrandLogo size={28} className="rounded-full bg-surface" />
          <span className="truncate font-heading text-base font-semibold text-primary-foreground">
            Praise &amp; Worship Ministry
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative flex size-11 items-center justify-center rounded-full text-primary-foreground transition-colors duration-150 ease-out active:bg-primary-dark"
          >
            <Bell className="size-6" strokeWidth={1.75} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2.5 size-2 rounded-full bg-accent" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}