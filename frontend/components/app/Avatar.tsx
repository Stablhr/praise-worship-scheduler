/* eslint-disable @next/next/no-img-element -- member photos come from Google and the
   app is also packaged with Capacitor, where the Next.js image optimiser is not
   available. A plain img keeps local web and the mobile build identical. */

import {cn} from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<AvatarSize, string> = {
  // DESIGN.md section 4: 32 in the top bar, 40 in lists, 72 on the profile
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-[72px] text-xl'
};

type AvatarProps = {
  name: string;
  photoUrl?: string;
  size?: AvatarSize;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({name, photoUrl, size = 'md', className}: AvatarProps) {
  const shape = cn(
    'shrink-0 overflow-hidden rounded-full bg-accent-soft font-heading font-semibold text-primary',
    SIZE_CLASSES[size],
    className
  );

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={cn(shape, 'object-cover')}
        loading="lazy"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(shape, 'flex items-center justify-center')}
    >
      {getInitials(name)}
    </div>
  );
}
