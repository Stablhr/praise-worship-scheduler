import type {LucideIcon} from 'lucide-react';
import {EmptyState} from './EmptyState';
import {ScreenHeader} from './ScreenHeader';

type PlaceholderScreenProps = {
  title: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
};

/**
 * Temporary screen for a tab that has no data yet. Each of these is replaced
 * by the real screen in its own phase (Schedule in Phase 3, Lineups in
 * Phase 4, Members in Phase 2, More in Phase 7).
 */
export function PlaceholderScreen({
  title,
  icon,
  emptyTitle,
  emptyDescription
}: PlaceholderScreenProps) {
  return (
    <>
      <ScreenHeader title={title} />
      <div className="mx-auto w-full max-w-[480px] px-4 py-4">
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      </div>
    </>
  );
}
