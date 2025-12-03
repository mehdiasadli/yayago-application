'use client';

import NotificationsStats from './notifications-stats';
import NotificationsFilters from './notifications-filters';
import NotificationsTable from './notifications-table';
import SendBroadcastDialog from './send-broadcast-dialog';
import { authClient } from '@/lib/auth-client';

export default function NotificationsContent() {
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <div className='space-y-4'>
      <NotificationsStats />
      <NotificationsFilters />
      <NotificationsTable />
    </div>
  );
}
