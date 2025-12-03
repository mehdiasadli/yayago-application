import PageHeader from '@/components/page-header';
import NotificationsContent from './notifications-content';

export default function NotificationsPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Notifications' description='View and manage your organization notifications' />
      <NotificationsContent />
    </div>
  );
}
