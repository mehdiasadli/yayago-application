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
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Receipt,
  ExternalLink,
  Download,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const limit = 20;

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.finance.listInvoices.queryOptions({
      input: {
        page,
        limit,
        status: status as any,
      },
    })
  );

  const getStatusBadge = (invStatus: string) => {
    switch (invStatus) {
      case 'paid':
        return <Badge variant='success'>Paid</Badge>;
      case 'open':
        return <Badge variant='info'>Open</Badge>;
      case 'draft':
        return <Badge variant='secondary'>Draft</Badge>;
      case 'void':
        return <Badge variant='destructive'>Void</Badge>;
      case 'uncollectible':
        return <Badge variant='destructive'>Uncollectible</Badge>;
      default:
        return <Badge variant='outline'>{formatEnumValue(invStatus)}</Badge>;
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
          <h1 className='text-3xl font-bold'>Invoices</h1>
          <p className='text-muted-foreground'>View Stripe subscription invoices</p>
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
              <p className='text-2xl font-bold'>{formatCurrency(data.summary.totalAmount / 100, 'AED')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Total Paid</p>
              <p className='text-2xl font-bold text-green-600'>{formatCurrency(data.summary.totalPaid / 100, 'AED')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Total Due</p>
              <p className='text-2xl font-bold text-orange-600'>{formatCurrency(data.summary.totalDue / 100, 'AED')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Invoice Count</p>
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
                <SelectItem value='open'>Open</SelectItem>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='void'>Void</SelectItem>
                <SelectItem value='uncollectible'>Uncollectible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
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
              <FileText className='size-12 mx-auto mb-4 opacity-50' />
              <p>No invoices found</p>
              <p className='text-sm mt-2'>Invoices from Stripe subscriptions will appear here</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <p className='font-medium font-mono text-sm'>{invoice.number || invoice.id.slice(0, 14)}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className='text-sm'>{invoice.customerName || 'Unknown'}</p>
                          <p className='text-xs text-muted-foreground'>{invoice.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className='text-right'>
                        <p className='font-medium'>{formatCurrency(invoice.amount / 100, invoice.currency)}</p>
                        {invoice.amountDue > 0 && (
                          <p className='text-xs text-orange-600'>
                            Due: {formatCurrency(invoice.amountDue / 100, invoice.currency)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {invoice.periodStart && invoice.periodEnd ? (
                          <>
                            {format(new Date(invoice.periodStart), 'MMM d')} -{' '}
                            {format(new Date(invoice.periodEnd), 'MMM d')}
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          {invoice.hostedUrl && (
                            <a href={invoice.hostedUrl} target='_blank' rel='noopener noreferrer'>
                              <Button variant='ghost' size='sm'>
                                <ExternalLink className='size-4' />
                              </Button>
                            </a>
                          )}
                          {invoice.pdfUrl && (
                            <a href={invoice.pdfUrl} target='_blank' rel='noopener noreferrer'>
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

              {/* Pagination */}
              <div className='flex items-center justify-between p-4 border-t'>
                <p className='text-sm text-muted-foreground'>Showing {data.items.length} invoices</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
