'use client';

import {CalendarDays} from 'lucide-react';
import {EmptyState} from '@/components/app/EmptyState';
import {TopBar} from '@/components/app/TopBar';
import {Skeleton} from '@/components/ui/skeleton';
import {getFirstName, getGreeting} from '@/lib/date/manila';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';

const VERSE = '“Sing to the Lord a new song.” — Psalm 96:1';

/** Home / dashboard (DESIGN.md section 6.3). */
export default function HomePage() {
  const {data} = useMeQuery();
  const member = data?.user;

  // RequireAuth shows the error state for the whole shell, so here we only
  // wait for the member profile.
  if (!member?.name) {
    return (
      <>
        <TopBar memberName="…" />
        <HomeSkeleton />
      </>
    );
  }

  return (
    <>
      <TopBar memberName={member.name} photoUrl={member.photoUrl} />

      <div className="mx-auto w-full max-w-[480px] px-4 py-4">
        <h1 className="font-heading text-xl font-semibold leading-7 text-text">
          {getGreeting()}
        </h1>
        <p className="font-heading text-xl font-semibold leading-7 text-primary">
          {getFirstName(member.name)}
        </p>
        <p className="mt-1 text-sm italic text-muted">{VERSE}</p>

        <div className="mt-4">
          <EmptyState
            icon={CalendarDays}
            title="No services yet"
            description="Saturday prayer meetings and Sunday services will show up here once they are added."
          />
        </div>
      </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[480px] space-y-3 px-4 py-4" aria-busy="true">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
