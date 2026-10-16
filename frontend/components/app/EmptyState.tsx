import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

/** Shown when a screen has nothing to display yet (DESIGN.md section 8). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface px-6 py-10 text-center shadow-card">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="font-heading text-base font-semibold text-text">{title}</h2>
      <p className="max-w-[26ch] text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}
