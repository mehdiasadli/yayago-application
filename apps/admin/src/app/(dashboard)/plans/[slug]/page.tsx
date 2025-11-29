import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { EditIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PlanDetailsContent from './plan-details-content';

interface PlanDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PlanDetailsPage({ params }: PlanDetailsPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4'>
      <PageHeader title='Plan Details' description={`Viewing subscription plan: ${slug}`}>
        <div className='flex items-center gap-2'>
          <Button asChild variant='outline'>
            <Link href='/plans'>
              <ArrowLeft className='size-4' />
              Back to Plans
            </Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href={`/plans/${slug}/edit`}>
              <EditIcon className='size-4' />
              Edit Plan
            </Link>
          </Button>
        </div>
      </PageHeader>
      <PlanDetailsContent slug={slug} />
    </div>
  );
}

