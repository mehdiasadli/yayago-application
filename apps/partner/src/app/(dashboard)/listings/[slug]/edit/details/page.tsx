import { orpc } from '@/utils/orpc';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EditDetailsForm from './edit-details-form';

interface EditDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditDetailsPage({ params }: EditDetailsPageProps) {
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
            <span>Edit Details</span>
          </div>
        }
        description={listing.title}
      />
      <EditDetailsForm listing={listing} />
    </div>
  );
}

