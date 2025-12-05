import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanSelectionContent } from './plan-selection-content';

export default async function PlanSelectionPage() {
  const headersList = await headers();
  const session = await authClient.getSession({
    fetchOptions: {
      headers: headersList,
    },
  });

  if (!session.data?.user) {
    redirect('/login');
  }

  const sessionData = session.data as any;
  
  // Check organization status
  if (!sessionData?.organization) {
    redirect('/login');
  }

  const organizationStatus = sessionData.organization.status;
  const organizationName = sessionData.organization.name;
  
  // Only approved organizations can select a plan
  if (organizationStatus !== 'APPROVED') {
    if (organizationStatus === 'PENDING_APPROVAL') {
      redirect('/');
    }
    redirect('/onboarding');
  }

  return (
    <div className='min-h-screen bg-muted/30 py-12'>
      <div className='container max-w-6xl mx-auto px-4'>
        <div className='text-center mb-12'>
          <h1 className='text-3xl font-bold mb-2'>Select Your Plan</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Welcome to YayaGO, {organizationName}! Choose the plan that best fits your business needs.
            All plans come with a <span className='text-primary font-medium'>14-day free trial</span>.
          </p>
        </div>

        <PlanSelectionContent />
      </div>
    </div>
  );
}

