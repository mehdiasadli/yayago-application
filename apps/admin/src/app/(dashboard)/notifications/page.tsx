import PageHeader from '@/components/page-header';
import NotificationsContent from './notifications-content';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import SendBroadcastDialog from './send-broadcast-dialog';

export default async function NotificationsPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  const isAdmin = session?.data?.user?.role === 'admin';

  return (
    <div className='space-y-4'>
      <PageHeader title='Notifications' description='View and manage all platform notifications'>
        {isAdmin && <SendBroadcastDialog />}
      </PageHeader>
      <NotificationsContent />
    </div>
  );
}
