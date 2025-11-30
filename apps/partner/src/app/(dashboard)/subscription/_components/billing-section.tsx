'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Receipt,
  ExternalLink,
  Loader2,
  FileText,
  History,
  Shield,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  organizationId: string;
}

export function BillingSection({ organizationId }: Props) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const openBillingPortal = async () => {
    setIsLoadingPortal(true);
    try {
      // Use the billing portal method with the organization as referenceId
      const result = await authClient.subscription.billingPortal({
        referenceId: organizationId,
        returnUrl: window.location.href,
      });
      
      if (result.error) {
        toast.error(result.error.message || 'Failed to open billing portal');
      } else if (result.data?.url) {
        // Redirect to Stripe billing portal
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error('Billing portal error:', err);
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Billing Portal Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CreditCard className='size-5' />
            Billing Portal
          </CardTitle>
          <CardDescription>
            Manage your payment methods, view invoices, and update billing information
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='p-4 border rounded-lg space-y-2'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <CreditCard className='size-4' />
                <span className='text-sm font-medium'>Payment Methods</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Add, remove, or update your credit cards and payment methods
              </p>
            </div>
            <div className='p-4 border rounded-lg space-y-2'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Receipt className='size-4' />
                <span className='text-sm font-medium'>Invoices</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                View and download your past invoices and receipts
              </p>
            </div>
            <div className='p-4 border rounded-lg space-y-2'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Building className='size-4' />
                <span className='text-sm font-medium'>Billing Address</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Update your billing address and tax information
              </p>
            </div>
            <div className='p-4 border rounded-lg space-y-2'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <History className='size-4' />
                <span className='text-sm font-medium'>Payment History</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                Review all your past transactions and payments
              </p>
            </div>
          </div>

          <Separator />

          <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              You'll be redirected to our secure billing portal powered by Stripe
            </p>
            <Button onClick={openBillingPortal} disabled={isLoadingPortal} className='gap-2'>
              {isLoadingPortal ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <ExternalLink className='size-4' />
              )}
              Open Billing Portal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <FileText className='size-5' />
              Tax Documents
            </CardTitle>
            <CardDescription>Access your tax documents and invoices</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              All invoices include VAT details and can be used for tax purposes. Tax documents are
              available in the billing portal.
            </p>
            <ul className='text-sm space-y-2'>
              <li className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-primary' />
                Monthly/Annual invoices with VAT breakdown
              </li>
              <li className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-primary' />
                Tax-compliant receipt format
              </li>
              <li className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-primary' />
                Download in PDF format
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Shield className='size-5' />
              Payment Security
            </CardTitle>
            <CardDescription>Your payments are secure</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              We use industry-leading security measures to protect your payment information.
            </p>
            <ul className='text-sm space-y-2'>
              <li className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-green-500' />
                256-bit SSL encryption
              </li>
              <li className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-green-500' />
                PCI DSS compliant (Stripe)
              </li>
              <li className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-green-500' />
                Card details never stored on our servers
              </li>
              <li className='flex items-center gap-2'>
                <div className='size-1.5 rounded-full bg-green-500' />
                3D Secure authentication supported
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card className='bg-muted/50'>
        <CardHeader>
          <CardTitle className='text-lg'>Billing FAQ</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>When will I be charged?</h4>
            <p className='text-sm text-muted-foreground'>
              You'll be charged at the start of each billing period (monthly or annually). If you're on
              a trial, you won't be charged until the trial ends.
            </p>
          </div>
          <Separator />
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>Can I change my payment method?</h4>
            <p className='text-sm text-muted-foreground'>
              Yes, you can add, update, or remove payment methods anytime through the billing portal.
              Changes take effect immediately.
            </p>
          </div>
          <Separator />
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>What happens if my payment fails?</h4>
            <p className='text-sm text-muted-foreground'>
              We'll retry the payment and notify you via email. Your subscription status will change to
              "past_due" until the payment is successful.
            </p>
          </div>
          <Separator />
          <div className='space-y-2'>
            <h4 className='font-medium text-sm'>Do you offer refunds?</h4>
            <p className='text-sm text-muted-foreground'>
              We offer prorated credits for downgrades. For cancellations, you'll retain access until the
              end of your billing period. Contact support for special circumstances.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

