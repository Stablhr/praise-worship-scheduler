'use client';

import {ChevronLeft, ChevronRight} from 'lucide-react';
import {formatDayLabel, formatMonthLabel} from '@/lib/date/manila';
import {
  WEEKDAY_INITIALS,
  getMonthGrid,
  isToday,
  shiftMonthKey
} from '@/lib/schedule/calendar';
import {cn} from '@/lib/utils';

type CalendarMonthProps = {
  monthKey: string;
  /** The day picked by the member, or null for the whole month. */
  selectedDate: string | null;
  /** Manila days that have at least one service, for the dots. */
  serviceDates: Set<string>;
  onSelectDate: (dateKey: string | null) => void;
  onMonthChange: (monthKey: string) => void;
};

/**
 * Month calendar (DESIGN.md section 6.4): month header with arrows, a grid where
 * today is a yellow circle and days with a service carry a small blue dot.
 */
export function CalendarMonth({
  monthKey,
  selectedDate,
  serviceDates,
  onSelectDate,
  onMonthChange
}: CalendarMonthProps) {
  return (
    <section
      aria-label="Calendar"
      className="rounded-card border border-border bg-surface p-3 shadow-card"
    >
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthKey(monthKey, -1))}
          aria-label="Previous month"
          className="flex size-11 items-center justify-center rounded-full text-text transition-colors duration-150 ease-out active:bg-secondary"
        >
          <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </button>

        <h2
          aria-live="polite"
          className="font-heading text-base font-semibold text-text"
        >
          {formatMonthLabel(monthKey)}
        </h2>

        <button
          type="button"
          onClick={() => onMonthChange(shiftMonthKey(monthKey, 1))}
          aria-label="Next month"
          className="flex size-11 items-center justify-center rounded-full text-text transition-colors duration-150 ease-out active:bg-secondary"
        >
          <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div aria-hidden="true" className="mt-1 grid grid-cols-7 gap-1">
        {WEEKDAY_INITIALS.map((initial, index) => (
          <span
            key={index}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted"
          >
            {initial}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getMonthGrid(monthKey).map((dateKey, index) =>
          dateKey === null ? (
            <span key={`blank-${index}`} aria-hidden="true" />
          ) : (
            <DayCell
              key={dateKey}
              dateKey={dateKey}
              selected={dateKey === selectedDate}
              hasService={serviceDates.has(dateKey)}
              onSelect={() => onSelectDate(dateKey)}
            />
          )
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-xs leading-4 text-muted">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-primary"
        />
        A service is scheduled
      </p>
    </section>
  );
}

type DayCellProps = {
  dateKey: string;
  selected: boolean;
  hasService: boolean;
  onSelect: () => void;
};

function DayCell({dateKey, selected, hasService, onSelect}: DayCellProps) {
  const today = isToday(dateKey);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-current={today ? 'date' : undefined}
      aria-label={`${formatDayLabel(dateKey)}${hasService ? ', has a service' : ''}`}
      className={cn(
        'relative flex h-11 items-center justify-center rounded-full text-sm transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected && 'bg-primary font-semibold text-primary-foreground',
        !selected && today && 'bg-accent font-semibold text-accent-foreground',
        !selected && !today && 'text-text active:bg-secondary'
      )}
    >
      {Number(dateKey.slice(8, 10))}

      {hasService && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute bottom-1 size-1.5 rounded-full',
            selected ? 'bg-primary-foreground' : 'bg-primary'
          )}
        />
      )}
    </button>
  );
}
