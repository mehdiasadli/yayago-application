import { guardAnalyticsAccess } from '@/lib/page-access';
import PageHeader from '@/components/page-header';
import AnalyticsContent from './analytics-content';

export default async function AnalyticsPage() {
  // Server-side access check
  // Requires: ACTIVE org, admin/owner role, hasAnalytics subscription
  await guardAnalyticsAccess();

  return (
    <div className='space-y-4'>
      <PageHeader title='Analytics' description='Track your fleet performance and insights' />
      <AnalyticsContent />
    </div>
  );
}
