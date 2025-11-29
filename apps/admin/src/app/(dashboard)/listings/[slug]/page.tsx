import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import ListingDetailsContent from './listing-details-content';

interface ListingPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ action?: string }>;
}

export default async function ListingPage({ params, searchParams }: ListingPageProps) {
  const { slug } = await params;
  const { action } = await searchParams;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Listing Details' description='Review and verify listing'>
        <Button asChild variant='outline'>
          <Link href='/listings'>
            <ArrowLeftIcon className='size-4' />
            Back to Listings
          </Link>
        </Button>
      </PageHeader>
      <ListingDetailsContent slug={slug} initialAction={action} />
    </div>
  );
}

