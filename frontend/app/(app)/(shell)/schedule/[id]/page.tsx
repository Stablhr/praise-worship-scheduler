'use client';

import {useEffect, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {
  CalendarDays,
  Clock,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Trash2,
  Upload
} from 'lucide-react';
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
import {
  deleteServicePhoto,
  uploadServicePhoto
} from '@/lib/api/servicesApi';
import {isAdmin} from '@/lib/auth/permissions';
import {compressImage} from '@/lib/image/compress';
import {formatDayLabel, formatTimeLabel} from '@/lib/date/manila';
import {useMeQuery} from '@/lib/hooks/auth/useMeQuery';
import {useMembersQuery} from '@/lib/hooks/members/useMembersQuery';
import {
  useDeleteService,
  useSetAssignments
} from '@/lib/hooks/schedule/useServiceMutations';
import {useQueryClient} from '@tanstack/react-query';
import {serviceQueryKey} from '@/lib/hooks/schedule/useServiceQuery';
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
  const queryClient = useQueryClient();

  const {data, isPending, isError, error, refetch} = useServiceQuery(id);

  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChangingService, setIsChangingService] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for paste events to capture images from the clipboard.
  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void handlePhotoUpload(file);
            return;
          }
        }
      }
    }

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  async function handlePhotoUpload(file: File | Blob) {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const compressed = await compressImage(file);
      const updatedService = await uploadServicePhoto(id, compressed);
      // Update the cached service data.
      queryClient.setQueryData(serviceQueryKey(id), (previous: unknown) => {
        if (!previous || typeof previous !== 'object') return previous;
        return {...(previous as Record<string, unknown>), service: updatedService};
      });
    } catch (err) {
      setPhotoError(
        getFriendlyErrorMessage(err, 'We could not upload the photo. Please try again.')
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handlePhotoRemove() {
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const updatedService = await deleteServicePhoto(id);
      queryClient.setQueryData(serviceQueryKey(id), (previous: unknown) => {
        if (!previous || typeof previous !== 'object') return previous;
        return {...(previous as Record<string, unknown>), service: updatedService};
      });
    } catch (err) {
      setPhotoError(
        getFriendlyErrorMessage(err, 'We could not remove the photo. Please try again.')
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void handlePhotoUpload(file);
    }
    // Reset the input so the same file can be selected again.
    if (fileInputRef.current) fileInputRef.current.value = '';
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

          {/* Photo of the assigned volunteers (Phase 5). */}
          <div className="mt-4">
            {service.photoUrl ? (
              <div className="overflow-hidden rounded-card border border-border">
                <img
                  src={service.photoUrl}
                  alt="This week's team"
                  className="w-full object-cover"
                />
                {canManage && (
                  <button
                    type="button"
                    onClick={() => void handlePhotoRemove()}
                    disabled={isUploadingPhoto}
                    className="flex h-10 w-full items-center justify-center gap-2 text-sm font-medium text-danger transition-colors duration-150 ease-out active:bg-danger/10 disabled:opacity-60"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Remove photo
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-card border border-dashed border-border bg-muted-surface/50 px-4 py-6 text-center">
                <ImageIcon
                  className="mx-auto size-8 text-muted"
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm text-muted">
                  {isUploadingPhoto
                    ? 'Uploading photo…'
                    : 'Paste a photo or tap to upload'}
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  <PillButton
                    type="button"
                    variant="outline"
                    fullWidth={false}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="h-10 px-4 text-sm"
                  >
                    <Upload className="mr-1 size-4" aria-hidden="true" />
                    Choose photo
                  </PillButton>
                </div>
              </div>
            )}

            {photoError && (
              <p className="mt-2 text-sm text-danger">{photoError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Choose a photo"
            />
          </div>
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
