'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ArrowLeft,
  Receipt,
  CreditCard,
  RefreshCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const limit = 20;

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.finance.listTransactions.queryOptions({
      input: {
        page,
        limit,
        search: search || undefined,
        status: status as any,
        type: type as any,
      },
    })
  );

  const getStatusIcon = (txStatus: string) => {
    switch (txStatus) {
      case 'PAID':
        return <CheckCircle className='size-4 text-green-500' />;
      case 'FAILED':
        return <XCircle className='size-4 text-red-500' />;
      default:
        return <Clock className='size-4 text-yellow-500' />;
    }
  };

  const getStatusBadge = (txStatus: string) => {
    switch (txStatus) {
      case 'PAID':
        return <Badge variant='success'>Paid</Badge>;
      case 'FAILED':
        return <Badge variant='destructive'>Failed</Badge>;
      case 'REFUNDED':
        return <Badge variant='secondary'>Refunded</Badge>;
      case 'PARTIALLY_REFUNDED':
        return <Badge variant='warning'>Partial Refund</Badge>;
      default:
        return <Badge variant='outline'>{formatEnumValue(txStatus)}</Badge>;
    }
  };

  const getTypeIcon = (txType: string) => {
    switch (txType) {
      case 'subscription':
        return <CreditCard className='size-4' />;
      case 'booking':
        return <Receipt className='size-4' />;
      case 'refund':
        return <RefreshCcw className='size-4' />;
      default:
        return <Receipt className='size-4' />;
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
          <h1 className='text-3xl font-bold'>Transactions</h1>
          <p className='text-muted-foreground'>View and manage all payment transactions</p>
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
              <p className='text-sm text-muted-foreground'>Total Amount</p>
              <p className='text-2xl font-bold'>{formatCurrency(data.summary.totalAmount, 'AED')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Platform Fees</p>
              <p className='text-2xl font-bold'>{formatCurrency(data.summary.totalFees, 'AED')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Net Revenue</p>
              <p className='text-2xl font-bold'>{formatCurrency(data.summary.totalNet, 'AED')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Transactions</p>
              <p className='text-2xl font-bold'>{data.summary.count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-wrap gap-4'>
            <div className='flex-1 min-w-[200px]'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  placeholder='Search transactions...'
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
                <SelectItem value='succeeded'>Succeeded</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='booking'>Booking</SelectItem>
                <SelectItem value='subscription'>Subscription</SelectItem>
                <SelectItem value='refund'>Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
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
              <Receipt className='size-12 mx-auto mb-4 opacity-50' />
              <p>No transactions found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead className='text-right'>Fee</TableHead>
                    <TableHead className='text-right'>Net</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getTypeIcon(tx.type)}
                          <span className='capitalize'>{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className='max-w-[200px] truncate'>{tx.description}</TableCell>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{tx.customerName || 'Unknown'}</p>
                          <p className='text-xs text-muted-foreground'>{tx.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className='text-right font-medium'>{formatCurrency(tx.amount, tx.currency)}</TableCell>
                      <TableCell className='text-right text-muted-foreground'>
                        {formatCurrency(tx.fee, tx.currency)}
                      </TableCell>
                      <TableCell className='text-right font-medium text-green-600'>
                        {formatCurrency(tx.net, tx.currency)}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {format(new Date(tx.createdAt), 'MMM d, HH:mm')}
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
                    disabled={!data.pagination.hasMore}
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
