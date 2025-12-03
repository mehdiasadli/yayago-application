'use client';

import NotificationsStats from './notifications-stats';
import NotificationsFilters from './notifications-filters';
import NotificationsList from './notifications-list';

export default function NotificationsContent() {
  return (
    <div className='space-y-4'>
      <NotificationsStats />
      <NotificationsFilters />
      <NotificationsList />
    </div>
  );
}

