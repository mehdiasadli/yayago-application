import PageHeader from '@/components/page-header';
import EditAddonForm from './edit-addon-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditAddonPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditAddonPage({ params }: EditAddonPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Edit Addon' description={`Editing addon: ${slug}`}>
        <Button asChild variant='outline'>
          <Link href={`/addons/${slug}`}>
            <ArrowLeft className='size-4' />
            Back to Details
          </Link>
        </Button>
      </PageHeader>
      <EditAddonForm slug={slug} />
    </div>
  );
}

