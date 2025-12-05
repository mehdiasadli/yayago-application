'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatEnumValue } from '@/lib/utils';
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Car,
  Calendar as CalendarLucide,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Chart imports
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Chart color palette - using oklch format to match CSS variables
const COLORS = [
  'oklch(0.65 0.2 145)', // green
  'oklch(0.65 0.18 260)', // blue
  'oklch(0.65 0.2 295)', // purple
  'oklch(0.75 0.16 70)', // yellow
  'oklch(0.70 0.15 180)', // teal
  'oklch(0.60 0.22 25)', // orange
  'oklch(0.55 0.20 350)', // red
  'oklch(0.70 0.12 200)', // cyan
];

// Preset date ranges
const presets = [
  { label: 'Last 7 days', value: '7d', getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', value: '30d', getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 90 days', value: '90d', getDates: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: 'This month', value: 'month', getDates: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  {
    label: 'Last month',
    value: 'last_month',
    getDates: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }),
  },
  { label: 'This year', value: 'year', getDates: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: 'All time', value: 'all', getDates: () => ({ from: undefined, to: undefined }) },
];

function GrowthBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <Badge variant={isPositive ? 'success' : 'destructive'} className='gap-1'>
      {isPositive ? <TrendingUp className='size-3' /> : <TrendingDown className='size-3' />}
      {isPositive ? '+' : ''}
      {value}%
    </Badge>
  );
}

function StatCard({
  title,
  value,
  growth,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  growth?: number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-sm text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold mt-1'>{value}</p>
            {description && <p className='text-xs text-muted-foreground mt-1'>{description}</p>}
            {growth !== undefined && (
              <div className='mt-2'>
                <GrowthBadge value={growth} />
              </div>
            )}
          </div>
          <div className='p-3 rounded-xl bg-primary/10'>
            <Icon className='size-5 text-primary' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DateRangePicker({
  dateRange,
  onApply,
}: {
  dateRange: DateRange | undefined;
  onApply: (range: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange);

  const handleApply = () => {
    onApply(tempRange);
    setOpen(false);
  };

  const handleClear = () => {
    setTempRange(undefined);
    onApply(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' className='justify-start text-left font-normal min-w-[240px]'>
          <CalendarIcon className='size-4 mr-2' />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
              </>
            ) : (
              format(dateRange.from, 'LLL dd, y')
            )
          ) : (
            'All time'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end'>
        <Calendar
          initialFocus
          mode='range'
          defaultMonth={tempRange?.from || dateRange?.from}
          selected={tempRange}
          onSelect={setTempRange}
          numberOfMonths={2}
        />
        <div className='flex items-center justify-between p-3 border-t'>
          <Button variant='ghost' size='sm' onClick={handleClear}>
            Clear
          </Button>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size='sm' onClick={handleApply} disabled={!tempRange?.from || !tempRange?.to}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [preset, setPreset] = useState('30d');

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.admin.getAnalytics.queryOptions({
      input: {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        granularity,
      },
    })
  );

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const presetConfig = presets.find((p) => p.value === value);
    if (presetConfig) {
      const dates = presetConfig.getDates();
      setDateRange({ from: dates.from, to: dates.to });
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-10 w-64' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='h-32' />
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Skeleton className='h-80' />
          <Skeleton className='h-80' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-16 text-center'>
          <AlertTriangle className='size-16 mx-auto mb-4 text-amber-500' />
          <p className='text-lg font-medium'>Failed to load analytics</p>
          <p className='text-sm text-muted-foreground mb-4'>{error.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Chart configs - use oklch colors directly
  const timeSeriesChartConfig: ChartConfig = {
    users: { label: 'Users', color: 'oklch(0.65 0.2 145)' },
    organizations: { label: 'Organizations', color: 'oklch(0.65 0.18 260)' },
    listings: { label: 'Listings', color: 'oklch(0.65 0.2 295)' },
    bookings: { label: 'Bookings', color: 'oklch(0.75 0.16 70)' },
  };

  const revenueChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'oklch(0.65 0.2 145)' },
    bookings: { label: 'Bookings', color: 'oklch(0.65 0.18 260)' },
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Analytics</h1>
          <p className='text-muted-foreground'>Platform performance and insights</p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          {/* Preset Selector */}
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <DateRangePicker
            dateRange={dateRange}
            onApply={(range) => {
              setDateRange(range);
              setPreset('custom');
            }}
          />

          {/* Granularity */}
          <Select value={granularity} onValueChange={(v) => setGranularity(v as any)}>
            <SelectTrigger className='w-28'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='day'>Daily</SelectItem>
              <SelectItem value='week'>Weekly</SelectItem>
              <SelectItem value='month'>Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' size='icon' onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Users'
          value={data.summary.totalUsers.toLocaleString()}
          growth={data.growth.usersGrowth}
          icon={Users}
        />
        <StatCard
          title='Organizations'
          value={data.summary.totalOrganizations.toLocaleString()}
          growth={data.growth.organizationsGrowth}
          icon={Building2}
        />
        <StatCard
          title='Listings'
          value={data.summary.totalListings.toLocaleString()}
          growth={data.growth.listingsGrowth}
          icon={Car}
        />
        <StatCard
          title='Bookings'
          value={data.summary.totalBookings.toLocaleString()}
          growth={data.growth.bookingsGrowth}
          icon={CalendarLucide}
        />
      </div>

      {/* Revenue Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <StatCard
          title='Total Revenue'
          value={formatCurrency(data.summary.totalRevenue, 'AED')}
          growth={data.growth.revenueGrowth}
          icon={DollarSign}
        />
        <StatCard
          title='Average Booking Value'
          value={formatCurrency(data.summary.avgBookingValue, 'AED')}
          icon={DollarSign}
        />
        <StatCard
          title='MRR (Subscriptions)'
          value={formatCurrency(data.subscriptions.mrr, 'AED')}
          icon={CreditCard}
          description={`${data.subscriptions.activeCount} active, ${data.subscriptions.trialingCount} trialing`}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList className='flex-wrap h-auto gap-1'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          <TabsTrigger value='bookings'>Bookings</TabsTrigger>
          <TabsTrigger value='distributions'>Status</TabsTrigger>
          <TabsTrigger value='vehicles'>Vehicles</TabsTrigger>
          <TabsTrigger value='pricing'>Pricing</TabsTrigger>
          <TabsTrigger value='geographic'>Geographic</TabsTrigger>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='top'>Rankings</TabsTrigger>
          <TabsTrigger value='recent'>Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Users & Organizations Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Users & Organizations</CardTitle>
                <CardDescription>New registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={timeSeriesChartConfig} className='min-h-[300px] w-full'>
                  <AreaChart
                    data={data.timeSeries.users.map((u, i) => ({
                      date: u.date,
                      users: u.count,
                      organizations: data.timeSeries.organizations[i]?.count || 0,
                    }))}
                    accessibilityLayer
                  >
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
                      dataKey='users'
                      stackId='1'
                      stroke='var(--color-users)'
                      fill='var(--color-users)'
                      fillOpacity={0.4}
                    />
                    <Area
                      type='monotone'
                      dataKey='organizations'
                      stackId='2'
                      stroke='var(--color-organizations)'
                      fill='var(--color-organizations)'
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Listings & Bookings Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Listings & Bookings</CardTitle>
                <CardDescription>Activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={timeSeriesChartConfig} className='min-h-[300px] w-full'>
                  <LineChart
                    data={data.timeSeries.listings.map((l, i) => ({
                      date: l.date,
                      listings: l.count,
                      bookings: data.timeSeries.bookings[i]?.count || 0,
                    }))}
                    accessibilityLayer
                  >
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
                    <Line
                      type='monotone'
                      dataKey='listings'
                      stroke='var(--color-listings)'
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type='monotone'
                      dataKey='bookings'
                      stroke='var(--color-bookings)'
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value='revenue' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Revenue and booking count by period</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className='min-h-[400px] w-full'>
                <BarChart data={data.timeSeries.revenue} accessibilityLayer>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis yAxisId='left' tickLine={false} axisLine={false} />
                  <YAxis yAxisId='right' orientation='right' tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => (name === 'revenue' ? formatCurrency(Number(value), 'AED') : value)}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar yAxisId='left' dataKey='revenue' fill='var(--color-revenue)' radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='bookings'
                    stroke='var(--color-bookings)'
                    strokeWidth={2}
                    dot={false}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distributions Tab */}
        <TabsContent value='distributions' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Organization Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Organization Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.distributions.organizationStatus}
                        dataKey='count'
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${formatEnumValue(name)} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.distributions.organizationStatus.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='flex flex-wrap gap-2 mt-2 justify-center'>
                  {data.distributions.organizationStatus.map((item, i) => (
                    <Badge key={item.status} variant='outline' className='gap-1'>
                      <div className='size-2 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {formatEnumValue(item.status)}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Listing Verification */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Listing Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.distributions.listingVerification}
                        dataKey='count'
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${formatEnumValue(name)} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.distributions.listingVerification.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='flex flex-wrap gap-2 mt-2 justify-center'>
                  {data.distributions.listingVerification.map((item, i) => (
                    <Badge key={item.status} variant='outline' className='gap-1'>
                      <div className='size-2 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {formatEnumValue(item.status)}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Booking Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.distributions.bookingStatus}
                        dataKey='count'
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.distributions.bookingStatus.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='flex flex-wrap gap-2 mt-2 justify-center'>
                  {data.distributions.bookingStatus.map((item, i) => (
                    <Badge key={item.status} variant='outline' className='gap-1'>
                      <div className='size-2 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {formatEnumValue(item.status)}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.distributions.paymentStatus}
                        dataKey='count'
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${formatEnumValue(name)} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.distributions.paymentStatus.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='flex flex-wrap gap-2 mt-2 justify-center'>
                  {data.distributions.paymentStatus.map((item, i) => (
                    <Badge key={item.status} variant='outline' className='gap-1'>
                      <div className='size-2 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {formatEnumValue(item.status)}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Roles */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>User Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.distributions.userRoles}
                        dataKey='count'
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${formatEnumValue(name)} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.distributions.userRoles.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='flex flex-wrap gap-2 mt-2 justify-center'>
                  {data.distributions.userRoles.map((item, i) => (
                    <Badge key={item.status} variant='outline' className='gap-1'>
                      <div className='size-2 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {formatEnumValue(item.status)}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Subscription Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.subscriptions.planDistribution}
                        dataKey='count'
                        nameKey='planName'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.subscriptions.planDistribution.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='flex flex-wrap gap-2 mt-2 justify-center'>
                  {data.subscriptions.planDistribution.map((item, i) => (
                    <Badge key={item.planSlug} variant='outline' className='gap-1'>
                      <div className='size-2 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {item.planName}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value='vehicles' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Top Brands */}
            <Card>
              <CardHeader>
                <CardTitle>Top Brands</CardTitle>
                <CardDescription>Most popular vehicle brands by listings</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ listingsCount: { label: 'Listings', color: 'oklch(0.65 0.2 145)' } }}
                  className='min-h-[300px] w-full'
                >
                  <BarChart data={data.vehicles.topBrands} layout='vertical' accessibilityLayer>
                    <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                    <XAxis type='number' />
                    <YAxis dataKey='name' type='category' width={100} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey='listingsCount' fill='var(--color-listingsCount)' radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Body Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Body Types</CardTitle>
                <CardDescription>Distribution of vehicle body types</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ count: { label: 'Count', color: 'oklch(0.65 0.18 260)' } }}
                  className='min-h-[300px] w-full'
                >
                  <BarChart data={data.vehicles.bodyTypeDistribution} accessibilityLayer>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                    <XAxis
                      dataKey='status'
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatEnumValue(value)}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey='count' fill='var(--color-count)' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Fuel Type */}
            <Card>
              <CardHeader>
                <CardTitle>Fuel Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {data.vehicles.fuelTypeDistribution.map((item, i) => (
                    <div key={item.status} className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>{formatEnumValue(item.status)}</span>
                        <span className='text-muted-foreground'>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className='h-2 rounded-full bg-muted overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transmission */}
            <Card>
              <CardHeader>
                <CardTitle>Transmission Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {data.vehicles.transmissionDistribution.map((item, i) => (
                    <div key={item.status} className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>{formatEnumValue(item.status)}</span>
                        <span className='text-muted-foreground'>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className='h-2 rounded-full bg-muted overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bookings Analytics Tab */}
        <TabsContent value='bookings' className='space-y-6'>
          {/* Booking Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Avg Rental Duration</p>
                <p className='text-2xl font-bold'>{data.bookingAnalytics.avgRentalDays} days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Instant Booking Rate</p>
                <p className='text-2xl font-bold'>{data.bookingAnalytics.instantBookingRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Completion Rate</p>
                <p className='text-2xl font-bold text-green-600'>{data.bookingAnalytics.completionRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Cancellation Rate</p>
                <p className='text-2xl font-bold text-red-600'>{data.bookingAnalytics.cancellationRate}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Bookings by Day of Week */}
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Day of Week</CardTitle>
              <CardDescription>Which days are most popular for bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ count: { label: 'Bookings', color: 'oklch(0.65 0.18 260)' } }}
                className='min-h-[300px] w-full'
              >
                <BarChart data={data.bookingAnalytics.bookingsByDayOfWeek} accessibilityLayer>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} />
                  <XAxis dataKey='name' tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='count' fill='var(--color-count)' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Analytics Tab */}
        <TabsContent value='pricing' className='space-y-6'>
          {/* Pricing Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Average Price/Day</p>
                <p className='text-2xl font-bold'>{formatCurrency(data.pricing.avgPricePerDay, 'AED')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Median Price/Day</p>
                <p className='text-2xl font-bold'>{formatCurrency(data.pricing.medianPricePerDay, 'AED')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Min Price/Day</p>
                <p className='text-2xl font-bold'>{formatCurrency(data.pricing.minPricePerDay, 'AED')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Max Price/Day</p>
                <p className='text-2xl font-bold'>{formatCurrency(data.pricing.maxPricePerDay, 'AED')}</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Price by Vehicle Class */}
            <Card>
              <CardHeader>
                <CardTitle>Average Price by Vehicle Class</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ avgPrice: { label: 'Avg Price', color: 'oklch(0.65 0.2 145)' } }}
                  className='min-h-[300px] w-full'
                >
                  <BarChart data={data.pricing.avgPriceByClass} layout='vertical' accessibilityLayer>
                    <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                    <XAxis type='number' />
                    <YAxis
                      dataKey='class'
                      type='category'
                      width={100}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => formatEnumValue(v)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey='avgPrice' fill='var(--color-avgPrice)' radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Price Ranges Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Price Range Distribution</CardTitle>
                <CardDescription>Number of listings in each price range (AED/day)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ count: { label: 'Listings', color: 'oklch(0.75 0.16 70)' } }}
                  className='min-h-[300px] w-full'
                >
                  <BarChart data={data.vehicles.priceRanges} accessibilityLayer>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                    <XAxis dataKey='range' tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey='count' fill='var(--color-count)' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value='geographic' className='space-y-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Total Countries</p>
                <p className='text-2xl font-bold'>{data.summary.totalCountries}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Total Cities</p>
                <p className='text-2xl font-bold'>{data.summary.totalCities}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Active Listings</p>
                <p className='text-2xl font-bold'>{data.summary.activeListings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Active Bookings</p>
                <p className='text-2xl font-bold'>{data.summary.activeBookings}</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Countries by Organizations */}
            <Card>
              <CardHeader>
                <CardTitle>Countries by Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                {data.geographic.countriesByOrganizations.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>No data available</p>
                ) : (
                  <div className='space-y-3'>
                    {data.geographic.countriesByOrganizations.map((country, i) => (
                      <div key={country.code} className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <span className='w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold'>
                            {i + 1}
                          </span>
                          <span className='font-medium'>{country.name}</span>
                        </div>
                        <Badge variant='secondary'>{country.organizationsCount} orgs</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cities by Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Cities by Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topPerformers.citiesByListings.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>No data available</p>
                ) : (
                  <div className='space-y-3'>
                    {data.topPerformers.citiesByListings.map((city, i) => (
                      <div key={city.id} className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <span className='w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-bold'>
                            {i + 1}
                          </span>
                          <div>
                            <span className='font-medium'>{city.name}</span>
                            <span className='text-xs text-muted-foreground ml-2'>{city.countryName}</span>
                          </div>
                        </div>
                        <Badge variant='secondary'>{city.listingsCount} listings</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Analytics Tab */}
        <TabsContent value='users' className='space-y-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Total Users</p>
                <p className='text-2xl font-bold'>{data.summary.totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Verified Users</p>
                <p className='text-2xl font-bold text-green-600'>{data.userAnalytics.verifiedUsersCount}</p>
                <p className='text-xs text-muted-foreground'>
                  {data.userAnalytics.verificationRate}% verification rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Users with Bookings</p>
                <p className='text-2xl font-bold'>{data.userAnalytics.usersWithBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Avg Bookings/User</p>
                <p className='text-2xl font-bold'>{data.userAnalytics.avgBookingsPerUser}</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Top Users by Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Users by Bookings</CardTitle>
                <CardDescription>Most active renters in selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topPerformers.usersByBookings.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>No booking data for this period</p>
                ) : (
                  <div className='space-y-3'>
                    {data.topPerformers.usersByBookings.map((user, i) => (
                      <div key={user.id} className='flex items-center gap-3'>
                        <span className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold'>
                          {i + 1}
                        </span>
                        <div className='flex-1'>
                          <p className='font-medium'>{user.name}</p>
                          <p className='text-xs text-muted-foreground'>{user.email}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{user.bookingsCount} bookings</p>
                          <p className='text-xs text-muted-foreground'>{formatCurrency(user.totalSpent, 'AED')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Verification */}
            <Card>
              <CardHeader>
                <CardTitle>User Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Verified', value: data.userAnalytics.verifiedUsersCount },
                          { name: 'Unverified', value: data.userAnalytics.unverifiedUsersCount },
                        ]}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        <Cell fill='oklch(0.65 0.2 145)' />
                        <Cell fill='oklch(0.65 0.18 260)' />
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Performers Tab */}
        <TabsContent value='top' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Top Organizations by Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Organizations by Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topPerformers.organizationsByBookings.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>No booking data for this period</p>
                ) : (
                  <div className='space-y-3'>
                    {data.topPerformers.organizationsByBookings.map((org, i) => (
                      <div key={org.id} className='flex items-center gap-3'>
                        <span className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold'>
                          {i + 1}
                        </span>
                        <div className='flex-1'>
                          <p className='font-medium'>{org.name}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{org.bookingsCount} bookings</p>
                          <p className='text-xs text-muted-foreground'>{formatCurrency(org.revenue, 'AED')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Organizations by Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Top Organizations by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topPerformers.organizationsByRevenue.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>No revenue data for this period</p>
                ) : (
                  <div className='space-y-3'>
                    {data.topPerformers.organizationsByRevenue.map((org, i) => (
                      <div key={org.id} className='flex items-center gap-3'>
                        <span className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold'>
                          {i + 1}
                        </span>
                        <div className='flex-1'>
                          <p className='font-medium'>{org.name}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{formatCurrency(org.revenue, 'AED')}</p>
                          <p className='text-xs text-muted-foreground'>{org.bookingsCount} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Listings by Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Listings by Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topPerformers.listingsByBookings.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>No booking data for this period</p>
                ) : (
                  <div className='space-y-3'>
                    {data.topPerformers.listingsByBookings.map((listing, i) => (
                      <div key={listing.id} className='flex items-center gap-3'>
                        <span className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold'>
                          {i + 1}
                        </span>
                        <div className='flex-1'>
                          <p className='font-medium truncate'>{listing.title}</p>
                          <p className='text-xs text-muted-foreground'>{listing.organizationName}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{listing.bookingsCount} bookings</p>
                          <p className='text-xs text-muted-foreground'>{formatCurrency(listing.revenue, 'AED')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Listings by Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Top Listings by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topPerformers.listingsByRevenue.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-8'>No revenue data for this period</p>
                ) : (
                  <div className='space-y-3'>
                    {data.topPerformers.listingsByRevenue.map((listing, i) => (
                      <div key={listing.id} className='flex items-center gap-3'>
                        <span className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold'>
                          {i + 1}
                        </span>
                        <div className='flex-1'>
                          <p className='font-medium truncate'>{listing.title}</p>
                          <p className='text-xs text-muted-foreground'>{listing.organizationName}</p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>{formatCurrency(listing.revenue, 'AED')}</p>
                          <p className='text-xs text-muted-foreground'>{listing.bookingsCount} bookings</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value='recent' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Recent Organizations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.recentOrganizations.map((org) => (
                    <div key={org.id} className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>{org.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {format(new Date(org.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          org.status === 'APPROVED' ? 'success' : org.status === 'PENDING_APPROVAL' ? 'warning' : 'secondary'
                        }
                      >
                        {formatEnumValue(org.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Listings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.recentListings.map((listing) => (
                    <div key={listing.id} className='flex items-center justify-between'>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium truncate'>{listing.title}</p>
                        <p className='text-xs text-muted-foreground'>{listing.organizationName}</p>
                      </div>
                      <Badge
                        variant={
                          listing.verificationStatus === 'APPROVED'
                            ? 'success'
                            : listing.verificationStatus === 'PENDING'
                              ? 'warning'
                              : 'destructive'
                        }
                      >
                        {formatEnumValue(listing.verificationStatus)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.recentBookings.map((booking) => (
                    <div key={booking.id} className='flex items-center justify-between'>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium'>{booking.referenceCode}</p>
                        <p className='text-xs text-muted-foreground'>
                          {booking.userName} • {booking.listingTitle}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>{formatCurrency(booking.totalPrice, booking.currency)}</p>
                        <Badge
                          variant={
                            booking.status === 'COMPLETED'
                              ? 'success'
                              : booking.status === 'ACTIVE'
                                ? 'info'
                                : 'secondary'
                          }
                          className='text-xs'
                        >
                          {formatEnumValue(booking.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.recentActivity.recentUsers.map((user) => (
                    <div key={user.id} className='flex items-center justify-between'>
                      <div>
                        <p className='font-medium'>{user.name}</p>
                        <p className='text-xs text-muted-foreground'>{user.email}</p>
                      </div>
                      <p className='text-xs text-muted-foreground'>{format(new Date(user.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
