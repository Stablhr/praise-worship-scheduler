'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {APP_TABS, PROFILE_TAB_HREF, PROFILE_TAB_LABEL, isTabActive} from '@/lib/navigation/tabs';
import {Avatar} from './Avatar';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {cn} from '@/lib/utils';

/** Fixed bottom tab bar, Netflix-style pattern (DESIGN.md section 5). */
export function BottomNav() {
  const pathname = usePathname();
  const {data} = useMeQuery();
  const member = data?.user;

  const isProfileActive = isTabActive(pathname, PROFILE_TAB_HREF);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 w-full max-w-[480px] items-stretch">
        {APP_TABS.map(tab => {
          const isActive = isTabActive(pathname, tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.label}
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
              <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* Profile tab — round avatar instead of a Lucide icon. */}
        <Link
          href={PROFILE_TAB_HREF}
          aria-current={isProfileActive ? 'page' : undefined}
          aria-label="Profile and settings"
          onClick={() => {
            if (isProfileActive) window.scrollTo({top: 0, behavior: 'smooth'});
          }}
          className={cn(
            'relative flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-[11px] leading-[14px] transition-colors duration-150 ease-out',
            isProfileActive ? 'font-semibold text-primary' : 'font-medium text-muted'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-0 h-[3px] w-6 rounded-b-full',
              isProfileActive ? 'bg-accent' : 'bg-transparent'
            )}
          />
          <span
            className={cn(
              'relative',
              isProfileActive && 'ring-2 ring-primary ring-offset-1 ring-offset-surface'
            )}
          >
            <Avatar
              name={member?.name ?? '?'}
              photoUrl={member?.photoUrl}
              size="sm"
              className="!size-6"
            />
          </span>
          <span>{PROFILE_TAB_LABEL}</span>
        </Link>
      </div>
    </nav>
  );
}