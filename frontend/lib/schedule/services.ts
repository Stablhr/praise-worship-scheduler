import {BookOpen, Drum, Guitar, HandHeart, Mic, Music, Users} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import type {ServiceType} from '@/lib/api/servicesApi';

/** The full name of each service (CONTEXT.md section 3). */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  saturday: 'Saturday Prayer Meeting',
  sunday: 'Sunday Service'
};

/** Where an admin adds a service from, and what the picker offers. */
export const SERVICE_TYPES: ServiceType[] = ['sunday', 'saturday'];

/** Default start times in Manila (CONTEXT.md section 9), as HH:mm. */
export const DEFAULT_SERVICE_TIMES: Record<ServiceType, string> = {
  saturday: '15:00',
  sunday: '09:00'
};

/** A small icon per role, so a list of names is quick to read (DESIGN.md 6.4). */
const ROLE_ICONS: Record<string, LucideIcon> = {
  Exhortation: BookOpen,
  Songlead: Mic,
  'Song leader': Mic,
  Guitarist: Guitar,
  Bassist: Music,
  Drummer: Drum,
  'Moderator/Host': HandHeart,
  Preacher: BookOpen
};

export function getRoleIcon(role: string): LucideIcon {
  return ROLE_ICONS[role] ?? Users;
}
