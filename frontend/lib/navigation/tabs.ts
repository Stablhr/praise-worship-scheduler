import {CalendarDays, House, ListMusic, Menu, Users} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

export type AppTab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Bottom tab bar order (DESIGN.md section 5). */
export const APP_TABS: AppTab[] = [
  {href: '/home', label: 'Home', icon: House},
  {href: '/schedule', label: 'Schedule', icon: CalendarDays},
  {href: '/lineups', label: 'Lineups', icon: ListMusic},
  {href: '/members', label: 'Members', icon: Users},
  {href: '/more', label: 'More', icon: Menu}
];

export function isTabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
