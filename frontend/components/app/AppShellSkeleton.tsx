import {BrandLogo} from './BrandLogo';
import {Skeleton} from '@/components/ui/skeleton';

/** Shown while the app checks whether someone is signed in. */
export function AppShellSkeleton() {
  return (
    <div className="min-h-dvh bg-bg" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-14 bg-primary" />
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <BrandLogo size={40} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
