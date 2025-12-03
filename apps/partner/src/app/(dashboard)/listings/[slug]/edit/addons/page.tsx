import { orpc } from '@/utils/orpc';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EditAddonsContent from './edit-addons-content';

interface EditAddonsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditAddonsPage({ params }: EditAddonsPageProps) {
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
            <span>Edit Addons</span>
          </div>
        }
        description={`Configure extras and add-ons for ${listing.title}`}
      />
      <EditAddonsContent listing={listing} />
    </div>
  );
}

