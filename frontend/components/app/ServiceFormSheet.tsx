'use client';

import {useState, type FormEvent} from 'react';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import type {ServiceSummary, ServiceType} from '@/lib/api/servicesApi';
import {getManilaTodayKey} from '@/lib/date/manila';
import {
  useCreateService,
  useUpdateService
} from '@/lib/hooks/schedule/useServiceMutations';
import {
  DEFAULT_SERVICE_TIMES,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPES
} from '@/lib/schedule/services';
import {
  validateServiceDate,
  validateServiceNotes,
  validateServiceTime
} from '@/lib/validation/service';
import {BottomSheet} from './BottomSheet';
import {FormField} from './FormField';
import {PillButton} from './PillButton';
import {SelectField} from './SelectField';

type ServiceFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to add a service; pass one to edit it. */
  service?: ServiceSummary;
  /** The day the calendar is already on, so adding starts from there. */
  defaultDate?: string;
  /** Called with the saved service, so the calendar can jump to it. */
  onSaved?: (service: ServiceSummary) => void;
};

type FieldErrors = {date?: string; time?: string; notes?: string};

/**
 * "Add service" and "Edit service" sheet (DESIGN.md section 6.4).
 *
 * The date and time fields are native, so a phone opens its own picker, which is
 * friendlier and more accessible than a custom one.
 */
export function ServiceFormSheet({
  open,
  onOpenChange,
  service,
  defaultDate,
  onSaved
}: ServiceFormSheetProps) {
  const isEditing = Boolean(service);
  const createService = useCreateService();
  const updateService = useUpdateService();

  const [type, setType] = useState<ServiceType>(service?.type ?? 'sunday');
  const [date, setDate] = useState(
    service?.date ?? defaultDate ?? getManilaTodayKey()
  );
  const [time, setTime] = useState(
    service?.time ?? DEFAULT_SERVICE_TIMES[service?.type ?? 'sunday']
  );
  const [notes, setNotes] = useState(service?.notes ?? '');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isSaving = createService.isPending || updateService.isPending;
  const error = createService.error ?? updateService.error;

  const errorMessage = error
    ? getFriendlyErrorMessage(
        error,
        isEditing
          ? 'We could not save this service. Please try again.'
          : 'We could not add this service. Please try again.'
      )
    : null;

  function handleTypeChange(nextType: ServiceType) {
    setType(nextType);
    // Each service has its own usual time (CONTEXT.md section 9).
    setTime(DEFAULT_SERVICE_TIMES[nextType]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    const dateError = validateServiceDate(date);
    const timeError = validateServiceTime(time);
    const notesError = validateServiceNotes(notes);

    if (dateError) nextErrors.date = dateError;
    if (timeError) nextErrors.time = timeError;
    if (notesError) nextErrors.notes = notesError;

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      type,
      date: date.trim(),
      time: time.trim(),
      notes: notes.trim()
    };

    try {
      if (service) {
        await updateService.mutateAsync({id: service.id, changes: input});
      } else {
        onSaved?.(await createService.mutateAsync(input));
      }

      onOpenChange(false);
    } catch {
      // The friendly message above is driven by the mutation error.
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit service' : 'Add service'}
      description={
        isEditing
          ? 'Change the day, the time or the notes.'
          : 'The team will see it in the schedule straight away.'
      }
      footer={
        <PillButton
          type="submit"
          form="service-form"
          isLoading={isSaving}
          loadingLabel={isEditing ? 'Saving…' : 'Adding…'}
        >
          {isEditing ? 'Save changes' : 'Add service'}
        </PillButton>
      }
    >
      <form
        id="service-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        {errorMessage && (
          <p
            role="alert"
            className="rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-5 text-danger"
          >
            {errorMessage}
          </p>
        )}

        <SelectField
          id="service-type"
          label="Service"
          value={type}
          onChange={event => handleTypeChange(event.target.value as ServiceType)}
        >
          {SERVICE_TYPES.map(option => (
            <option key={option} value={option}>
              {SERVICE_TYPE_LABELS[option]}
            </option>
          ))}
        </SelectField>

        <FormField
          id="service-date"
          label="Date"
          type="date"
          value={date}
          onChange={event => setDate(event.target.value)}
          error={fieldErrors.date}
        />

        <FormField
          id="service-time"
          label="Time"
          type="time"
          value={time}
          onChange={event => setTime(event.target.value)}
          error={fieldErrors.time}
        />

        <FormField
          id="service-notes"
          label="Notes"
          placeholder="Anything the team should know (optional)"
          value={notes}
          maxLength={200}
          onChange={event => setNotes(event.target.value)}
          error={fieldErrors.notes}
        />
      </form>
    </BottomSheet>
  );
}
