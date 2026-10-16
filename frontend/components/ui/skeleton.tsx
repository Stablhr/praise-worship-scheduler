import {cn} from '@/lib/utils';

/** Loading placeholder used while a screen waits for data (DESIGN.md section 8). */
export function Skeleton({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-card bg-muted-surface', className)}
      {...props}
    />
  );
}
