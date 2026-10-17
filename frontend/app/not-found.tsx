import Link from 'next/link';
import {FileQuestion} from 'lucide-react';
import {EmptyState} from '@/components/app/EmptyState';
import {PillButton} from '@/components/app/PillButton';

/** Shown for a URL that is not part of the app. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-6">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="This screen is not part of the app. It may have been moved or removed."
        action={
          <PillButton render={<Link href="/" />} fullWidth={false}>
            Go to the app
          </PillButton>
        }
      />
    </div>
  );
}
