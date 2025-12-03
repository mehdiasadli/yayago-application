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
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Calendar as CalendarLucide,
  Car,
  Eye,
  Star,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  MessageSquare,
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

// Chart color palette
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

export default function AnalyticsContent() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');
  const [preset, setPreset] = useState('30d');

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    orpc.organizations.getAnalytics.queryOptions({
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

  // Chart configs
  const revenueChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'oklch(0.65 0.2 145)' },
    bookings: { label: 'Bookings', color: 'oklch(0.65 0.18 260)' },
  };

  const bookingsChartConfig: ChartConfig = {
    bookings: { label: 'Bookings', color: 'oklch(0.65 0.2 295)' },
  };

  return (
    <div className='space-y-6'>
      {/* Header Controls */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
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

      {/* Revenue Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Revenue'
          value={formatCurrency(data.summary.totalRevenue, 'AED')}
          growth={data.growth.revenueGrowth}
          icon={DollarSign}
        />
        <StatCard
          title='Pending Revenue'
          value={formatCurrency(data.summary.pendingRevenue, 'AED')}
          icon={Clock}
          description='From active bookings'
        />
        <StatCard
          title='Avg Booking Value'
          value={formatCurrency(data.summary.avgBookingValue, 'AED')}
          icon={DollarSign}
        />
        <StatCard
          title='Total Bookings'
          value={data.summary.totalBookings.toLocaleString()}
          growth={data.growth.bookingsGrowth}
          icon={CalendarLucide}
        />
      </div>

      {/* Fleet & Engagement Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Active Listings'
          value={data.summary.activeListings.toLocaleString()}
          icon={Car}
          description={`of ${data.summary.totalListings} total`}
        />
        <StatCard title='Total Views' value={data.summary.totalViews.toLocaleString()} icon={Eye} />
        <StatCard
          title='Average Rating'
          value={data.summary.avgRating.toFixed(1)}
          icon={Star}
          description={`from ${data.summary.totalReviews} reviews`}
        />
        <StatCard
          title='Unique Customers'
          value={data.summary.uniqueCustomers.toLocaleString()}
          growth={data.growth.customersGrowth}
          icon={Users}
          description={`${data.summary.repeatCustomers} repeat`}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue='revenue' className='space-y-4'>
        <TabsList className='flex-wrap h-auto gap-1'>
          <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          <TabsTrigger value='bookings'>Bookings</TabsTrigger>
          <TabsTrigger value='listings'>Listings</TabsTrigger>
          <TabsTrigger value='reviews'>Reviews</TabsTrigger>
          <TabsTrigger value='customers'>Customers</TabsTrigger>
          <TabsTrigger value='vehicles'>Vehicles</TabsTrigger>
          <TabsTrigger value='recent'>Recent</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value='revenue' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Revenue and booking count by period</CardDescription>
            </CardHeader>
            <CardContent>
              {data.timeSeries.revenue.length === 0 ? (
                <div className='h-[300px] flex items-center justify-center text-muted-foreground'>
                  No revenue data for the selected period
                </div>
              ) : (
                <ChartContainer config={revenueChartConfig} className='min-h-[300px] w-full'>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
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

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Booking Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Booking Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='h-[200px]'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={data.bookingAnalytics.statusDistribution}
                        dataKey='count'
                        nameKey='status'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        label={({ name, percent }) => `${formatEnumValue(name)} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.bookingAnalytics.statusDistribution.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className='flex flex-wrap gap-2 mt-2 justify-center'>
                  {data.bookingAnalytics.statusDistribution.map((item, i) => (
                    <Badge key={item.status} variant='outline' className='gap-1'>
                      <div className='size-2 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {formatEnumValue(item.status)}: {item.count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bookings by Day of Week */}
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Day of Week</CardTitle>
                <CardDescription>Which days are most popular</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ count: { label: 'Bookings', color: 'oklch(0.65 0.18 260)' } }}
                  className='min-h-[200px] w-full'
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
          </div>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value='listings' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Listing Performance</CardTitle>
              <CardDescription>Your fleet's performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {data.listingPerformance.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>No listings to display</p>
              ) : (
                <div className='space-y-4'>
                  {data.listingPerformance.slice(0, 10).map((listing) => (
                    <div key={listing.id} className='flex items-center gap-4 p-3 rounded-lg border'>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium truncate'>{listing.title}</p>
                        <div className='flex items-center gap-3 text-xs text-muted-foreground mt-1'>
                          <span className='flex items-center gap-1'>
                            <Eye className='size-3' /> {listing.viewCount} views
                          </span>
                          <span className='flex items-center gap-1'>
                            <CalendarLucide className='size-3' /> {listing.bookingsCount} bookings
                          </span>
                          {listing.avgRating && (
                            <span className='flex items-center gap-1'>
                              <Star className='size-3 text-yellow-500' /> {listing.avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>{formatCurrency(listing.revenue, 'AED')}</p>
                        <p className='text-xs text-muted-foreground'>{listing.conversionRate}% conversion</p>
                      </div>
                      <div className='flex gap-1'>
                        <Badge variant={listing.status === 'AVAILABLE' ? 'success' : 'secondary'} className='text-xs'>
                          {formatEnumValue(listing.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value='reviews' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Rating Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>
                  {data.reviewsAnalytics.totalReviews} total reviews • {data.reviewsAnalytics.avgRating} avg
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.reviewsAnalytics.ratingDistribution.map((item) => (
                    <div key={item.rating} className='flex items-center gap-3'>
                      <div className='flex items-center gap-1 w-16'>
                        <Star className='size-4 text-yellow-500' />
                        <span className='font-medium'>{item.rating}</span>
                      </div>
                      <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
                        <div className='h-full rounded-full bg-yellow-500' style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className='text-sm text-muted-foreground w-16 text-right'>
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Feedback</CardTitle>
                <CardDescription>What customers are saying (% of reviews)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-3'>
                  {Object.entries(data.reviewsAnalytics.tagStats)
                    .filter(([_, value]) => value > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 8)
                    .map(([key, value]) => (
                      <div key={key} className='flex items-center gap-2 p-2 rounded-lg bg-muted/50'>
                        <ThumbsUp className='size-4 text-green-500' />
                        <span className='text-sm flex-1'>
                          {key
                            .replace(/^was|^had|^would/, '')
                            .replace(/([A-Z])/g, ' $1')
                            .trim()}
                        </span>
                        <Badge variant='secondary'>{value}%</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {data.reviewsAnalytics.recentReviews.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>No reviews yet</p>
              ) : (
                <div className='space-y-4'>
                  {data.reviewsAnalytics.recentReviews.map((review) => (
                    <div key={review.id} className='p-4 rounded-lg border'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <p className='font-medium'>{review.userName}</p>
                          <p className='text-xs text-muted-foreground'>{review.listingTitle}</p>
                        </div>
                        <div className='flex items-center gap-1'>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className='text-sm text-muted-foreground'>{review.comment}</p>}
                      <p className='text-xs text-muted-foreground mt-2'>
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value='customers' className='space-y-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Unique Customers</p>
                <p className='text-2xl font-bold'>{data.summary.uniqueCustomers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Repeat Customers</p>
                <p className='text-2xl font-bold'>{data.summary.repeatCustomers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Repeat Rate</p>
                <p className='text-2xl font-bold'>
                  {data.summary.uniqueCustomers > 0
                    ? Math.round((data.summary.repeatCustomers / data.summary.uniqueCustomers) * 100)
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Avg Bookings/Customer</p>
                <p className='text-2xl font-bold'>
                  {data.summary.uniqueCustomers > 0
                    ? (data.summary.totalBookings / data.summary.uniqueCustomers).toFixed(1)
                    : 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Your most valuable customers</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPerformers.topCustomers.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>No customer data yet</p>
              ) : (
                <div className='space-y-3'>
                  {data.topPerformers.topCustomers.map((customer, i) => (
                    <div key={customer.id} className='flex items-center gap-4 p-3 rounded-lg border'>
                      <span className='w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold'>
                        {i + 1}
                      </span>
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium truncate'>{customer.name}</p>
                        <p className='text-xs text-muted-foreground truncate'>{customer.email}</p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>{customer.bookingsCount} bookings</p>
                        <p className='text-sm text-muted-foreground'>{formatCurrency(customer.totalSpent, 'AED')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value='vehicles' className='space-y-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Average Price/Day</p>
                <p className='text-2xl font-bold'>{formatCurrency(data.vehicleAnalytics.avgPricePerDay, 'AED')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Min Price/Day</p>
                <p className='text-2xl font-bold'>{formatCurrency(data.vehicleAnalytics.minPricePerDay, 'AED')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Max Price/Day</p>
                <p className='text-2xl font-bold'>{formatCurrency(data.vehicleAnalytics.maxPricePerDay, 'AED')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <p className='text-sm text-muted-foreground'>Total Listings</p>
                <p className='text-2xl font-bold'>{data.summary.totalListings}</p>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Body Type */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Body Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.vehicleAnalytics.bodyTypeDistribution.map((item, i) => (
                    <div key={item.status} className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span>{formatEnumValue(item.status)}</span>
                        <span className='text-muted-foreground'>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className='h-2 rounded-full bg-muted overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Class */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Vehicle Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.vehicleAnalytics.classDistribution.map((item, i) => (
                    <div key={item.status} className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span>{formatEnumValue(item.status)}</span>
                        <span className='text-muted-foreground'>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className='h-2 rounded-full bg-muted overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fuel Type */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Fuel Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {data.vehicleAnalytics.fuelTypeDistribution.map((item, i) => (
                    <div key={item.status} className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span>{formatEnumValue(item.status)}</span>
                        <span className='text-muted-foreground'>
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className='h-2 rounded-full bg-muted overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{ width: `${item.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value='recent' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentActivity.recentBookings.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-8'>No recent bookings</p>
              ) : (
                <div className='space-y-3'>
                  {data.recentActivity.recentBookings.map((booking) => (
                    <div key={booking.id} className='flex items-center gap-4 p-3 rounded-lg border'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium'>{booking.referenceCode}</p>
                          <Badge
                            variant={
                              booking.status === 'COMPLETED'
                                ? 'success'
                                : booking.status === 'ACTIVE'
                                  ? 'info'
                                  : booking.status === 'CANCELLED'
                                    ? 'destructive'
                                    : 'secondary'
                            }
                          >
                            {formatEnumValue(booking.status)}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {booking.userName} • {booking.listingTitle}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {format(new Date(booking.startDate), 'MMM d')} -{' '}
                          {format(new Date(booking.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-medium'>{formatCurrency(booking.totalPrice, booking.currency)}</p>
                        <Badge
                          variant={
                            booking.paymentStatus === 'PAID'
                              ? 'success'
                              : booking.paymentStatus === 'PENDING'
                                ? 'warning'
                                : 'secondary'
                          }
                          className='text-xs'
                        >
                          {formatEnumValue(booking.paymentStatus)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
