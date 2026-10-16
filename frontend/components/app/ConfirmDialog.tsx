'use client';

import {AlertDialog} from '@base-ui/react/alert-dialog';
import {PillButton} from './PillButton';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  /** Shown while the action is in flight. */
  loadingLabel?: string;
  isLoading?: boolean;
  /** Red confirm button for destructive actions such as removing a member. */
  isDestructive?: boolean;
  /** Shown under the description when the action failed. */
  errorMessage?: string | null;
  onConfirm: () => void;
};

/**
 * Small centred dialog for a yes/no choice (DESIGN.md section 7).
 * Built on the Base UI alert dialog, which traps focus and needs Explicit
 * confirmation. Destructive actions are the only time we interrupt the member.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  loadingLabel,
  isLoading = false,
  isDestructive = false,
  errorMessage,
  onConfirm
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-text/40 duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />

        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-card bg-surface p-5 shadow-card outline-none duration-200 ease-out data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <AlertDialog.Title className="font-heading text-lg font-semibold text-text">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm leading-5 text-muted">
            {description}
          </AlertDialog.Description>

          {errorMessage && (
            <p
              role="alert"
              className="mt-3 rounded-card border border-danger/30 bg-danger/10 px-3 py-2 text-sm leading-5 text-danger"
            >
              {errorMessage}
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <AlertDialog.Close
              disabled={isLoading}
              className="flex h-12 flex-1 items-center justify-center rounded-pill border border-primary/25 bg-surface font-heading text-base font-semibold text-primary transition-colors duration-150 ease-out active:bg-secondary disabled:opacity-60"
            >
              Cancel
            </AlertDialog.Close>

            <PillButton
              type="button"
              fullWidth={false}
              variant={isDestructive ? 'danger' : 'primary'}
              isLoading={isLoading}
              loadingLabel={loadingLabel ?? confirmLabel}
              onClick={onConfirm}
              className="flex-1"
            >
              {confirmLabel}
            </PillButton>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
