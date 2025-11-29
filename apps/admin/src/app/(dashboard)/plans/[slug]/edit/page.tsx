import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EditPlanForm from './edit-plan-form';

interface EditPlanPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { slug } = await params;

  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Edit Plan' description={`Editing subscription plan: ${slug}`}>
        <Button asChild variant='outline'>
          <Link href={`/plans/${slug}`}>
            <ArrowLeft className='size-4' />
            Back to Plan
          </Link>
        </Button>
      </PageHeader>
      <EditPlanForm slug={slug} />
    </div>
  );
}

