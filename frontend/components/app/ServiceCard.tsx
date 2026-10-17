import Link from 'next/link';
import {CalendarDays, ChevronRight} from 'lucide-react';
import type {ServiceSummary} from '@/lib/api/servicesApi';
import {formatDayLabel, formatTimeLabel} from '@/lib/date/manila';
import {SERVICE_TYPE_LABELS} from '@/lib/schedule/services';

type ServiceCardProps = {
  service: ServiceSummary;
};

/** One service in the schedule list (DESIGN.md section 6.4): name, date, time, chevron. */
export function ServiceCard({service}: ServiceCardProps) {
  return (
    <li>
      <Link
        href={`/schedule/${service.id}`}
        className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card transition-colors duration-150 ease-out active:bg-secondary"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
          <CalendarDays
            className="size-5"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-heading text-base font-semibold leading-6 text-text">
            {SERVICE_TYPE_LABELS[service.type]}
          </span>
          <span className="mt-0.5 block text-sm text-muted">
            {formatDayLabel(service.date)} · {formatTimeLabel(service.time)}
          </span>
        </span>

        <ChevronRight
          className="size-5 shrink-0 text-muted"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}
