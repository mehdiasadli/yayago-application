import PageHeader from '@/components/page-header';
import CreatePlanForm from './create-plan-form';

export default function CreatePlanPage() {
  return (
    <div className='space-y-4 mb-8'>
      <PageHeader title='Create Subscription Plan' description='Create a new subscription plan' />
      <CreatePlanForm />
    </div>
  );
}

