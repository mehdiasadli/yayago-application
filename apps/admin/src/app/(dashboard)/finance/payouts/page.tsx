'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import { RefreshCw, ArrowLeft, Wallet, Building, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import Link from 'next/link';

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const limit = 20;

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.finance.listPayouts.queryOptions({
      input: {
        page,
        limit,
        status: status as any,
      },
    })
  );

  const getStatusBadge = (payoutStatus: string) => {
    switch (payoutStatus) {
      case 'paid':
        return <Badge variant='success'>Paid</Badge>;
      case 'pending':
        return <Badge variant='warning'>Pending</Badge>;
      case 'in_transit':
        return <Badge variant='info'>In Transit</Badge>;
      case 'failed':
        return <Badge variant='destructive'>Failed</Badge>;
      case 'canceled':
        return <Badge variant='destructive'>Canceled</Badge>;
      default:
        return <Badge variant='outline'>{formatEnumValue(payoutStatus)}</Badge>;
    }
  };

  const getStatusIcon = (payoutStatus: string) => {
    switch (payoutStatus) {
      case 'paid':
        return <CheckCircle className='size-4 text-green-500' />;
      case 'pending':
        return <Clock className='size-4 text-yellow-500' />;
      case 'in_transit':
        return <Truck className='size-4 text-blue-500' />;
      case 'failed':
      case 'canceled':
        return <XCircle className='size-4 text-red-500' />;
      default:
        return <Clock className='size-4 text-gray-500' />;
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
          <h1 className='text-3xl font-bold'>Payouts</h1>
          <p className='text-muted-foreground'>View Stripe payout history</p>
        </div>
        <Button variant='outline' size='icon' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Total Paid Out</p>
              <p className='text-2xl font-bold text-green-600'>
                {formatCurrency(data.summary.totalPaidOut / 100, 'AED')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Pending Amount</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {formatCurrency(data.summary.pendingAmount / 100, 'AED')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Payout Count</p>
              <p className='text-2xl font-bold'>{data.summary.count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-wrap gap-4'>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='paid'>Paid</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='in_transit'>In Transit</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='canceled'>Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payouts Table */}
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
              <Wallet className='size-12 mx-auto mb-4 opacity-50' />
              <p>No payouts found</p>
              <p className='text-sm mt-2'>Stripe payouts to your bank account will appear here</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Arrival Date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(payout.status)}
                          <span className='font-mono text-sm'>{payout.id.slice(0, 20)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className='text-right font-medium'>
                        {formatCurrency(payout.amount / 100, payout.currency)}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Building className='size-4 text-muted-foreground' />
                          <span className='capitalize'>{payout.method}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {payout.arrivalDate ? format(new Date(payout.arrivalDate), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {format(new Date(payout.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className='flex items-center justify-between p-4 border-t'>
                <p className='text-sm text-muted-foreground'>Showing {data.items.length} payouts</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
