import { orpc } from '@/utils/orpc';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EditBookingForm from './edit-booking-form';

interface EditBookingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBookingPage({ params }: EditBookingPageProps) {
  const { slug } = await params;
  const listing = await orpc.listings.findOne.call({ slug });

  return (
    <div className='space-y-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' asChild>
              <Link href={`/listings/${slug}/edit`}>
                <ArrowLeft className='size-4' />
              </Link>
            </Button>
            <span>Edit Booking Rules</span>
          </div>
        }
        description={listing.title}
      />
      <EditBookingForm listing={listing} />
    </div>
  );
}

