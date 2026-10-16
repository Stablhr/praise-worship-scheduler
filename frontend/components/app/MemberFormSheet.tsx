'use client';

import {useState, type FormEvent} from 'react';
import type {MemberPermission} from '@/lib/api/authApi';
import type {MemberSummary} from '@/lib/api/membersApi';
import {getFriendlyErrorMessage} from '@/lib/api/getFriendlyErrorMessage';
import {
  useAddMember,
  useUpdateMember
} from '@/lib/hooks/members/useMemberMutations';
import {MEMBER_POSITIONS} from '@/lib/members/positions';
import {
  validateMemberEmail,
  validateMemberName
} from '@/lib/validation/member';
import {BottomSheet} from './BottomSheet';
import {FormField} from './FormField';
import {PillButton} from './PillButton';
import {SelectField} from './SelectField';

type MemberFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to add someone new; pass a member to edit them. */
  member?: MemberSummary;
};

type FieldErrors = {name?: string; email?: string};

const PERMISSION_OPTIONS: {value: MemberPermission; label: string}[] = [
  {value: 'member', label: 'Member — can view'},
  {value: 'songleader', label: 'Song leader — can edit lineups'},
  {value: 'admin', label: 'Admin — can manage everything'}
];

/**
 * "Add member" and "Edit member" sheet (DESIGN.md section 6.6).
 *
 * Adding someone does not create a password: they set their own the first time
 * they sign in with this email.
 */
export function MemberFormSheet({
  open,
  onOpenChange,
  member
}: MemberFormSheetProps) {
  const isEditing = Boolean(member);
  const addMember = useAddMember();
  const updateMember = useUpdateMember();

  const [name, setName] = useState(member?.name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [position, setPosition] = useState(member?.position ?? '');
  const [permission, setPermission] = useState<MemberPermission>(
    member?.permission ?? 'member'
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isSaving = addMember.isPending || updateMember.isPending;
  const error = addMember.error ?? updateMember.error;

  const errorMessage = error
    ? getFriendlyErrorMessage(
        error,
        isEditing
          ? 'We could not save your changes. Please try again.'
          : 'We could not add this member. Please try again.'
      )
    : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    const nameError = validateMemberName(name);
    const emailError = isEditing ? null : validateMemberEmail(email);

    if (nameError) nextErrors.name = nameError;
    if (emailError) nextErrors.email = emailError;

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const changes = {name: name.trim(), position: position.trim(), permission};

    try {
      if (member) {
        await updateMember.mutateAsync({id: member.id, changes});
      } else {
        await addMember.mutateAsync({...changes, email: email.trim()});
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
      title={isEditing ? 'Edit member' : 'Add member'}
      description={
        isEditing
          ? 'Change their name, position or permission.'
          : 'They set their own password the first time they sign in.'
      }
      footer={
        <PillButton
          type="submit"
          form="member-form"
          isLoading={isSaving}
          loadingLabel={isEditing ? 'Saving…' : 'Adding…'}
        >
          {isEditing ? 'Save changes' : 'Add member'}
        </PillButton>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {errorMessage && (
          <p
            role="alert"
            className="rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-5 text-danger"
          >
            {errorMessage}
          </p>
        )}

        <FormField
          id="member-name"
          label="Name"
          autoComplete="off"
          placeholder="Juan Dela Cruz"
          value={name}
          onChange={event => setName(event.target.value)}
          error={fieldErrors.name}
        />

        {isEditing ? (
          <div>
            <p className="text-sm font-medium text-text">Email</p>
            <p className="mt-2 flex min-h-12 items-center rounded-card border border-border bg-muted-surface px-4 text-base text-muted">
              {member?.email}
            </p>
            <p className="mt-1.5 text-xs leading-4 text-muted">
              This is how they sign in, so it cannot be changed here.
            </p>
          </div>
        ) : (
          <FormField
            id="member-email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="off"
            autoCapitalize="none"
            placeholder="juan@example.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
            error={fieldErrors.email}
            hint="They use this email to set up their account."
          />
        )}

        <SelectField
          id="member-position"
          label="Position"
          value={position}
          onChange={event => setPosition(event.target.value)}
        >
          <option value="">No position</option>
          {MEMBER_POSITIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>

        <SelectField
          id="member-permission"
          label="Permission"
          value={permission}
          onChange={event =>
            setPermission(event.target.value as MemberPermission)
          }
          hint="The Chairman and Pastor are admins."
        >
          {PERMISSION_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </form>
    </BottomSheet>
  );
}
