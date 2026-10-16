'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {APP_TABS, isTabActive} from '@/lib/navigation/tabs';
import {cn} from '@/lib/utils';

type BottomNavProps = {
  /** Wired up in Phase 6: shows a dot on More when there are unread notifications. */
  unreadCount?: number;
};

/** Fixed bottom tab bar, Netflix-style pattern (DESIGN.md section 5). */
export function BottomNav({unreadCount = 0}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 w-full max-w-[480px] items-stretch">
        {APP_TABS.map(tab => {
          const isActive = isTabActive(pathname, tab.href);
          const Icon = tab.icon;
          const showDot = tab.href === '/more' && unreadCount > 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                // Tapping the active tab scrolls that screen to the top
                if (isActive) window.scrollTo({top: 0, behavior: 'smooth'});
              }}
              className={cn(
                'relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-[14px] transition-colors duration-150 ease-out',
                isActive ? 'font-semibold text-primary' : 'font-medium text-muted'
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-0 h-[3px] w-6 rounded-b-full',
                  isActive ? 'bg-accent' : 'bg-transparent'
                )}
              />
              <span className="relative">
                <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
                {showDot && (
                  <span className="absolute -right-1 top-0 size-2 rounded-full bg-accent" />
                )}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
