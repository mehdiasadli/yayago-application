'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CreditCard,
  Building,
  User,
  Calendar,
  BarChart3,
  Receipt,
  ExternalLink,
  Download,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const subscriptionId = params.id as string;

  const { data, isLoading, error } = useQuery(
    orpc.finance.getSubscription.queryOptions({
      input: { id: subscriptionId },
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
        <AlertCircle className='size-12 text-muted-foreground mx-auto mb-4' />
        <p className='text-muted-foreground'>Subscription not found</p>
        <Link href='/finance/subscriptions'>
          <Button variant='outline' className='mt-4'>
            Back to Subscriptions
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant='success'>Active</Badge>;
      case 'trialing':
        return <Badge variant='info'>Trialing</Badge>;
      case 'past_due':
        return <Badge variant='warning'>Past Due</Badge>;
      case 'canceled':
        return <Badge variant='destructive'>Canceled</Badge>;
      default:
        return <Badge variant='outline'>{formatEnumValue(status)}</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href='/finance/subscriptions'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='size-4' />
          </Button>
        </Link>
        <div className='flex-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold'>{data.planName}</h1>
            {getStatusBadge(data.status)}
          </div>
          <p className='text-muted-foreground'>{data.organizationName}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Amount</p>
            <p className='text-2xl font-bold'>
              {formatCurrency(data.amount / 100, data.currency)}
              <span className='text-sm font-normal text-muted-foreground'>/{data.interval}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Current Period Start</p>
            <p className='text-lg font-medium'>
              {data.currentPeriodStart
                ? format(new Date(data.currentPeriodStart), 'MMM d, yyyy')
                : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Current Period End</p>
            <p className='text-lg font-medium'>
              {data.currentPeriodEnd
                ? format(new Date(data.currentPeriodEnd), 'MMM d, yyyy')
                : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Auto Renew</p>
            {data.cancelAtPeriodEnd ? (
              <Badge variant='warning'>Canceling</Badge>
            ) : (
              <Badge variant='success'>Active</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {data.cancelAtPeriodEnd && (
        <Card className='border-orange-500 bg-orange-500/5'>
          <CardContent className='p-4 flex items-center gap-3'>
            <AlertCircle className='size-5 text-orange-500' />
            <p className='text-sm'>
              This subscription is set to cancel at the end of the current period (
              {data.currentPeriodEnd
                ? format(new Date(data.currentPeriodEnd), 'MMM d, yyyy')
                : 'unknown'}
              )
            </p>
          </CardContent>
        </Card>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='size-4' />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Name</span>
              <span className='font-medium'>{data.customerName || 'Unknown'}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Email</span>
              <span>{data.customerEmail || '-'}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Organization</span>
              {data.organizationId ? (
                <Link href={`/organizations/${data.organizationId}`}>
                  <Badge variant='outline' className='cursor-pointer'>
                    {data.organizationName}
                  </Badge>
                </Link>
              ) : (
                <span>-</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='size-4' />
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm'>Listings</span>
                <span className='text-sm text-muted-foreground'>
                  {data.usage.listings.current} / {data.usage.listings.max}
                </span>
              </div>
              <Progress
                value={
                  data.usage.listings.max > 0
                    ? (data.usage.listings.current / data.usage.listings.max) * 100
                    : 0
                }
              />
            </div>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm'>Featured Listings</span>
                <span className='text-sm text-muted-foreground'>
                  {data.usage.featuredListings.current} / {data.usage.featuredListings.max}
                </span>
              </div>
              <Progress
                value={
                  data.usage.featuredListings.max > 0
                    ? (data.usage.featuredListings.current / data.usage.featuredListings.max) * 100
                    : 0
                }
              />
            </div>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm'>Team Members</span>
                <span className='text-sm text-muted-foreground'>
                  {data.usage.members.current} / {data.usage.members.max}
                </span>
              </div>
              <Progress
                value={
                  data.usage.members.max > 0
                    ? (data.usage.members.current / data.usage.members.max) * 100
                    : 0
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe IDs */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CreditCard className='size-4' />
            Stripe Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {data.stripeSubscriptionId && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Subscription ID</span>
              <code className='text-sm bg-muted px-2 py-1 rounded'>
                {data.stripeSubscriptionId}
              </code>
            </div>
          )}
          {data.stripeCustomerId && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Customer ID</span>
              <code className='text-sm bg-muted px-2 py-1 rounded'>
                {data.stripeCustomerId}
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Receipt className='size-4' />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.invoices.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>No invoices yet</p>
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
                    <TableCell className='font-mono text-sm'>
                      {inv.number || inv.id.slice(0, 14)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.status === 'paid' ? 'success' : 'outline'}
                      >
                        {inv.status}
                      </Badge>
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

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='size-4' />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {data.timeline.map((event, i) => (
              <div key={i} className='flex gap-4'>
                <div className='w-2 h-2 rounded-full bg-primary mt-2' />
                <div>
                  <p className='font-medium'>{event.event}</p>
                  <p className='text-sm text-muted-foreground'>
                    {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                  </p>
                  {event.details && (
                    <p className='text-sm text-muted-foreground mt-1'>{event.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

