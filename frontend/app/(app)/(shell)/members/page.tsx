'use client';

import {useMemo, useRef, useState, type KeyboardEvent, type ReactNode} from 'react';
import {Pencil, Plus, Search, Trash2, Users} from 'lucide-react';
import {BottomSheet} from '@/components/app/BottomSheet';
import {ConfirmDialog} from '@/components/app/ConfirmDialog';
import {EmptyState} from '@/components/app/EmptyState';
import {ErrorState} from '@/components/app/ErrorState';
import {MemberFormSheet} from '@/components/app/MemberFormSheet';
import {MemberRow} from '@/components/app/MemberRow';
import {PillButton} from '@/components/app/PillButton';
import {ScreenHeader} from '@/components/app/ScreenHeader';
import {Input} from '@/components/ui/input';
import {Skeleton} from '@/components/ui/skeleton';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import type {MemberSummary} from '@/lib/api/membersApi';
import {isAdmin} from '@/lib/auth/permissions';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useRemoveMember} from '@/lib/hooks/members/useMemberMutations';
import {useMembersQuery} from '@/lib/hooks/members/useMembersQuery';
import {NO_POSITION_LABEL, getPositionOrder} from '@/lib/members/positions';
import {cn} from '@/lib/utils';

type Tab = 'all' | 'role';

/** What the add/edit sheet is open for. */
type FormTarget = {mode: 'add'} | {mode: 'edit'; member: MemberSummary};

/** Members screen (DESIGN.md section 6.6). */
export default function MembersPage() {
  const {data: me} = useMeQuery();
  const canManage = isAdmin(me?.user);

  const {data, isPending, isError, error, refetch} = useMembersQuery();
  const removeMember = useRemoveMember();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const tabListRef = useRef<HTMLDivElement>(null);
  const [menuMember, setMenuMember] = useState<MemberSummary | null>(null);
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MemberSummary | null>(null);

  const members = useMemo(() => data ?? [], [data]);

  const visibleMembers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return members;

    return members.filter(
      member =>
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term)
    );
  }, [members, search]);

  // "By Role" groups by position: who plays what, at a glance.
  const positionGroups = useMemo(() => {
    const groups = new Map<string, MemberSummary[]>();

    for (const member of visibleMembers) {
      const label = member.position?.trim() || NO_POSITION_LABEL;
      const group = groups.get(label);

      if (group) group.push(member);
      else groups.set(label, [member]);
    }

    return [...groups.entries()]
      .map(([label, groupMembers]) => ({label, members: groupMembers}))
      .sort(
        (a, b) =>
          getPositionOrder(a.label) - getPositionOrder(b.label) ||
          a.label.localeCompare(b.label)
      );
  }, [visibleMembers]);

  const typedRemovalError = removeMember.isError
    ? getFriendlyErrorMessage(
        removeMember.error,
        'We could not remove this member. Please try again.'
      )
    : null;

  function renderRows(rows: MemberSummary[]) {
    return rows.map(member => (
      <MemberRow
        key={member.id}
        member={member}
        // Regular members never see the admin controls (DESIGN.md section 8).
        onOpenMenu={canManage ? setMenuMember : undefined}
      />
    ));
  }

  async function confirmRemoval() {
    if (!removeTarget) return;

    try {
      await removeMember.mutateAsync(removeTarget.id);
      setRemoveTarget(null);
    } catch {
      // The dialog stays open and shows the friendly message.
    }
  }

  /** Left/Right (and Home/End) move between the two tabs, as tabs should. */
  function handleTabKeys(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (!keys.includes(event.key)) return;

    event.preventDefault();

    // Two tabs, so Left and Right both switch to the other one.
    const nextTab: Tab =
      event.key === 'Home' ? 'all' : event.key === 'End' ? 'role' : tab === 'all' ? 'role' : 'all';

    setTab(nextTab);
    tabListRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextTab === 'all' ? 0 : 1]?.focus();
  }

  return (
    <>
      <ScreenHeader
        title="Members"
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setFormTarget({mode: 'add'})}
              aria-label="Add member"
              className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors duration-150 ease-out active:bg-accent/80"
            >
              <Plus className="size-5" strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-[480px] px-4 py-4">
        {isPending ? (
          <MemberRowsSkeleton />
        ) : isError ? (
          <ErrorState
            message={getFriendlyErrorMessage(
              error,
              'We could not load the team. Please try again.'
            )}
            onRetry={() => refetch()}
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Everyone in the praise and worship team will be listed here."
            action={
              canManage ? (
                <PillButton
                  type="button"
                  onClick={() => setFormTarget({mode: 'add'})}
                >
                  Add the first member
                </PillButton>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted"
              />
              <Input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by name or email"
                aria-label="Search members"
                className="h-12 rounded-card border-border bg-surface pl-11 pr-4 text-base text-text md:text-base placeholder:text-muted focus-visible:border-primary"
              />
            </div>

            <div
              ref={tabListRef}
              role="tablist"
              aria-label="Member list view"
              onKeyDown={handleTabKeys}
              className="mt-3 flex gap-2"
            >
              <TabButton
                id="members-tab-all"
                active={tab === 'all'}
                onClick={() => setTab('all')}
              >
                All Members
              </TabButton>
              <TabButton
                id="members-tab-role"
                active={tab === 'role'}
                onClick={() => setTab('role')}
              >
                By Role
              </TabButton>
            </div>

            <div
              role="tabpanel"
              id="members-tabs-panel"
              aria-labelledby={`members-tab-${tab}`}
              className="mt-3"
            >
              {visibleMembers.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No members found"
                  description="No one matches your search. Try a different name."
                  action={
                    <PillButton
                      type="button"
                      variant="outline"
                      onClick={() => setSearch('')}
                    >
                      Clear search
                    </PillButton>
                  }
                />
              ) : tab === 'all' ? (
                <ul className="space-y-2">{renderRows(visibleMembers)}</ul>
              ) : (
                <div className="space-y-4">
                  {positionGroups.map(group => (
                    <section key={group.label}>
                      <h2 className="mb-2 px-1 font-heading text-sm font-semibold text-muted">
                        {group.label}
                        <span className="ml-1.5 font-sans font-normal">
                          ({group.members.length})
                        </span>
                      </h2>
                      <ul className="space-y-2">
                        {renderRows(group.members)}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Three-dot menu: what an admin can do with one member. */}
      <BottomSheet
        open={Boolean(menuMember)}
        onOpenChange={open => {
          if (!open) setMenuMember(null);
        }}
        title={menuMember?.name ?? 'Member'}
        description={menuMember?.position}
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              const member = menuMember;
              setMenuMember(null);
              if (member) setFormTarget({mode: 'edit', member});
            }}
            className="flex h-12 w-full items-center gap-3 rounded-card border border-border bg-surface px-4 text-base font-medium text-text transition-colors duration-150 ease-out active:bg-secondary"
          >
            <Pencil className="size-5 text-primary" aria-hidden="true" />
            Edit member
          </button>

          <button
            type="button"
            onClick={() => {
              const member = menuMember;
              setMenuMember(null);
              removeMember.reset();
              setRemoveTarget(member);
            }}
            className="flex h-12 w-full items-center gap-3 rounded-card border border-border bg-surface px-4 text-base font-medium text-danger transition-colors duration-150 ease-out active:bg-danger/10"
          >
            <Trash2 className="size-5" aria-hidden="true" />
            Remove member
          </button>
        </div>
      </BottomSheet>

      {formTarget && (
        <MemberFormSheet
          // A key per member gives every open a clean form.
          key={formTarget.mode === 'edit' ? formTarget.member.id : 'new'}
          open
          onOpenChange={open => {
            if (!open) setFormTarget(null);
          }}
          member={
            formTarget.mode === 'edit' ? formTarget.member : undefined
          }
        />
      )}

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={open => {
          if (!open) setRemoveTarget(null);
        }}
        title="Remove member?"
        description={`${removeTarget?.name ?? 'This member'} will be removed from the team list and will not be able to sign in again. You can add them back later.`}
        confirmLabel="Remove"
        loadingLabel="Removing…"
        isLoading={removeMember.isPending}
        isDestructive
        errorMessage={typedRemovalError}
        onConfirm={confirmRemoval}
      />
    </>
  );
}

function TabButton({
  id,
  active,
  onClick,
  children
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls="members-tabs-panel"
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={cn(
        'h-11 rounded-pill px-4 text-sm font-semibold transition-colors duration-150 ease-out',
        active
          ? 'bg-primary text-primary-foreground'
          : 'border border-border bg-surface text-text active:bg-secondary'
      )}
    >
      {children}
    </button>
  );
}

/** Loading state for the list (DESIGN.md section 8: skeleton blocks, not a spinner). */
function MemberRowsSkeleton() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2, 3, 4].map(row => (
        <li
          key={row}
          className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card"
        >
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}
