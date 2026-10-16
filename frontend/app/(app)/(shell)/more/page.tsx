'use client';

import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {Bell, LogOut, Settings} from 'lucide-react';
import {ScreenHeader} from '@/components/app/ScreenHeader';
import {useLogout} from '@/lib/hooks/auth/useLogout';

/**
 * More tab (DESIGN.md section 6.7).
 * Notifications arrives in Phase 6, Settings and Help and Support in Phase 7.
 * Until then this screen lists what is left plus a working Log out.
 */
export default function MorePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      queryClient.clear();
      router.replace('/login');
    }
  };

  return (
    <>
      <ScreenHeader title="More" />

      <div className="mx-auto w-full max-w-[480px] space-y-3 px-4 py-4">
        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <Row
            icon={Bell}
            label="Notifications"
            note="Arrives in Phase 6"
          />
          <Row icon={Settings} label="Settings" note="Arrives in Phase 7" />
        </div>

        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            disabled={logout.isPending}
            className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-danger transition-colors duration-150 ease-out active:bg-danger/10 disabled:opacity-60"
          >
            <LogOut className="size-5" strokeWidth={1.75} aria-hidden="true" />
            {logout.isPending ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </div>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  note
}: {
  icon: typeof Bell;
  label: string;
  note: string;
}) {
  return (
    <div className="flex min-h-[44px] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
      <span className="flex-1 text-sm font-medium text-text">{label}</span>
      <span className="text-xs text-muted">{note}</span>
    </div>
  );
}
