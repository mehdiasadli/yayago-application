import PageHeader from '@/components/page-header';
import ReviewsContent from './reviews-content';

export default function ReviewsPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Reviews' description='View and manage all customer reviews across the platform' />
      <ReviewsContent />
    </div>
  );
}
