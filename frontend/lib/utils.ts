import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge needs to know the design tokens from `globals.css`
 * (DESIGN.md section 4). Without this, `rounded-card` and `rounded-pill` are not
 * recognised as border-radius classes, so they lose to a component's own
 * `rounded-none` and quietly fall back to square corners.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["card", "pill"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
