import PageHeader from '@/components/page-header';
import OrganizationsContent from './organizations-content';

export default async function OrganizationsPage() {
  return (
    <div className='space-y-4'>
      <PageHeader title='Organizations' description='Manage partner organizations and review pending applications' />
      <OrganizationsContent />
    </div>
  );
}
