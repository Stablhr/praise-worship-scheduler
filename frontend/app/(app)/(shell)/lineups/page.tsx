'use client';

import {ListMusic} from 'lucide-react';
import {PlaceholderScreen} from '@/components/app/PlaceholderScreen';

/** Lineups tab. Songs arrive in Phase 4. */
export default function LineupsPage() {
  return (
    <PlaceholderScreen
      title="Lineups"
      icon={ListMusic}
      emptyTitle="No songs yet"
      emptyDescription="Praise and worship songs for each service will appear here."
    />
  );
}
