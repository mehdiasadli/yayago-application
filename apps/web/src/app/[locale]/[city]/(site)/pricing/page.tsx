import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import Pricing from './pricing-section';
import { orpc } from '@/utils/orpc';

export default async function PricingPage() {
  const headersList = await headers();

  const subscriptionPlans = await orpc.subscriptionPlans.getPublicPlans.call();

  const subscription = (
    await authClient.subscription.list({
      fetchOptions: {
        headers: headersList,
      },
    })
  ).data?.find((s) => s.status === 'active' || s.status === 'trialing');

  const currentPlan = subscription?.plan;

  return (
    <div>
      <Suspense fallback={null}>
        <Pricing plans={subscriptionPlans} currentPlan={currentPlan} />
      </Suspense>
    </div>
  );
}
