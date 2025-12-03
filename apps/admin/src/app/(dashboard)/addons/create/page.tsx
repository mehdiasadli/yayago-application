import PageHeader from '@/components/page-header';
import CreateAddonForm from './create-addon-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateAddonPage() {
  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Create Addon' description='Create a new rental addon'>
        <Button asChild variant='outline'>
          <Link href='/addons'>
            <ArrowLeft className='size-4' />
            Back to Addons
          </Link>
        </Button>
      </PageHeader>
      <CreateAddonForm />
    </div>
  );
}

