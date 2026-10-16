import {cn} from '@/lib/utils';

/** The blue and yellow wave at the bottom of the splash and login screens (DESIGN.md section 6.1). */
export function WaveFooter({className}: {className?: string}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden',
        className
      )}
    >
      <svg
        viewBox="0 0 390 140"
        preserveAspectRatio="none"
        className="h-[140px] w-full"
      >
        <path
          d="M0 62c52-26 96-30 150-12 54 18 100 42 152 34 34-5 62-16 88-30v86H0z"
          fill="var(--accent)"
        />
        <path
          d="M0 88c46-22 92-24 146-6 56 19 104 38 156 26 30-7 58-18 88-32v64H0z"
          fill="var(--primary)"
          opacity="0.96"
        />
        <path
          d="M0 112c58-16 108-14 158 4 48 17 92 20 138 8 32-8 62-20 94-30v46H0z"
          fill="var(--primary-dark)"
        />
      </svg>
    </div>
  );
}
