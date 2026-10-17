'use client';

import {useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {CalendarDays, Clock, MoreVertical, Pencil, Trash2} from 'lucide-react';
import {BottomSheet} from '@/components/app/BottomSheet';
import {ConfirmDialog} from '@/components/app/ConfirmDialog';
import {ErrorState} from '@/components/app/ErrorState';
import {PillButton} from '@/components/app/PillButton';
import {RoleAssignmentEditor} from '@/components/app/RoleAssignmentEditor';
import {RoleAssignmentList} from '@/components/app/RoleAssignmentList';
import {ScreenHeader} from '@/components/app/ScreenHeader';
import {ServiceFormSheet} from '@/components/app/ServiceFormSheet';
import {Skeleton} from '@/components/ui/skeleton';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import type {AssignmentInput} from '@/lib/api/servicesApi';
import {isAdmin} from '@/lib/auth/permissions';
import {formatDayLabel, formatTimeLabel} from '@/lib/date/manila';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useMembersQuery} from '@/lib/hooks/members/useMembersQuery';
import {
  useDeleteService,
  useSetAssignments
} from '@/lib/hooks/schedule/useServiceMutations';
import {useServiceQuery} from '@/lib/hooks/schedule/useServiceQuery';
import {SERVICE_TYPE_LABELS} from '@/lib/schedule/services';

/**
 * One service (DESIGN.md section 6.4): every role and who holds it, plus what an
 * admin can do — assign volunteers, change the day, or remove the service.
 */
export default function ServiceDetailsPage() {
  const {id} = useParams<{id: string}>();
  const router = useRouter();

  const {data: me} = useMeQuery();
  const canManage = isAdmin(me?.user);

  const {data, isPending, isError, error, refetch} = useServiceQuery(id);

  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChangingService, setIsChangingService] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const membersQuery = useMembersQuery({enabled: canManage && isEditing});
  const setAssignments = useSetAssignments();
  const deleteService = useDeleteService();

  if (isPending) return <ServiceDetailsSkeleton />;

  if (isError || !data) {
    const isMissing =
      (error as {status?: number | null} | null | undefined)?.status === 404;

    return (
      <>
        <ScreenHeader title="Service" backHref="/schedule" />
        <div className="mx-auto w-full max-w-[480px] px-4 py-6">
          <ErrorState
            message={
              isMissing
                ? 'We could not find this service. It may have been removed.'
                : getFriendlyErrorMessage(
                    error,
                    'We could not load this service. Please try again.'
                  )
            }
            onRetry={isMissing ? undefined : () => refetch()}
          />
        </div>
      </>
    );
  }

  const {service, roles} = data;

  const assignmentError = setAssignments.isError
    ? getFriendlyErrorMessage(
        setAssignments.error,
        'We could not save the assignments. Please try again.'
      )
    : null;

  const removalError = deleteService.isError
    ? getFriendlyErrorMessage(
        deleteService.error,
        'We could not remove this service. Please try again.'
      )
    : null;

  async function handleSaveAssignments(assignments: AssignmentInput[]) {
    try {
      await setAssignments.mutateAsync({id, assignments});
      setIsEditing(false);
    } catch {
      // The editor shows the friendly message.
    }
  }

  async function handleRemove() {
    try {
      await deleteService.mutateAsync(id);
      router.push('/schedule');
    } catch {
      // The dialog stays open and shows the friendly message.
    }
  }

  return (
    <>
      <ScreenHeader
        title={SERVICE_TYPE_LABELS[service.type]}
        backHref="/schedule"
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Service options"
              className="flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-150 ease-out active:bg-muted-surface"
            >
              <MoreVertical
                className="size-5"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-[480px] px-4 py-4">
        <section className="rounded-card border border-border bg-surface p-4 shadow-card">
          <p className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDayLabel(service.date)}
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-muted">
            <Clock className="size-4" aria-hidden="true" />
            {formatTimeLabel(service.time)}
          </p>

          {service.notes && (
            <p className="mt-3 rounded-card bg-muted-surface px-3 py-2 text-sm leading-5 text-text">
              {service.notes}
            </p>
          )}
        </section>

        <section className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <h2 className="font-heading text-base font-semibold text-text">
              Who is serving
            </h2>

            {canManage && !isEditing && (
              <PillButton
                type="button"
                variant="outline"
                fullWidth={false}
                onClick={() => setIsEditing(true)}
                className="h-10 px-4 text-sm"
              >
                Edit assignments
              </PillButton>
            )}
          </div>

          {isEditing ? (
            membersQuery.isPending ? (
              <AssignmentSkeleton />
            ) : membersQuery.isError ? (
              <ErrorState
                message={getFriendlyErrorMessage(
                  membersQuery.error,
                  'We could not load the team. Please try again.'
                )}
                onRetry={() => membersQuery.refetch()}
              />
            ) : (
              <RoleAssignmentEditor
                roles={roles}
                members={membersQuery.data ?? []}
                isSaving={setAssignments.isPending}
                errorMessage={assignmentError}
                onSave={handleSaveAssignments}
                onCancel={() => {
                  setAssignments.reset();
                  setIsEditing(false);
                }}
              />
            )
          ) : (
            <RoleAssignmentList roles={roles} />
          )}
        </section>
      </div>

      {/* What an admin can do with the whole service. */}
      <BottomSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={SERVICE_TYPE_LABELS[service.type]}
        description={`${formatDayLabel(service.date)} · ${formatTimeLabel(service.time)}`}
      >
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setIsChangingService(true);
            }}
            className="flex h-12 w-full items-center gap-3 rounded-card border border-border bg-surface px-4 text-base font-medium text-text transition-colors duration-150 ease-out active:bg-secondary"
          >
            <Pencil className="size-5 text-primary" aria-hidden="true" />
            Edit service
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              deleteService.reset();
              setIsRemoving(true);
            }}
            className="flex h-12 w-full items-center gap-3 rounded-card border border-border bg-surface px-4 text-base font-medium text-danger transition-colors duration-150 ease-out active:bg-danger/10"
          >
            <Trash2 className="size-5" aria-hidden="true" />
            Remove service
          </button>
        </div>
      </BottomSheet>

      {isChangingService && (
        <ServiceFormSheet
          open
          onOpenChange={open => {
            if (!open) setIsChangingService(false);
          }}
          service={service}
        />
      )}

      <ConfirmDialog
        open={isRemoving}
        onOpenChange={setIsRemoving}
        title="Remove this service?"
        description={`${formatDayLabel(service.date)} will be removed from the schedule, along with everyone assigned to it.`}
        confirmLabel="Remove"
        loadingLabel="Removing…"
        isLoading={deleteService.isPending}
        isDestructive
        errorMessage={removalError}
        onConfirm={handleRemove}
      />
    </>
  );
}

function ServiceDetailsSkeleton() {
  return (
    <>
      <ScreenHeader title="Service" backHref="/schedule" />
      <div
        className="mx-auto w-full max-w-[480px] space-y-3 px-4 py-4"
        aria-busy="true"
      >
        <Skeleton className="h-[84px] w-full" />
        <Skeleton className="h-5 w-32" />
        <AssignmentSkeleton />
      </div>
    </>
  );
}

function AssignmentSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true">
      {[0, 1, 2, 3].map(row => (
        <Skeleton key={row} className="h-[68px] w-full" />
      ))}
    </div>
  );
}
