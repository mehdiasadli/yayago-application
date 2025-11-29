import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';

export async function checkSubscriptionStatus() {
  const subscriptions = await authClient.subscription.list({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (subscriptions.error || !subscriptions.data?.length) {
    return null;
  }

  return subscriptions.data.find((s) => s.status === 'active' || s.status === 'trialing') || null;
}
