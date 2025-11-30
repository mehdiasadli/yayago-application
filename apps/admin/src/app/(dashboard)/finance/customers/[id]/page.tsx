'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ArrowLeft,
  User,
  Mail,
  CreditCard,
  Building,
  Receipt,
  ExternalLink,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const { data, isLoading, error } = useQuery(
    orpc.finance.getCustomer.queryOptions({
      input: { id: customerId },
    })
  );

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Skeleton className='h-8 w-48' />
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Skeleton className='h-48' />
          <Skeleton className='h-48' />
          <Skeleton className='h-48' />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Customer not found</p>
        <Link href='/finance/customers'>
          <Button variant='outline' className='mt-4'>
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant='success'>Paid</Badge>;
      case 'FAILED':
        return <Badge variant='destructive'>Failed</Badge>;
      default:
        return <Badge variant='outline'>{formatEnumValue(status)}</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href='/finance/customers'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='size-4' />
          </Button>
        </Link>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold'>{data.name}</h1>
          <p className='text-muted-foreground'>{data.email}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Total Spent</p>
            <p className='text-2xl font-bold'>{formatCurrency(data.totalSpent, 'AED')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Bookings</p>
            <p className='text-2xl font-bold'>{data.bookingsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Subscription</p>
            {data.hasActiveSubscription ? (
              <Badge variant='success' className='mt-1'>
                {data.subscriptionPlan}
              </Badge>
            ) : (
              <Badge variant='secondary' className='mt-1'>
                None
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Member Since</p>
            <p className='text-lg font-medium'>{format(new Date(data.createdAt), 'MMM d, yyyy')}</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='size-4' />
              Customer Info
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Email</p>
              <p className='font-medium'>{data.email}</p>
            </div>
            {data.organizationName && (
              <div>
                <p className='text-sm text-muted-foreground'>Organization</p>
                <p className='font-medium'>{data.organizationName}</p>
              </div>
            )}
            {data.stripeCustomerId && (
              <div>
                <p className='text-sm text-muted-foreground'>Stripe Customer ID</p>
                <p className='font-mono text-sm'>{data.stripeCustomerId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='size-4' />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.subscription ? (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span>Plan</span>
                  <Badge variant='outline'>{data.subscription.plan}</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Status</span>
                  <Badge variant={data.subscription.status === 'active' ? 'success' : 'secondary'}>
                    {data.subscription.status}
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Amount</span>
                  <span className='font-medium'>
                    {formatCurrency(data.subscription.amount / 100, data.subscription.currency)}/
                    {data.subscription.interval}
                  </span>
                </div>
                {data.subscription.currentPeriodEnd && (
                  <div className='flex items-center justify-between'>
                    <span>Next Billing</span>
                    <span>{format(new Date(data.subscription.currentPeriodEnd), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {data.subscription.cancelAtPeriodEnd && <Badge variant='warning'>Canceling at period end</Badge>}
              </div>
            ) : (
              <p className='text-muted-foreground text-center py-8'>No active subscription</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='size-4' />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.paymentMethods.length === 0 ? (
              <p className='text-muted-foreground text-center py-8'>No payment methods</p>
            ) : (
              <div className='space-y-3'>
                {data.paymentMethods.map((pm) => (
                  <div key={pm.id} className='flex items-center justify-between p-3 border rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <CreditCard className='size-4' />
                      <div>
                        <p className='font-medium capitalize'>{pm.brand}</p>
                        <p className='text-sm text-muted-foreground'>•••• {pm.last4}</p>
                      </div>
                    </div>
                    {pm.expMonth && pm.expYear && (
                      <span className='text-sm text-muted-foreground'>
                        {pm.expMonth}/{pm.expYear}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Receipt className='size-4' />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>No transactions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className='capitalize'>{tx.type}</TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className='text-right font-medium'>{formatCurrency(tx.amount, tx.currency)}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {data.invoices.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>No invoices</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className='font-mono text-sm'>{inv.number || inv.id.slice(0, 14)}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'paid' ? 'success' : 'outline'}>{inv.status}</Badge>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(inv.amount / 100, inv.currency)}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {format(new Date(inv.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        {inv.hostedUrl && (
                          <a href={inv.hostedUrl} target='_blank' rel='noopener noreferrer'>
                            <Button variant='ghost' size='sm'>
                              <ExternalLink className='size-4' />
                            </Button>
                          </a>
                        )}
                        {inv.pdfUrl && (
                          <a href={inv.pdfUrl} target='_blank' rel='noopener noreferrer'>
                            <Button variant='ghost' size='sm'>
                              <Download className='size-4' />
                            </Button>
                          </a>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
