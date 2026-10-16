import type {ReactNode} from 'react';
import {BottomNav} from '@/components/app/BottomNav';
import {RequireAuth} from '@/components/auth/RequireAuth';

/**
 * App shell for the signed-in part of the app: protected route wrapper,
 * a centred mobile column and the fixed bottom tab bar (DESIGN.md section 5).
 */
export default function AppShellLayout({children}: {children: ReactNode}) {
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-bg">
        <main className="pb-[calc(80px+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
