'use client';

import {useMemo} from 'react';
import {useQueries} from '@tanstack/react-query';
import {CalendarDays} from 'lucide-react';
import {EmptyState} from '@/components/app/EmptyState';
import {TopBar} from '@/components/app/TopBar';
import {Skeleton} from '@/components/ui/skeleton';
import {getFirstName, getGreeting} from '@/lib/date/manila';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useServicesQuery} from '@/lib/hooks/schedule/useServicesQuery';
import {getService} from '@/lib/api/servicesApi';
import {SERVICE_TYPE_LABELS} from '@/lib/schedule/services';
import {formatDayLabel, formatTimeLabel} from '@/lib/date/manila';
import {getManilaTodayKey} from '@/lib/date/manila';

const VERSE = '“Sing to the Lord a new song.” — Psalm 96:1';

/** Home / dashboard (DESIGN.md section 6.3). */
export default function HomePage() {
  const {data} = useMeQuery();
  const member = data?.user;

  const today = getManilaTodayKey();
  const future = new Date();
  future.setDate(future.getDate() + 14);
  const futureKey = future.toISOString().slice(0, 10);

  const {data: services, isPending} = useServicesQuery(today, futureKey);

  const serviceList = useMemo(() => services ?? [], [services]);

  // Fetch details (roles) for each upcoming service.
  const detailQueries = useQueries({
    queries: serviceList.map(service => ({
      queryKey: ['service', service.id],
      queryFn: () => getService(service.id),
      staleTime: 15_000
    }))
  });

  const servicesWithDetails = useMemo(() => {
    return serviceList.map((service, index) => ({
      service,
      details: detailQueries[index]?.data ?? null
    }));
  }, [serviceList, detailQueries]);

  const nextService = servicesWithDetails[0] ?? null;

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

        {/* Next Service card */}
        {isPending ? (
          <Skeleton className="mt-4 h-24 w-full rounded-card" />
        ) : nextService ? (
          <div className="mt-4 rounded-card border border-border bg-accent-soft p-4 shadow-card">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold text-primary">Next Service</p>
            </div>
            <p className="mt-1 font-heading text-base font-semibold text-text">
              {SERVICE_TYPE_LABELS[nextService.service.type]}
            </p>
            <p className="text-sm text-muted">
              {formatDayLabel(nextService.service.date)} ·{' '}
              {formatTimeLabel(nextService.service.time)}
            </p>
            {nextService.service.notes && (
              <p className="mt-2 text-xs text-muted">
                {nextService.service.notes}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={CalendarDays}
              title="No upcoming services"
              description="Saturday prayer meetings and Sunday services will show up here once they are added."
            />
          </div>
        )}

        {/* Upcoming Assignments */}
        {servicesWithDetails.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 font-heading text-base font-semibold text-text">
              Upcoming Assignments
            </h2>
            <div className="space-y-3">
              {servicesWithDetails.slice(0, 4).map(({service, details}) => (
                <div
                  key={service.id}
                  className="rounded-card border border-border bg-surface p-4 shadow-card"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-heading text-sm font-semibold text-text">
                      {SERVICE_TYPE_LABELS[service.type]}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDayLabel(service.date)}
                    </p>
                  </div>
                  {details?.roles ? (
                    <ul className="space-y-1.5">
                      {details.roles
                        .filter(r => r.members.length > 0)
                        .map(role => (
                          <li
                            key={role.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="font-medium text-text">
                              {role.name}:
                            </span>
                            <span className="text-muted">
                              {role.members.map(m => m.name).join(', ')}
                            </span>
                          </li>
                        ))}
                      {details.roles.every(r => r.members.length === 0) && (
                        <li className="text-sm text-muted">
                          No one assigned yet.
                        </li>
                      )}
                    </ul>
                  ) : (
                    <Skeleton className="h-4 w-32" />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
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