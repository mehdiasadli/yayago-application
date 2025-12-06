'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import {
  ConnectComponentsProvider,
  ConnectPayouts,
  ConnectBalances,
  ConnectDocuments,
  ConnectNotificationBanner,
} from '@stripe/react-connect-js';
import { useTheme } from 'next-themes';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BanknoteIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  XCircle,
  Loader2,
  Wallet,
  ShieldAlert,
  ArrowLeft,
  PiggyBank,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_CONFIG = {
  enabled: {
    label: 'Active',
    description: 'Your payouts are enabled. You will receive payments automatically when trips are completed.',
    variant: 'success' as const,
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  pending: {
    label: 'Pending',
    description: 'Your payout account setup is in progress. Please complete the onboarding to enable payouts.',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600',
  },
  restricted: {
    label: 'Restricted',
    description: 'Your account has some restrictions. Please update your information to enable payouts.',
    variant: 'destructive' as const,
    icon: AlertCircle,
    color: 'text-orange-600',
  },
  disabled: {
    label: 'Disabled',
    description: 'Your payout account needs additional information. Please complete the onboarding process.',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600',
  },
};

export default function PayoutsPage() {
  const { resolvedTheme } = useTheme();
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState('payouts');
  const [connectError, setConnectError] = useState<string | null>(null);

  // Get organization data to check role
  const {
    data: org,
    isLoading: isLoadingOrg,
    error: orgError,
  } = useQuery(orpc.organizations.getMyOrganization.queryOptions());

  const isOwner = org?.memberRole === 'owner';

  // Get account status
  const {
    data: accountStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useQuery({
    ...orpc.stripeConnect.getAccountStatus.queryOptions({
      input: { organizationId: org?.id ?? '' },
    }),
    enabled: !!org?.id && isOwner,
  });

  // Create account session mutation (only for fully enabled accounts)
  const createAccountSession = useMutation({
    ...orpc.stripeConnect.createAccountSession.mutationOptions({
      onError: (error: any) => {
        console.error('Failed to create account session:', error);
        setIsInitializing(false);
      },
    }),
  });

  // Create onboarding link mutation (for redirect flow)
  const createOnboardingLink = useMutation({
    ...orpc.stripeConnect.createOnboardingLink.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error: any) => {
        const errorMessage = error.message || 'Please try again';
        if (
          errorMessage.includes('not yet available') ||
          errorMessage.includes('not available') ||
          errorMessage.includes('cannot be created') ||
          errorMessage.includes('your region')
        ) {
          setConnectError(errorMessage);
        } else {
          toast.error('Failed to create onboarding link', { description: errorMessage });
        }
      },
    }),
  });

  // Get theme-aware appearance config
  const getAppearanceConfig = useCallback(() => {
    const isDark = resolvedTheme === 'dark';

    return {
      overlays: 'dialog' as const,
      variables: {
        colorPrimary: isDark ? '#a78bfa' : '#7c3aed',
        colorBackground: isDark ? '#1c1c1c' : '#ffffff',
        colorText: isDark ? '#e5e5e5' : '#1a1a1a',
        colorSecondaryText: isDark ? '#a3a3a3' : '#737373',
        colorBorder: isDark ? '#3f3f3f' : '#e5e5e5',
        colorDanger: isDark ? '#f87171' : '#ef4444',
        fontFamily: 'Outfit, Inter, system-ui, sans-serif',
        borderRadius: '8px',
        spacingUnit: '4px',
      },
    };
  }, [resolvedTheme]);

  // Initialize Stripe Connect (ONLY for fully enabled accounts to view payouts)
  const initializeStripeConnect = useCallback(async () => {
    if (!org?.id || stripeConnectInstance || isInitializing) return;

    setIsInitializing(true);

    try {
      const sessionData = await createAccountSession.mutateAsync({
        organizationId: org.id,
      });

      const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripePublishableKey) {
        throw new Error('Stripe publishable key not configured');
      }

      const instance = await loadConnectAndInitialize({
        publishableKey: stripePublishableKey,
        fetchClientSecret: async () => sessionData.clientSecret,
        appearance: getAppearanceConfig(),
      });

      setStripeConnectInstance(instance);
    } catch (error: any) {
      console.error('Failed to initialize Stripe Connect:', error);
      // For enabled accounts, show error. For others, we use redirect anyway.
    } finally {
      setIsInitializing(false);
    }
  }, [org?.id, createAccountSession, stripeConnectInstance, isInitializing, getAppearanceConfig]);

  // Start redirect-based onboarding
  const startRedirectOnboarding = useCallback(() => {
    if (!org?.id) return;

    const baseUrl = window.location.origin;
    createOnboardingLink.mutate({
      organizationId: org.id,
      refreshUrl: `${baseUrl}/payouts?refresh=true`,
      returnUrl: `${baseUrl}/payouts?success=true`,
    });
  }, [org?.id, createOnboardingLink]);

  // Update Stripe appearance when theme changes
  useEffect(() => {
    if (stripeConnectInstance && resolvedTheme) {
      stripeConnectInstance.update({
        appearance: getAppearanceConfig(),
      });
    }
  }, [resolvedTheme, stripeConnectInstance, getAppearanceConfig]);

  // Only initialize embedded components for FULLY ENABLED accounts
  const isFullyEnabled = accountStatus?.status === 'enabled';

  useEffect(() => {
    if (org?.id && isOwner && isFullyEnabled && !stripeConnectInstance && !isInitializing) {
      initializeStripeConnect();
    }
  }, [org?.id, isOwner, isFullyEnabled, stripeConnectInstance, isInitializing, initializeStripeConnect]);

  // Check URL params for return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Onboarding progress saved');
      refetchStatus();
      window.history.replaceState({}, '', '/payouts');
    }
    if (params.get('refresh') === 'true') {
      toast.info('Please complete the onboarding process');
      window.history.replaceState({}, '', '/payouts');
    }
  }, [refetchStatus]);

  const handleRefreshStatus = async () => {
    await refetchStatus();
    toast.success('Status refreshed');
  };

  // Loading state
  if (isLoadingOrg) {
    return (
      <div className='space-y-6'>
        <div>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  // Error state
  if (orgError || !org) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Payouts</h1>
          <p className='text-muted-foreground'>Manage your bank account and receive payments</p>
        </div>
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertDescription>{orgError?.message || 'Failed to load organization data'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Not owner - show access denied
  if (!isOwner) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Payouts</h1>
          <p className='text-muted-foreground'>Manage your bank account and receive payments</p>
        </div>
        <Alert variant='destructive'>
          <ShieldAlert className='size-4' />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Only organization owners can access payout settings.</AlertDescription>
        </Alert>
        <Button asChild variant='outline'>
          <Link href='/'>
            <ArrowLeft className='size-4 mr-1.5' />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Stripe Connect not available error
  if (connectError) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold'>Payouts</h1>
          <p className='text-muted-foreground'>Manage your bank account and receive payments</p>
        </div>
        <Card className='border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10'>
          <CardHeader>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30'>
                <AlertCircle className='size-6 text-yellow-600' />
              </div>
              <div className='flex-1'>
                <CardTitle>Payouts Not Available</CardTitle>
                <CardDescription className='mt-2'>{connectError}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Stripe Connect payouts are not yet available in your region. We're working to expand our coverage. In the
              meantime, you can still list vehicles and receive bookings - we'll contact you to arrange alternative
              payment methods.
            </p>
            <div className='flex gap-3'>
              <Button asChild variant='outline'>
                <Link href='/'>
                  <ArrowLeft className='size-4 mr-1.5' />
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild variant='secondary'>
                <a href='mailto:support@yayago.com'>Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = accountStatus?.status || null;
  const statusConfig = status ? STATUS_CONFIG[status] : null;
  const StatusIcon = statusConfig?.icon || BanknoteIcon;
  const hasAccount = accountStatus?.hasAccount || false;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Payouts</h1>
          <p className='text-muted-foreground'>Manage your bank account and receive payments for completed trips</p>
        </div>
        {hasAccount && (
          <Button variant='outline' size='sm' onClick={handleRefreshStatus}>
            <RefreshCw className='size-4 mr-2' />
            Refresh Status
          </Button>
        )}
      </div>

      {/* Status Card */}
      {statusConfig && hasAccount && (
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-start gap-4'>
              <StatusIcon className={`size-8 ${statusConfig.color}`} />
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-medium'>Payout Status</span>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                </div>
                <p className='text-muted-foreground mt-1'>{statusConfig.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Details */}
      {hasAccount && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Charges</CardTitle>
            </CardHeader>
            <CardContent>
              {accountStatus?.chargesEnabled ? (
                <span className='text-green-600 flex items-center gap-2 font-medium'>
                  <CheckCircle2 className='size-5' /> Enabled
                </span>
              ) : (
                <span className='text-muted-foreground flex items-center gap-2'>
                  <Clock className='size-5' /> Pending
                </span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              {accountStatus?.payoutsEnabled ? (
                <span className='text-green-600 flex items-center gap-2 font-medium'>
                  <CheckCircle2 className='size-5' /> Enabled
                </span>
              ) : (
                <span className='text-muted-foreground flex items-center gap-2'>
                  <Clock className='size-5' /> Pending
                </span>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <BanknoteIcon className='size-5 text-primary' />
            <CardTitle>Stripe Connect</CardTitle>
          </div>
          <CardDescription>
            {isFullyEnabled
              ? 'View your payouts, balances, and manage your connected account.'
              : hasAccount
                ? 'Complete your account setup to start receiving payments.'
                : 'Connect your bank account to start receiving payments.'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Loading Status */}
          {isLoadingStatus && (
            <div className='space-y-4'>
              <Skeleton className='h-24 w-full' />
              <Skeleton className='h-48 w-full' />
            </div>
          )}

          {/* FULLY ENABLED: Show embedded components for viewing payouts */}
          {!isLoadingStatus && isFullyEnabled && (
            <>
              {isInitializing && (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <Loader2 className='size-8 animate-spin mx-auto mb-4 text-primary' />
                    <p className='text-muted-foreground'>Loading payout dashboard...</p>
                  </div>
                </div>
              )}

              {stripeConnectInstance && (
                <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                  <div className='mb-4'>
                    <ConnectNotificationBanner />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className='grid w-full grid-cols-3'>
                      <TabsTrigger value='payouts' className='flex items-center gap-2'>
                        <Wallet className='size-4' />
                        <span className='hidden sm:inline'>Payouts</span>
                      </TabsTrigger>
                      <TabsTrigger value='balances' className='flex items-center gap-2'>
                        <PiggyBank className='size-4' />
                        <span className='hidden sm:inline'>Balances</span>
                      </TabsTrigger>
                      <TabsTrigger value='documents' className='flex items-center gap-2'>
                        <FileText className='size-4' />
                        <span className='hidden sm:inline'>Documents</span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value='payouts' className='mt-4'>
                      <ConnectPayouts />
                    </TabsContent>
                    <TabsContent value='balances' className='mt-4'>
                      <ConnectBalances />
                    </TabsContent>
                    <TabsContent value='documents' className='mt-4'>
                      <ConnectDocuments />
                    </TabsContent>
                  </Tabs>
                </ConnectComponentsProvider>
              )}

              {!stripeConnectInstance && !isInitializing && (
                <div className='text-center py-8'>
                  <p className='text-muted-foreground mb-4'>Failed to load payout dashboard.</p>
                  <Button onClick={initializeStripeConnect}>
                    <RefreshCw className='size-4 mr-2' />
                    Retry
                  </Button>
                </div>
              )}
            </>
          )}

          {/* NOT FULLY ENABLED: Show redirect-based onboarding */}
          {!isLoadingStatus && !isFullyEnabled && (
            <div className='space-y-4'>
              <Alert variant='default'>
                <AlertCircle className='size-4' />
                <AlertTitle>{hasAccount ? 'Complete your setup' : 'Set up your payout account'}</AlertTitle>
                <AlertDescription>
                  {hasAccount
                    ? "Your account requires additional information. Click below to complete the setup on Stripe's secure page."
                    : "Click below to set up your bank account on Stripe's secure page. This usually takes 2-3 minutes."}
                </AlertDescription>
              </Alert>
              <div className='text-center py-4'>
                <Button onClick={startRedirectOnboarding} disabled={createOnboardingLink.isPending} size='lg'>
                  {createOnboardingLink.isPending ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Redirecting to Stripe...
                    </>
                  ) : (
                    <>
                      <ExternalLink className='size-4 mr-2' />
                      {hasAccount ? 'Continue Setup on Stripe' : 'Set Up Payouts'}
                    </>
                  )}
                </Button>
                <p className='text-sm text-muted-foreground mt-3'>
                  You'll be securely redirected to Stripe to {hasAccount ? 'complete' : 'start'} your account setup
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
