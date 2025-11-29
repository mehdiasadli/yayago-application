'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Car,
  CalendarCheck,
  Star,
  Eye,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DashboardContent() {
  const { data: usage, isLoading: usageLoading } = useQuery(orpc.listings.getSubscriptionUsage.queryOptions());

  const { data: listings, isLoading: listingsLoading } = useQuery(
    orpc.listings.listOwn.queryOptions({
      input: { page: 1, take: 5 },
    })
  );

  return (
    <div className='space-y-6'>
      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Listings</CardTitle>
            <Car className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>{usage?.usage.listings.current || 0}</div>
                <p className='text-xs text-muted-foreground'>of {usage?.usage.listings.max || 0} available</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Bookings</CardTitle>
            <CalendarCheck className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Views</CardTitle>
            <Eye className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>
                  {listings?.items.reduce((acc, l) => acc + l.viewCount, 0) || 0}
                </div>
                <p className='text-xs text-muted-foreground'>Across all listings</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Rating</CardTitle>
            <Star className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>
                  {listings?.items.filter((l) => l.averageRating).length
                    ? (
                        listings.items.reduce((acc, l) => acc + (l.averageRating || 0), 0) /
                        listings.items.filter((l) => l.averageRating).length
                      ).toFixed(1)
                    : '—'}
                </div>
                <p className='text-xs text-muted-foreground'>
                  {listings?.items.filter((l) => l.averageRating).length || 0} reviewed
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Usage */}
      {usage && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Subscription Usage</CardTitle>
                <CardDescription>{usage.plan.name} Plan</CardDescription>
              </div>
              <Badge variant={usage.subscription.isTrialing ? 'info' : 'success'}>
                {usage.subscription.isTrialing ? 'Trial' : 'Active'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span>Listings</span>
                  <span className='text-muted-foreground'>
                    {usage.usage.listings.current} / {usage.usage.listings.max}
                  </span>
                </div>
                <Progress
                  value={(usage.usage.listings.current / usage.usage.listings.max) * 100}
                  className='h-2'
                />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span>Featured</span>
                  <span className='text-muted-foreground'>
                    {usage.usage.featuredListings.current} / {usage.usage.featuredListings.max}
                  </span>
                </div>
                <Progress
                  value={(usage.usage.featuredListings.current / usage.usage.featuredListings.max) * 100}
                  className='h-2'
                />
              </div>
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span>Images/Listing</span>
                  <span className='text-muted-foreground'>Max {usage.usage.images.maxPerListing}</span>
                </div>
                <div className='h-2 bg-muted rounded-full' />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Listings & Quick Actions */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Recent Listings */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Recent Listings</CardTitle>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/listings'>
                  View all
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {listingsLoading ? (
              <div className='space-y-4'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-4'>
                    <Skeleton className='size-12 rounded-md' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-48' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings?.items.length ? (
              <div className='space-y-4'>
                {listings.items.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.slug}`}
                    className='flex items-center gap-4 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors'
                  >
                    <div className='size-12 rounded-md bg-muted flex items-center justify-center'>
                      {listing.primaryMedia?.url ? (
                        <img
                          src={listing.primaryMedia.url}
                          alt={listing.title}
                          className='size-12 rounded-md object-cover'
                        />
                      ) : (
                        <Car className='size-5 text-muted-foreground' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium truncate'>{listing.title}</p>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        {listing.pricing && (
                          <span>{formatCurrency(listing.pricing.pricePerDay, listing.pricing.currency)}/day</span>
                        )}
                        <span>•</span>
                        <span>{listing.viewCount} views</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {listing.status === 'AVAILABLE' && listing.verificationStatus === 'APPROVED' ? (
                        <Badge variant='success'>Live</Badge>
                      ) : listing.status === 'PENDING_VERIFICATION' ? (
                        <Badge variant='warning'>Pending</Badge>
                      ) : listing.verificationStatus === 'REJECTED' ? (
                        <Badge variant='destructive'>Rejected</Badge>
                      ) : (
                        <Badge variant='secondary'>Draft</Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Car className='size-12 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground mb-4'>No listings yet</p>
                <Button asChild>
                  <Link href='/listings/create'>
                    <Plus className='size-4' />
                    Create your first listing
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Button className='w-full justify-start' variant='outline' asChild>
              <Link href='/listings/create'>
                <Plus className='size-4' />
                Add New Listing
              </Link>
            </Button>
            <Button className='w-full justify-start' variant='outline' asChild>
              <Link href='/bookings'>
                <CalendarCheck className='size-4' />
                View Bookings
              </Link>
            </Button>
            <Button className='w-full justify-start' variant='outline' asChild>
              <Link href='/reviews'>
                <Star className='size-4' />
                Manage Reviews
              </Link>
            </Button>
            <Button className='w-full justify-start' variant='outline' asChild>
              <Link href='/settings'>
                <TrendingUp className='size-4' />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-full bg-green-100 dark:bg-green-900/30'>
                <CheckCircle className='size-6 text-green-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {listings?.items.filter((l) => l.status === 'AVAILABLE' && l.verificationStatus === 'APPROVED').length || 0}
                </p>
                <p className='text-sm text-muted-foreground'>Live Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30'>
                <Clock className='size-6 text-yellow-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {listings?.items.filter((l) => l.verificationStatus === 'PENDING').length || 0}
                </p>
                <p className='text-sm text-muted-foreground'>Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-full bg-red-100 dark:bg-red-900/30'>
                <AlertCircle className='size-6 text-red-600' />
              </div>
              <div>
                <p className='text-2xl font-bold'>
                  {listings?.items.filter((l) => l.verificationStatus === 'REJECTED').length || 0}
                </p>
                <p className='text-sm text-muted-foreground'>Need Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

