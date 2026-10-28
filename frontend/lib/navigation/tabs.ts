import {CalendarDays, House, ListMusic, Users} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

export type AppTab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Label for the Profile tab (rename here to change it everywhere). */
export const PROFILE_TAB_LABEL = 'Profile';
/** Route the Profile tab opens. */
export const PROFILE_TAB_HREF = '/settings';

export function isTabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Bottom tab bar order (DESIGN.md section 5). */
export const APP_TABS: AppTab[] = [
  {href: '/home', label: 'Home', icon: House},
  {href: '/schedule', label: 'Schedule', icon: CalendarDays},
  {href: '/lineups', label: 'Lineups', icon: ListMusic},
  {href: '/members', label: 'Members', icon: Users}
];