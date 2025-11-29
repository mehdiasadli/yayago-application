import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import OrganizationDetailsContent from './organization-details-content';

interface OrganizationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Organization Details' description='View and manage organization details'>
        <Button asChild variant='outline'>
          <Link href='/organizations'>
            <ArrowLeftIcon className='size-4' />
            Back to Organizations
          </Link>
        </Button>
      </PageHeader>
      <OrganizationDetailsContent slug={slug} />
    </div>
  );
}

