import type {ServiceRole} from '@/lib/api/servicesApi';
import {getRoleIcon} from '@/lib/schedule/services';
import {Avatar} from './Avatar';
import {RoleTag} from './RoleTag';

type RoleAssignmentListProps = {
  /** Every role of the service, in the order the service runs. */
  roles: ServiceRole[];
};

/** Who holds each role of one service (DESIGN.md section 6.4). */
export function RoleAssignmentList({roles}: RoleAssignmentListProps) {
  return (
    <ul className="space-y-2">
      {roles.map(role => {
        const Icon = getRoleIcon(role.name);

        return (
          <li
            key={role.name}
            className="rounded-card border border-border bg-surface p-3 shadow-card"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"
              >
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <h3 className="font-heading text-base font-semibold text-text">
                {role.name}
              </h3>
            </div>

            {role.members.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No one assigned yet</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {role.members.map(member => (
                  <li key={member.id} className="flex items-center gap-3">
                    <Avatar
                      name={member.name}
                      photoUrl={member.photoUrl}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                      {member.name}
                    </span>
                    {member.position && <RoleTag>{member.position}</RoleTag>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
