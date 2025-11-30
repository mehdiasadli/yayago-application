'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, RefreshCw, ArrowLeft, Users, Eye, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hasSubscription, setHasSubscription] = useState<boolean | undefined>(undefined);
  const [hasBookings, setHasBookings] = useState<boolean | undefined>(undefined);
  const limit = 20;

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.finance.listCustomers.queryOptions({
      input: {
        page,
        limit,
        search: search || undefined,
        hasSubscription,
        hasBookings,
      },
    })
  );

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
          <h1 className='text-3xl font-bold'>Customers</h1>
          <p className='text-muted-foreground'>Manage customer payment profiles</p>
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
              <p className='text-sm text-muted-foreground'>Total Customers</p>
              <p className='text-2xl font-bold'>{data.summary.totalCustomers}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>With Subscription</p>
              <p className='text-2xl font-bold'>{data.summary.customersWithSubscription}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>Total Lifetime Value</p>
              <p className='text-2xl font-bold'>{formatCurrency(data.summary.totalLifetimeValue, 'AED')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='flex-1 min-w-[200px]'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  placeholder='Search customers...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='pl-9'
                />
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='hasSubscription'
                checked={hasSubscription === true}
                onCheckedChange={(checked) => setHasSubscription(checked === true ? true : undefined)}
              />
              <Label htmlFor='hasSubscription' className='text-sm'>
                Has Subscription
              </Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='hasBookings'
                checked={hasBookings === true}
                onCheckedChange={(checked) => setHasBookings(checked === true ? true : undefined)}
              />
              <Label htmlFor='hasBookings' className='text-sm'>
                Has Bookings
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
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
              <Users className='size-12 mx-auto mb-4 opacity-50' />
              <p>No customers found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead className='text-right'>Bookings</TableHead>
                    <TableHead className='text-right'>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>{customer.name}</p>
                          <p className='text-xs text-muted-foreground'>{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.organizationName ? (
                          <span className='text-sm'>{customer.organizationName}</span>
                        ) : (
                          <span className='text-sm text-muted-foreground'>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.hasActiveSubscription ? (
                          <div className='flex items-center gap-2'>
                            <Badge variant='success'>Active</Badge>
                            <span className='text-xs text-muted-foreground'>{customer.subscriptionPlan}</span>
                          </div>
                        ) : (
                          <Badge variant='secondary'>None</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>{customer.bookingsCount}</TableCell>
                      <TableCell className='text-right font-medium'>
                        {formatCurrency(customer.totalSpent, 'AED')}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Link href={`/finance/customers/${customer.id}`}>
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
