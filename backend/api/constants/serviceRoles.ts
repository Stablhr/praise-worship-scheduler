import type {ServiceType} from '../models/Service.model';

/**
 * The roles of each service, in the order the service runs
 * (CONTEXT.md section 3). One source of truth: the assignment screen, the
 * details screen and the validator all read this list.
 *
 * There is no multimedia role. It was removed on purpose.
 */
export const SERVICE_ROLES: Record<ServiceType, readonly string[]> = {
  saturday: ['Exhortation', 'Songlead', 'Guitarist', 'Moderator/Host'],
  sunday: ['Song leader', 'Guitarist', 'Bassist', 'Drummer', 'Preacher']
};

/** Default start times in Manila (CONTEXT.md section 9), as HH:mm. */
export const DEFAULT_SERVICE_TIMES: Record<ServiceType, string> = {
  saturday: '15:00',
  sunday: '09:00'
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  saturday: 'Saturday Prayer Meeting',
  sunday: 'Sunday Service'
};

export function getServiceRoles(type: ServiceType): readonly string[] {
  return SERVICE_ROLES[type];
}

/**
 * Only one member per role for now. PLAN.md section 2 allows a repeatable role
 * (more than one Guitarist); that is deferred until the team asks for it, so
 * the rule stays simple and the app can never drop a duplicate silently.
 */
export function isRoleForService(type: ServiceType, role: string): boolean {
  return getServiceRoles(type).includes(role);
}
