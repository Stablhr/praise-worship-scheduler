/**
 * Positions from CONTEXT.md section 3: the Chairman and the Pastor, then the
 * Saturday and Sunday serving roles.
 *
 * Positions are stored as free text on purpose — adding a new role should never
 * need a code change. This list drives the picker and the order of the groups on
 * the Members screen; anything the database already holds still shows up.
 */
export const MEMBER_POSITIONS = [
  'Chairman',
  'Pastor',
  'Song leader',
  'Exhortation',
  'Guitarist',
  'Bassist',
  'Drummer',
  'Moderator/Host',
  'Preacher'
] as const;

/** Group heading for members an admin has not given a position yet. */
export const NO_POSITION_LABEL = 'No position yet';

const UNKNOWN_POSITION_ORDER = 500;
const NO_POSITION_ORDER = 1000;

/**
 * Where a position sorts in the "By Role" list: known roles first, in the order
 * above, then anything unexpected, with "No position yet" always last.
 */
export function getPositionOrder(position: string): number {
  if (position === NO_POSITION_LABEL) return NO_POSITION_ORDER;

  const index = MEMBER_POSITIONS.indexOf(
    position as (typeof MEMBER_POSITIONS)[number]
  );

  return index === -1 ? UNKNOWN_POSITION_ORDER : index;
}
