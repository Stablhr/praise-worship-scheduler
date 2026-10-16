import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

type RoleTagProps = {
  children: ReactNode;
  /**
   * `role` is the filled blue position tag (Guitarist, Song leader…).
   * `admin` is the yellow tag for the Chairman and Pastor.
   * `permission` is the outlined tag for a permission that is not a position,
   * such as a guitarist who may also edit lineups.
   */
  tone?: 'role' | 'admin' | 'permission';
  className?: string;
};

/** Pill tag for positions and permissions (DESIGN.md sections 4 and 6.6). */
export function RoleTag({children, tone = 'role', className}: RoleTagProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center truncate rounded-pill px-2.5 py-0.5 text-xs font-medium',
        tone === 'role' && 'bg-secondary text-primary',
        tone === 'admin' && 'bg-accent text-accent-foreground',
        tone === 'permission' && 'border border-primary/25 text-primary',
        className
      )}
    >
      {children}
    </span>
  );
}
