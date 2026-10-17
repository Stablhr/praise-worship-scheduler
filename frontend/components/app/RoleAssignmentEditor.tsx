'use client';

import {useState, type FormEvent} from 'react';
import type {MemberSummary} from '@/lib/api/membersApi';
import type {AssignmentInput, ServiceRole} from '@/lib/api/servicesApi';
import {PillButton} from './PillButton';
import {SelectField} from './SelectField';

type RoleAssignmentEditorProps = {
  /** Every role of the service, in the order the service runs. */
  roles: ServiceRole[];
  members: MemberSummary[];
  isSaving: boolean;
  errorMessage?: string | null;
  onSave: (assignments: AssignmentInput[]) => void;
  onCancel: () => void;
};

/**
 * "Edit assignments" (DESIGN.md section 6.4): one dropdown per role, then Save
 * sends the finished picture. Only admins ever see this.
 */
export function RoleAssignmentEditor({
  roles,
  members,
  isSaving,
  errorMessage,
  onSave,
  onCancel
}: RoleAssignmentEditorProps) {
  // The role name is the key, so the dropdowns survive any re-render.
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      roles.map(role => [role.name, role.members[0]?.id ?? ''])
    )
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSave(
      Object.entries(choices)
        .filter(([, memberId]) => Boolean(memberId))
        .map(([role, memberId]) => ({role, memberId}))
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {errorMessage && (
        <p
          role="alert"
          className="rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm leading-5 text-danger"
        >
          {errorMessage}
        </p>
      )}

      <ul className="space-y-3">
        {roles.map(role => (
          <li
            key={role.name}
            className="rounded-card border border-border bg-surface p-3 shadow-card"
          >
            <SelectField
              id={`assignment-${toFieldId(role.name)}`}
              label={role.name}
              value={choices[role.name] ?? ''}
              onChange={event =>
                setChoices(previous => ({
                  ...previous,
                  [role.name]: event.target.value
                }))
              }
            >
              <option value="">No one yet</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.position
                    ? `${member.name} — ${member.position}`
                    : member.name}
                </option>
              ))}
            </SelectField>
          </li>
        ))}
      </ul>

      <div className="space-y-2 pt-1">
        <PillButton
          type="submit"
          isLoading={isSaving}
          loadingLabel="Saving…"
        >
          Save assignments
        </PillButton>
        <PillButton
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </PillButton>
      </div>
    </form>
  );
}

/** "Moderator/Host" -> "moderator-host", so it can be an element id. */
function toFieldId(role: string): string {
  return role.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}
