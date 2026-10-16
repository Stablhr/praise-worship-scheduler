'use client';

import {Users} from 'lucide-react';
import {PlaceholderScreen} from '@/components/app/PlaceholderScreen';

/** Members tab. The member list arrives in Phase 2. */
export default function MembersPage() {
  return (
    <PlaceholderScreen
      title="Members"
      icon={Users}
      emptyTitle="No members yet"
      emptyDescription="Everyone in the praise and worship team will be listed here."
    />
  );
}
