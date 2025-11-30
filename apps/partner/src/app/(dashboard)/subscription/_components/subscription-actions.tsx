'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowUpRight,
  PauseCircle,
  RotateCcw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

interface UsageData {
  plan: {
    name: string;
    slug: string;
  };
  subscription: {
    status: SubscriptionStatus;
    periodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;
  } | null;
}

interface Props {
  usage: UsageData;
  organizationId: string;
  expanded?: boolean;
}

export function SubscriptionActions({ usage, organizationId, expanded = false }: Props) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { subscription } = usage;
  const status = subscription?.status || 'active';
  const canCancel = ['active', 'trialing'].includes(status) && !subscription?.cancelAtPeriodEnd;
  const canRestore = subscription?.cancelAtPeriodEnd;
  const isPastDue = status === 'past_due';
  const isIncomplete = status === 'incomplete' || status === 'incomplete_expired';

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      // Open billing portal where users can cancel their subscription
      const result = await authClient.subscription.billingPortal({
        referenceId: organizationId,
        returnUrl: window.location.href,
      });
      
      if (result.error) {
        toast.error(result.error.message || 'Failed to open cancellation portal');
      } else if (result.data?.url) {
        // Redirect to Stripe billing portal for cancellation
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCanceling(false);
      setCancelDialogOpen(false);
    }
  };

  const handleRestore = async () => {
    if (!subscription?.stripeSubscriptionId) {
      toast.error('Subscription ID not found');
      return;
    }

    setIsRestoring(true);
    try {
      const result = await authClient.subscription.restore({
        subscriptionId: subscription.stripeSubscriptionId,
      });
      
      if (result.error) {
        toast.error(result.error.message || 'Failed to restore subscription');
      } else {
        toast.success('Subscription restored successfully!');
        // Refresh the page to get updated data
        window.location.reload();
      }
    } catch (err) {
      console.error('Restore error:', err);
      toast.error('Failed to restore subscription. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const openBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const result = await authClient.subscription.billingPortal({
        referenceId: organizationId,
        returnUrl: window.location.href,
      });
      
      if (result.error) {
        toast.error(result.error.message || 'Failed to open billing portal');
      } else if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  // Compact view (shown in overview grid)
  if (!expanded) {
    return (
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg'>Quick Actions</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Status Alerts */}
          {isPastDue && (
            <Alert variant='destructive'>
              <AlertTriangle className='size-4' />
              <AlertDescription className='text-sm'>
                Payment overdue. Please update your payment method.
              </AlertDescription>
            </Alert>
          )}

          {isIncomplete && (
            <Alert variant='warning'>
              <Info className='size-4' />
              <AlertDescription className='text-sm'>
                Complete your subscription setup to activate all features.
              </AlertDescription>
            </Alert>
          )}

          {canRestore && (
            <Alert variant='warning'>
              <RotateCcw className='size-4' />
              <AlertDescription className='text-sm'>
                Your subscription is set to end. Restore it to continue.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className='space-y-2'>
            <Button
              variant='outline'
              className='w-full justify-start gap-2'
              onClick={openBillingPortal}
              disabled={isOpeningPortal}
            >
              {isOpeningPortal ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <CreditCard className='size-4' />
              )}
              Payment Methods
            </Button>

            <Button
              variant='outline'
              className='w-full justify-start gap-2'
              onClick={() => {
                // Scroll to plans tab and click it
                const plansTab = document.querySelector('[data-value="plans"]') as HTMLElement;
                if (plansTab) {
                  plansTab.click();
                  plansTab.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Sparkles className='size-4' />
              View Plans
            </Button>

            {canRestore && (
              <Button
                variant='default'
                className='w-full justify-start gap-2'
                onClick={handleRestore}
                disabled={isRestoring}
              >
                {isRestoring ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <RefreshCw className='size-4' />
                )}
                Restore Subscription
              </Button>
            )}

            {canCancel && (
              <Button
                variant='ghost'
                className='w-full justify-start gap-2 text-muted-foreground hover:text-destructive'
                onClick={() => setCancelDialogOpen(true)}
              >
                <XCircle className='size-4' />
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>

        {/* Cancel Dialog */}
        <CancelDialog
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
          onConfirm={handleCancel}
          isLoading={isCanceling}
          periodEnd={subscription?.periodEnd}
        />
      </Card>
    );
  }

  // Expanded view (Settings tab)
  return (
    <div className='space-y-6'>
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Info className='size-5' />
            Subscription Status
          </CardTitle>
          <CardDescription>Current status of your subscription</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Status</span>
            <Badge
              variant={
                status === 'active' || status === 'trialing'
                  ? 'success'
                  : status === 'past_due' || status === 'unpaid'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {status.replace('_', ' ')}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Auto-renewal</span>
            <Badge variant={subscription?.cancelAtPeriodEnd ? 'destructive' : 'success'}>
              {subscription?.cancelAtPeriodEnd ? 'Off' : 'On'}
            </Badge>
          </div>
          {subscription?.periodEnd && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing'}
              </span>
              <span className='font-medium'>
                {new Date(subscription.periodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Actions to manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Restore */}
          {canRestore && (
            <>
              <div className='p-4 border rounded-lg bg-amber-500/5 border-amber-500/20'>
                <div className='flex items-start gap-3'>
                  <RotateCcw className='size-5 text-amber-500 mt-0.5' />
                  <div className='flex-1'>
                    <h4 className='font-medium'>Restore Subscription</h4>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Your subscription is set to cancel. Restore it to continue using all features
                      without interruption.
                    </p>
                    <Button
                      className='mt-3'
                      onClick={handleRestore}
                      disabled={isRestoring}
                    >
                      {isRestoring ? (
                        <Loader2 className='size-4 mr-2 animate-spin' />
                      ) : (
                        <RefreshCw className='size-4 mr-2' />
                      )}
                      Restore Now
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Pause (if available) */}
          <div className='p-4 border rounded-lg'>
            <div className='flex items-start gap-3'>
              <PauseCircle className='size-5 text-muted-foreground mt-0.5' />
              <div className='flex-1'>
                <h4 className='font-medium'>Pause Subscription</h4>
                <p className='text-sm text-muted-foreground mt-1'>
                  Temporarily pause your subscription. Available through the billing portal.
                </p>
                <Button
                  variant='outline'
                  className='mt-3'
                  onClick={openBillingPortal}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? (
                    <Loader2 className='size-4 mr-2 animate-spin' />
                  ) : (
                    <CreditCard className='size-4 mr-2' />
                  )}
                  Open Billing Portal
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cancel */}
          {canCancel && (
            <div className='p-4 border rounded-lg border-destructive/20'>
              <div className='flex items-start gap-3'>
                <XCircle className='size-5 text-destructive mt-0.5' />
                <div className='flex-1'>
                  <h4 className='font-medium text-destructive'>Cancel Subscription</h4>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Cancel your subscription. You'll retain access until the end of your current
                    billing period.
                  </p>
                  <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant='destructive' className='mt-3'>
                        <XCircle className='size-4 mr-2' />
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <CancelDialogContent
                      onConfirm={handleCancel}
                      isLoading={isCanceling}
                      periodEnd={subscription?.periodEnd}
                    />
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className='bg-muted/50'>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-3'>
            <Info className='size-5 text-muted-foreground' />
            <div>
              <h4 className='font-medium'>Need Help?</h4>
              <p className='text-sm text-muted-foreground mt-1'>
                If you're experiencing issues with your subscription or have questions about billing,
                please contact our support team.
              </p>
              <Button variant='link' className='px-0 mt-2' asChild>
                <a href='/help'>Contact Support</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Cancel Dialog Component
function CancelDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  periodEnd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  periodEnd: string | null | undefined;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CancelDialogContent onConfirm={onConfirm} isLoading={isLoading} periodEnd={periodEnd} />
    </Dialog>
  );
}

function CancelDialogContent({
  onConfirm,
  isLoading,
  periodEnd,
}: {
  onConfirm: () => void;
  isLoading: boolean;
  periodEnd: string | null | undefined;
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2 text-destructive'>
          <AlertTriangle className='size-5' />
          Cancel Subscription
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to cancel your subscription?
        </DialogDescription>
      </DialogHeader>
      <div className='space-y-4'>
        <Alert variant='warning'>
          <Info className='size-4' />
          <AlertDescription>
            You'll retain access to all features until{' '}
            <strong>
              {periodEnd ? new Date(periodEnd).toLocaleDateString() : 'the end of your billing period'}
            </strong>
            . After that, your account will be downgraded.
          </AlertDescription>
        </Alert>
        <div className='space-y-2 text-sm'>
          <p className='font-medium'>What happens when you cancel:</p>
          <ul className='space-y-1 text-muted-foreground'>
            <li>• Your listings will be deactivated</li>
            <li>• Team members will lose access</li>
            <li>• Data will be retained for 30 days</li>
            <li>• You can resubscribe anytime</li>
          </ul>
        </div>
      </div>
      <DialogFooter className='gap-2 sm:gap-0'>
        <Button variant='outline' onClick={() => {}}>
          Keep Subscription
        </Button>
        <Button variant='destructive' onClick={onConfirm} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className='size-4 mr-2 animate-spin' />
          ) : (
            <XCircle className='size-4 mr-2' />
          )}
          Yes, Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

