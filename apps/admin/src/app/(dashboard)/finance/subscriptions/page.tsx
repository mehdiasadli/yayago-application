'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const limit = 20;

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.finance.listSubscriptions.queryOptions({
      input: {
        page,
        limit,
        search: search || undefined,
        status: status as any,
      },
    })
  );

  const { data: plansData } = useQuery(orpc.finance.getPlansPerformance.queryOptions({ input: {} }));

  const getStatusBadge = (subStatus: string) => {
    switch (subStatus) {
      case 'active':
        return <Badge variant='success'>Active</Badge>;
      case 'trialing':
        return <Badge variant='info'>Trialing</Badge>;
      case 'past_due':
        return <Badge variant='warning'>Past Due</Badge>;
      case 'canceled':
        return <Badge variant='destructive'>Canceled</Badge>;
      case 'unpaid':
        return <Badge variant='destructive'>Unpaid</Badge>;
      default:
        return <Badge variant='secondary'>{formatEnumValue(subStatus)}</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href='/finance'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='size-4' />
          </Button>
        </Link>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold'>Subscriptions</h1>
          <p className='text-muted-foreground'>Manage subscription billing</p>
        </div>
        <Button variant='outline' size='icon' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Active</p>
              <p className='text-2xl font-bold text-green-600'>{data.summary.totalActive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Trialing</p>
              <p className='text-2xl font-bold text-blue-600'>{data.summary.totalTrialing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Canceled</p>
              <p className='text-2xl font-bold text-red-600'>{data.summary.totalCanceled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>MRR</p>
              <p className='text-2xl font-bold'>{formatCurrency(data.summary.mrr, 'AED')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans Performance */}
      {plansData && plansData.plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plans Performance</CardTitle>
            <CardDescription>Subscription distribution across plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {plansData.plans.map((plan) => (
                <div key={plan.id} className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium'>{plan.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {formatCurrency(plan.monthlyPrice, plan.currency)}/mo
                      </p>
                    </div>
                    <Badge variant='outline'>{plan.activeSubscribers} active</Badge>
                  </div>
                  <Progress
                    value={
                      plansData.totals.totalSubscribers > 0
                        ? (plan.totalSubscribers / plansData.totals.totalSubscribers) * 100
                        : 0
                    }
                  />
                  <div className='flex justify-between text-sm text-muted-foreground'>
                    <span>MRR: {formatCurrency(plan.mrr, plan.currency)}</span>
                    <span>{plan.totalSubscribers} total</span>
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Total MRR</p>
                <p className='text-xl font-bold'>{formatCurrency(plansData.totals.totalMRR, 'AED')}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Total ARR</p>
                <p className='text-xl font-bold'>{formatCurrency(plansData.totals.totalARR, 'AED')}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Total Subscribers</p>
                <p className='text-xl font-bold'>{plansData.totals.totalSubscribers}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>ARPU</p>
                <p className='text-xl font-bold'>{formatCurrency(plansData.totals.avgRevenuePerUser, 'AED')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-wrap gap-4'>
            <div className='flex-1 min-w-[200px]'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  placeholder='Search subscriptions...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='trialing'>Trialing</SelectItem>
                <SelectItem value='past_due'>Past Due</SelectItem>
                <SelectItem value='canceled'>Canceled</SelectItem>
                <SelectItem value='unpaid'>Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='p-8 space-y-4'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className='p-8 text-center text-muted-foreground'>
              <CreditCard className='size-12 mx-auto mb-4 opacity-50' />
              <p>No subscriptions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <p className='font-medium'>{sub.organizationName || 'Unknown'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{sub.planName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getStatusBadge(sub.status)}
                          {sub.cancelAtPeriodEnd && (
                            <Badge variant='warning' className='text-xs'>
                              Canceling
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm'>{sub.customerName || 'Unknown'}</p>
                          <p className='text-xs text-muted-foreground'>{sub.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <p className='font-medium'>{formatCurrency(sub.amount / 100, sub.currency)}</p>
                        <p className='text-xs text-muted-foreground'>/{sub.interval}</p>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Link href={`/finance/subscriptions/${sub.id}`}>
                          <Button variant='ghost' size='sm'>
                            <Eye className='size-4' />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className='flex items-center justify-between p-4 border-t'>
                <p className='text-sm text-muted-foreground'>
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.pagination.total)} of{' '}
                  {data.pagination.total}
                </p>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className='size-4' />
                  </Button>
                  <span className='text-sm'>
                    Page {page} of {data.pagination.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pagination.totalPages}
                  >
                    <ChevronRight className='size-4' />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
