import { orpc } from '@/utils/orpc';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ListingDetailsContent from './listing-details-content';

interface ListingDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ListingDetailsPage({ params }: ListingDetailsPageProps) {
  const { slug } = await params;

  const listing = await orpc.listings.findOne.call({ slug });

  return (
    <div className='space-y-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/listings'>
                <ArrowLeft className='size-4' />
              </Link>
            </Button>
            <span>{listing.title}</span>
          </div>
        }
        description={
          listing.vehicle
            ? `${listing.vehicle.year} ${listing.vehicle.model.brand.name} ${listing.vehicle.model.name}`
            : 'Vehicle listing'
        }
      >
        <div className='flex items-center gap-2'>
          <Button variant='outline' asChild>
            <Link href={`/listings/${slug}/edit`}>
              <Pencil className='size-4' />
              Edit
            </Link>
          </Button>
        </div>
      </PageHeader>
      <ListingDetailsContent listing={listing} />
    </div>
  );
}

