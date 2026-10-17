'use client';

import {useMemo, useState} from 'react';
import {
  CalendarDays,
  CalendarPlus,
  ListPlus,
  Plus
} from 'lucide-react';
import {BottomSheet} from '@/components/app/BottomSheet';
import {CalendarMonth} from '@/components/app/CalendarMonth';
import {ConfirmDialog} from '@/components/app/ConfirmDialog';
import {EmptyState} from '@/components/app/EmptyState';
import {ErrorState} from '@/components/app/ErrorState';
import {PillButton} from '@/components/app/PillButton';
import {ScreenHeader} from '@/components/app/ScreenHeader';
import {ServiceCard} from '@/components/app/ServiceCard';
import {ServiceFormSheet} from '@/components/app/ServiceFormSheet';
import {Skeleton} from '@/components/ui/skeleton';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {isAdmin} from '@/lib/auth/permissions';
import {
  formatDayLabel,
  formatMonthLabel,
  getManilaTodayKey
} from '@/lib/date/manila';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useGenerateServices} from '@/lib/hooks/schedule/useServiceMutations';
import {useServicesQuery} from '@/lib/hooks/schedule/useServicesQuery';
import {getMonthKey, getMonthRange} from '@/lib/schedule/calendar';

/** Schedule tab: month calendar with dots, and a card per service (DESIGN.md section 6.4). */
export default function SchedulePage() {
  const {data: me} = useMeQuery();
  const canManage = isAdmin(me?.user);

  const [monthKey, setMonthKey] = useState(() => getMonthKey(getManilaTodayKey()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const {from, to} = getMonthRange(monthKey);
  const {data, isPending, isError, error, refetch} = useServicesQuery(from, to);
  const generateServices = useGenerateServices();

  const services = useMemo(() => data ?? [], [data]);
  const serviceDates = useMemo(
    () => new Set(services.map(service => service.date)),
    [services]
  );

  const visibleServices = selectedDate
    ? services.filter(service => service.date === selectedDate)
    : services;

  const heading = selectedDate
    ? formatDayLabel(selectedDate)
    : `Services in ${formatMonthLabel(monthKey)}`;

  function changeMonth(nextMonthKey: string) {
    setMonthKey(nextMonthKey);
    // A day from the old month would be confusing.
    setSelectedDate(null);
  }

  function focusService(service: {date: string}) {
    setMonthKey(getMonthKey(service.date));
    setSelectedDate(service.date);
  }

  function openGenerateDialog() {
    // Start from a clean slate so an old error cannot linger in the dialog.
    generateServices.reset();
    setGenerateOpen(true);
  }

  async function handleGenerate() {
    try {
      const result = await generateServices.mutateAsync(8);
      setGenerateOpen(false);

      // Show what was just created rather than leaving the member on a month
      // that has nothing in it yet.
      if (result.created.length > 0) focusService(result.created[0]);
    } catch {
      // The dialog stays open and shows the friendly message.
    }
  }

  const generateError = generateServices.isError
    ? getFriendlyErrorMessage(
        generateServices.error,
        'We could not add the services. Please try again.'
      )
    : null;

  return (
    <>
      <ScreenHeader
        title="Schedule"
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Add a service"
              className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors duration-150 ease-out active:bg-accent/80"
            >
              <Plus className="size-5" strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-[480px] px-4 py-4">
        <CalendarMonth
          monthKey={monthKey}
          selectedDate={selectedDate}
          serviceDates={serviceDates}
          onSelectDate={dateKey =>
            setSelectedDate(previous => (previous === dateKey ? null : dateKey))
          }
          onMonthChange={changeMonth}
        />

        {isPending ? (
          <ServiceListSkeleton />
        ) : isError ? (
          <div className="mt-4">
            <ErrorState
              message={getFriendlyErrorMessage(
                error,
                'We could not load the schedule. Please try again.'
              )}
              onRetry={() => refetch()}
            />
          </div>
        ) : (
          <section className="mt-4" aria-label="Services">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2 className="font-heading text-base font-semibold text-text">
                {heading}
              </h2>

              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="flex h-11 items-center px-2 text-sm font-medium text-primary transition-colors duration-150 ease-out active:bg-secondary"
                >
                  Show all
                </button>
              )}
            </div>

            {visibleServices.length === 0 ? (
              selectedDate ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No service on this day"
                  description={`Nothing is planned for ${formatDayLabel(selectedDate)}.`}
                  action={
                    <PillButton
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedDate(null)}
                    >
                      Back to this month
                    </PillButton>
                  }
                />
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No services this month"
                  description={
                    canManage
                      ? 'Add one service, or fill in the next 8 weeks in one tap.'
                      : 'Saturday prayer meetings and Sunday services will appear here.'
                  }
                  action={
                    canManage ? (
                      <PillButton
                        type="button"
                        onClick={openGenerateDialog}
                      >
                        Generate the next 8 weeks
                      </PillButton>
                    ) : undefined
                  }
                />
              )
            ) : (
              <ul className="space-y-2">
                {visibleServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* What an admin can add, before the form opens. */}
      <BottomSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Add to the schedule"
        description="One service, or the whole two months."
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setIsAdding(true);
            }}
            className="flex h-12 w-full items-center gap-3 rounded-card border border-border bg-surface px-4 text-base font-medium text-text transition-colors duration-150 ease-out active:bg-secondary"
          >
            <CalendarPlus className="size-5 text-primary" aria-hidden="true" />
            Add a service
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              openGenerateDialog();
            }}
            className="flex h-12 w-full items-center gap-3 rounded-card border border-border bg-surface px-4 text-base font-medium text-text transition-colors duration-150 ease-out active:bg-secondary"
          >
            <ListPlus className="size-5 text-primary" aria-hidden="true" />
            Generate the next 8 weeks
          </button>
        </div>
      </BottomSheet>

      {isAdding && (
        <ServiceFormSheet
          open
          onOpenChange={open => {
            if (!open) setIsAdding(false);
          }}
          defaultDate={selectedDate ?? undefined}
          onSaved={focusService}
        />
      )}

      <ConfirmDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        title="Add the next 8 weeks?"
        description="We will add a service for each of the next 8 Saturdays and Sundays. Days that already have a service are left alone."
        confirmLabel="Add services"
        loadingLabel="Adding…"
        isLoading={generateServices.isPending}
        errorMessage={generateError}
        onConfirm={handleGenerate}
      />
    </>
  );
}

/** Loading state for the list under the calendar (DESIGN.md section 8). */
function ServiceListSkeleton() {
  return (
    <div className="mt-4 space-y-2" aria-busy="true">
      <Skeleton className="h-6 w-48" />
      {[0, 1, 2].map(row => (
        <Skeleton key={row} className="h-[66px] w-full" />
      ))}
    </div>
  );
}
