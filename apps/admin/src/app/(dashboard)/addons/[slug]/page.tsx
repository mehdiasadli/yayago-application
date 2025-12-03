import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { EditIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AddonDetailsContent from './addon-details-content';

interface AddonDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AddonDetailsPage({ params }: AddonDetailsPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4'>
      <PageHeader title='Addon Details' description={`Viewing addon: ${slug}`}>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/addons'>
              <ArrowLeft className='size-4' />
              Back to Addons
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={`/addons/${slug}/edit`}>
              <EditIcon className='size-4' />
              Edit Addon
            </Link>
          </Button>
        </div>
      </PageHeader>
      <AddonDetailsContent slug={slug} />
    </div>
  );
}

