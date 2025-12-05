'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useRouter } from '@/lib/navigation/navigation-client';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PARTNER_URL = process.env.NEXT_PUBLIC_PARTNER_URL || 'http://localhost:3003';

interface BecomeHostButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  children?: React.ReactNode;
  showArrow?: boolean;
  redirectToOnboarding?: boolean; // If true, redirect to onboarding, otherwise to dashboard
}

export function BecomeHostButton({
  children = 'Get Started',
  showArrow = true,
  redirectToOnboarding = true,
  disabled,
  ...props
}: BecomeHostButtonProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  // Only fetch organization status if user is logged in
  const { data: hasOrganization, isLoading: isOrgLoading } = useQuery({
    queryKey: ['member-organization-status'],
    queryFn: () => orpc.members.isMemberOfAnyOrganization.call(),
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const isLoading = isSessionPending || (!!session?.user && isOrgLoading);

  const handleClick = () => {
    // S1: Not logged in - redirect to signup
    if (!session?.user) {
      router.push('/signup?callback_url=/become-a-host');
      return;
    }

    // S3: Has organization - redirect to partner dashboard
    if (hasOrganization) {
      toast.info('You already have a partner account. Redirecting to dashboard...');
      window.location.href = `${PARTNER_URL}/`;
      return;
    }

    // S2: Logged in but no organization - redirect to partner onboarding
    if (redirectToOnboarding) {
      window.location.href = `${PARTNER_URL}/onboarding`;
    } else {
      window.location.href = `${PARTNER_URL}/`;
    }
  };

  return (
    <Button onClick={handleClick} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className='mr-2 size-4 animate-spin' />
          Loading...
        </>
      ) : (
        <>
          {children}
          {showArrow &&
            (hasOrganization ? <ExternalLink className='ml-2 size-4' /> : <ArrowRight className='ml-2 size-4' />)}
        </>
      )}
    </Button>
  );
}

// Hook for custom implementations
export function useBecomeHost() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const { data: hasOrganization, isLoading: isOrgLoading } = useQuery({
    queryKey: ['member-organization-status'],
    queryFn: () => orpc.members.isMemberOfAnyOrganization.call(),
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = isSessionPending || (!!session?.user && isOrgLoading);

  const getStatus = () => {
    if (!session?.user) return 'not-logged-in' as const;
    if (hasOrganization) return 'has-organization' as const;
    return 'no-organization' as const;
  };

  const handleBecomeHost = (options?: { redirectToOnboarding?: boolean }) => {
    const status = getStatus();

    switch (status) {
      case 'not-logged-in':
        router.push('/signup?callback_url=/become-a-host');
        break;
      case 'has-organization':
        toast.info('You already have a partner account. Redirecting to dashboard...');
        window.location.href = `${PARTNER_URL}/`;
        break;
      case 'no-organization':
        if (options?.redirectToOnboarding !== false) {
          window.location.href = `${PARTNER_URL}/onboarding`;
        } else {
          window.location.href = `${PARTNER_URL}/`;
        }
        break;
    }
  };

  return {
    isLoading,
    isLoggedIn: !!session?.user,
    hasOrganization: !!hasOrganization,
    status: getStatus(),
    handleBecomeHost,
    partnerUrl: PARTNER_URL,
  };
}
