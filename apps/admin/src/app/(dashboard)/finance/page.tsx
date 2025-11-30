'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// Growth badge component
function GrowthBadge({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <Badge variant={value > 0 ? 'success' : 'destructive'} className='gap-1 font-normal'>
      {value > 0 ? <TrendingUp className='size-3' /> : <TrendingDown className='size-3' />}
      {Math.abs(value)}%
    </Badge>
  );
}

// Stat card component
function StatCard({
  title,
  value,
  subtitle,
  growth,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  growth?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold'>{value}</p>
            {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
            {growth !== undefined && (
              <div className='pt-1'>
                <GrowthBadge value={growth} />
              </div>
            )}
          </div>
          <div className='rounded-xl bg-primary/10 p-3'>
            <Icon className='size-5 text-primary' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick action button
function QuickAction({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <Link href={href}>
      <Button variant='outline' className='w-full justify-between'>
        <span className='flex items-center gap-2'>
          <Icon className='size-4' />
          {label}
        </span>
        <ArrowRight className='size-4' />
      </Button>
    </Link>
  );
}

export default function FinancePage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.finance.getOverview.queryOptions({ input: {} })
  );

  const { data: balance, isLoading: balanceLoading } = useQuery(orpc.finance.getBalance.queryOptions({}));

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-64 mt-2' />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-32' />
          ))}
        </div>
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <AlertCircle className='size-12 text-muted-foreground mx-auto mb-4' />
          <p className='text-lg font-medium'>Failed to load finance data</p>
          <p className='text-muted-foreground'>Please try again later</p>
          <Button onClick={() => refetch()} className='mt-4'>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const chartConfig = {
    subscriptions: { label: 'Subscriptions', color: 'oklch(0.65 0.2 145)' },
    bookings: { label: 'Bookings Commission', color: 'oklch(0.65 0.18 260)' },
    total: { label: 'Total', color: 'oklch(0.65 0.2 295)' },
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Finance</h1>
          <p className='text-muted-foreground'>Financial overview and transaction management</p>
        </div>
        <Button variant='outline' size='icon' onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stripe Balance Card */}
      {balance && (balance.available.length > 0 || balance.pending.length > 0) && (
        <Card className='bg-linear-to-r from-violet-500 to-purple-500 text-white'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm opacity-90'>Stripe Balance</p>
                <div className='flex items-baseline gap-4 mt-2'>
                  <div>
                    <p className='text-3xl font-bold'>
                      {formatCurrency(
                        (balance.available[0]?.amount || 0) / 100,
                        balance.available[0]?.currency || 'AED'
                      )}
                    </p>
                    <p className='text-xs opacity-75'>Available</p>
                  </div>
                  {balance.pending.length > 0 && balance.pending[0].amount > 0 && (
                    <div className='border-l border-white/30 pl-4'>
                      <p className='text-xl font-semibold'>
                        {formatCurrency((balance.pending[0]?.amount || 0) / 100, balance.pending[0]?.currency || 'AED')}
                      </p>
                      <p className='text-xs opacity-75'>Pending</p>
                    </div>
                  )}
                </div>
              </div>
              <Wallet className='size-12 opacity-50' />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Revenue'
          value={formatCurrency(data.revenue.total, data.revenue.currency)}
          subtitle={`This month: ${formatCurrency(data.revenue.thisMonth, data.revenue.currency)}`}
          growth={data.revenue.growth}
          icon={DollarSign}
        />
        <StatCard
          title='MRR'
          value={formatCurrency(data.subscriptionRevenue.mrr, 'AED')}
          subtitle={`ARR: ${formatCurrency(data.subscriptionRevenue.arr, 'AED')}`}
          growth={data.subscriptionRevenue.growth}
          icon={TrendingUp}
        />
        <StatCard
          title='Booking Commission'
          value={formatCurrency(data.commission.total, 'AED')}
          subtitle={`This month: ${formatCurrency(data.commission.thisMonth, 'AED')}`}
          growth={data.commission.growth}
          icon={Receipt}
        />
        <StatCard
          title='Gross Volume'
          value={formatCurrency(data.grossVolume.total, 'AED')}
          subtitle={`This month: ${formatCurrency(data.grossVolume.thisMonth, 'AED')}`}
          growth={data.grossVolume.growth}
          icon={CreditCard}
        />
      </div>

      {/* Transaction Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4 flex items-center gap-4'>
            <div className='rounded-full bg-green-500/10 p-2'>
              <CheckCircle className='size-5 text-green-500' />
            </div>
            <div>
              <p className='text-2xl font-bold'>{data.metrics.successfulTransactions}</p>
              <p className='text-xs text-muted-foreground'>Successful</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 flex items-center gap-4'>
            <div className='rounded-full bg-yellow-500/10 p-2'>
              <Clock className='size-5 text-yellow-500' />
            </div>
            <div>
              <p className='text-2xl font-bold'>
                {data.metrics.totalTransactions - data.metrics.successfulTransactions - data.metrics.failedTransactions}
              </p>
              <p className='text-xs text-muted-foreground'>Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 flex items-center gap-4'>
            <div className='rounded-full bg-red-500/10 p-2'>
              <XCircle className='size-5 text-red-500' />
            </div>
            <div>
              <p className='text-2xl font-bold'>{data.metrics.failedTransactions}</p>
              <p className='text-xs text-muted-foreground'>Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 flex items-center gap-4'>
            <div className='rounded-full bg-blue-500/10 p-2'>
              <Receipt className='size-5 text-blue-500' />
            </div>
            <div>
              <p className='text-2xl font-bold'>{data.metrics.successRate}%</p>
              <p className='text-xs text-muted-foreground'>Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Quick Actions */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Revenue Chart */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Last 30 days revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='min-h-[300px] w-full'>
              <AreaChart data={data.revenueChart} accessibilityLayer>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type='monotone'
                  dataKey='subscriptions'
                  stackId='1'
                  stroke='var(--color-subscriptions)'
                  fill='var(--color-subscriptions)'
                  fillOpacity={0.5}
                />
                <Area
                  type='monotone'
                  dataKey='bookings'
                  stackId='1'
                  stroke='var(--color-bookings)'
                  fill='var(--color-bookings)'
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your finances</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <QuickAction href='/finance/transactions' icon={Receipt} label='View Transactions' />
            <QuickAction href='/finance/customers' icon={Users} label='Manage Customers' />
            <QuickAction href='/finance/subscriptions' icon={CreditCard} label='Subscriptions' />
            <QuickAction href='/finance/invoices' icon={Receipt} label='Invoices' />
            <QuickAction href='/finance/payouts' icon={Wallet} label='Payouts' />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment activity</CardDescription>
          </div>
          <Link href='/finance/transactions'>
            <Button variant='outline' size='sm'>
              View All
              <ArrowUpRight className='size-4 ml-1' />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentTransactions.length === 0 ? (
            <p className='text-center text-muted-foreground py-8'>No recent transactions</p>
          ) : (
            <div className='space-y-4'>
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div
                      className={`rounded-full p-2 ${
                        tx.status === 'PAID'
                          ? 'bg-green-500/10'
                          : tx.status === 'FAILED'
                            ? 'bg-red-500/10'
                            : 'bg-yellow-500/10'
                      }`}
                    >
                      {tx.status === 'PAID' ? (
                        <CheckCircle className='size-4 text-green-500' />
                      ) : tx.status === 'FAILED' ? (
                        <XCircle className='size-4 text-red-500' />
                      ) : (
                        <Clock className='size-4 text-yellow-500' />
                      )}
                    </div>
                    <div>
                      <p className='font-medium'>{tx.description}</p>
                      <p className='text-sm text-muted-foreground'>
                        {tx.customerName || tx.customerEmail || 'Unknown customer'}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>{formatCurrency(tx.amount, tx.currency)}</p>
                    <p className='text-xs text-muted-foreground'>{format(new Date(tx.createdAt), 'MMM d, HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
