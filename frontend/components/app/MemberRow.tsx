'use client';

import {MoreVertical} from 'lucide-react';
import type {MemberSummary} from '@/lib/api/membersApi';
import {PERMISSION_LABELS} from '@/lib/auth/permissions';
import {Avatar} from './Avatar';
import {RoleTag} from './RoleTag';

type MemberRowProps = {
  member: MemberSummary;
  /**
   * Admins get the three-dot menu (DESIGN.md section 6.6). Without it the row is
   * read-only, and regular members never see a disabled admin control.
   */
  onOpenMenu?: (member: MemberSummary) => void;
};

/** One person in the Members list. */
export function MemberRow({member, onOpenMenu}: MemberRowProps) {
  // Admins always see the Admin tag. "Song leader" is only worth a tag when the
  // position does not already say it, so the row does not repeat itself.
  const showsPermissionTag =
    member.permission === 'songleader' && member.position !== 'Song leader';

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <Avatar name={member.name} photoUrl={member.photoUrl} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-semibold leading-6 text-text">
          {member.name}
        </p>

        {(member.position || member.permission === 'admin' || showsPermissionTag) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {member.position && <RoleTag>{member.position}</RoleTag>}
            {member.permission === 'admin' && (
              <RoleTag tone="admin">{PERMISSION_LABELS.admin}</RoleTag>
            )}
            {showsPermissionTag && (
              <RoleTag tone="permission">
                {PERMISSION_LABELS.songleader}
              </RoleTag>
            )}
          </div>
        )}
      </div>

      {onOpenMenu && (
        <button
          type="button"
          onClick={() => onOpenMenu(member)}
          aria-label={`More options for ${member.name}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors duration-150 ease-out active:bg-muted-surface"
        >
          <MoreVertical
            className="size-5"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      )}
    </li>
  );
}
