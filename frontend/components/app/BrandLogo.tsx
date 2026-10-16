'use client';

import {useState} from 'react';
import Image from 'next/image';
import {cn} from '@/lib/utils';

type BrandLogoProps = {
  /** Rendered size in pixels. */
  size?: number;
  className?: string;
};

/**
 * Shows the church logo from `public/assets/logo.png`.
 * Until that file exists, it falls back to a simple UCJM monogram so the app
 * never shows a broken image.
 */
export function BrandLogo({size = 72, className}: BrandLogoProps) {
  const [hasLogoFile, setHasLogoFile] = useState(true);

  if (hasLogoFile) {
    return (
      <Image
        src="/assets/logo.png"
        alt="Unity in Christ Jesus Ministries logo"
        width={size}
        height={size}
        priority
        className={cn('object-contain', className)}
        style={{width: size, height: size}}
        onError={() => setHasLogoFile(false)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label="Unity in Christ Jesus Ministries"
      className={cn(
        'flex items-center justify-center rounded-full bg-primary font-heading font-bold text-accent',
        className
      )}
      style={{width: size, height: size, fontSize: Math.round(size / 4.5)}}
    >
      UCJM
    </div>
  );
}
