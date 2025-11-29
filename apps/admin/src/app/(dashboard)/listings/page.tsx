import PageHeader from '@/components/page-header';
import ListingsContent from './listings-content';

export default function ListingsPage() {
  return (
    <div className='space-y-4'>
      <PageHeader
        title='Listings'
        description='Review and manage vehicle listings from all organizations'
      />
      <ListingsContent />
    </div>
  );
}
