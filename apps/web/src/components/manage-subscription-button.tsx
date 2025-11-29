'use client';

import { authClient } from '@/lib/auth-client';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ManageSubscriptionButtonProps {
  returnUrl?: string;
}

export function ManageSubscriptionButton({ returnUrl }: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleManageSubscription() {
    setIsLoading(true);
    
    try {
      const result = await authClient.subscription.billingPortal({
        returnUrl: returnUrl || window.location.href,
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to open billing portal');
        return;
      }

      // Redirect to Stripe billing portal
      window.location.href = result.data.url;
    } catch (error) {
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleManageSubscription} 
      variant="outline"
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Manage Subscription
    </Button>
  );
}

