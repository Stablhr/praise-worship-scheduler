'use client';

import type {ReactNode} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {X} from 'lucide-react';

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Optional line under the title. */
  description?: string;
  /** Stays put at the bottom of the sheet, above the keyboard, while the body scrolls. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Sheet that slides up from the bottom of the screen (DESIGN.md section 7).
 *
 * Built on the Base UI dialog rather than from scratch, so focus trapping,
 * Escape and the backdrop come from the primitive. The close button sits after
 * the content in the DOM (moved to the top-right corner with absolute
 * positioning) so the first thing focused is the first field or action.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children
}: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-text/40 duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />

        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-[480px] flex-col rounded-t-card bg-surface pb-[env(safe-area-inset-bottom)] shadow-card outline-none duration-200 ease-out data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full">
          <span className="mx-auto mt-2 block h-1 w-10 shrink-0 rounded-pill bg-border" />

          <div className="shrink-0 px-4 pt-3">
            <Dialog.Title className="font-heading text-lg font-semibold text-text">
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="mt-1 text-sm leading-5 text-muted">
                {description}
              </Dialog.Description>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t border-border px-4 py-3">
              {footer}
            </div>
          )}

          <Dialog.Close
            aria-label="Close"
            className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-150 ease-out active:bg-muted-surface"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
