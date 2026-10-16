'use client';

import {CalendarDays} from 'lucide-react';
import {PlaceholderScreen} from '@/components/app/PlaceholderScreen';

/** Schedule tab. The calendar arrives in Phase 3. */
export default function SchedulePage() {
  return (
    <PlaceholderScreen
      title="Schedule"
      icon={CalendarDays}
      emptyTitle="No services yet"
      emptyDescription="The calendar and the upcoming services will appear here."
    />
  );
}
