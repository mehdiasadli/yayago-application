'use client';

import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  Package,
  DollarSign,
  ListIcon,
  Users,
  Image,
  Video,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddPriceDialog from './add-price-dialog';
import AddFeatureDialog from './add-feature-dialog';
import DeletePriceDialog from './delete-price-dialog';
import DeleteFeatureDialog from './delete-feature-dialog';

interface PlanDetailsContentProps {
  slug: string;
}

function formatPrice(amount: number, currency: string) {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export default function PlanDetailsContent({ slug }: PlanDetailsContentProps) {
  const { data: plan, isLoading } = useQuery(
    orpc.subscriptionPlans.findOne.queryOptions({
      input: { slug },
    })
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-48 w-full' />
      </div>
    );
  }

  if (!plan) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Plan not found</CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Package className='size-5' />
              {plan.name}
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={plan.isActive ? 'success' : 'secondary'} appearance='outline'>
                {plan.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {plan.isPopular && (
                <Badge variant='warning' appearance='outline'>
                  <Star className='size-3 mr-1' />
                  Popular
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Slug</p>
              <p className='font-medium'>{plan.slug}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Stripe Product ID</p>
              <p className='font-mono text-sm'>{plan.stripeProductId}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Created</p>
              <p className='font-medium'>{format(plan.createdAt, 'dd.MM.yyyy HH:mm')}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Sort Order</p>
              <p className='font-medium'>{plan.sortOrder}</p>
            </div>
          </div>
          {plan.description && (
            <div>
              <p className='text-sm text-muted-foreground'>Description</p>
              <p>{plan.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ListIcon className='size-5' />
            Plan Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/50'>
              <ListIcon className='size-5 text-muted-foreground' />
              <div>
                <p className='text-2xl font-bold'>{plan.maxListings}</p>
                <p className='text-xs text-muted-foreground'>Max Listings</p>
              </div>
            </div>
            <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/50'>
              <Star className='size-5 text-muted-foreground' />
              <div>
                <p className='text-2xl font-bold'>{plan.maxFeaturedListings}</p>
                <p className='text-xs text-muted-foreground'>Featured Listings</p>
              </div>
            </div>
            <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/50'>
              <Users className='size-5 text-muted-foreground' />
              <div>
                <p className='text-2xl font-bold'>{plan.maxMembers}</p>
                <p className='text-xs text-muted-foreground'>Team Members</p>
              </div>
            </div>
            <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/50'>
              <Image className='size-5 text-muted-foreground' />
              <div>
                <p className='text-2xl font-bold'>{plan.maxImagesPerListing}</p>
                <p className='text-xs text-muted-foreground'>Images/Listing</p>
              </div>
            </div>
            <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/50'>
              <Video className='size-5 text-muted-foreground' />
              <div>
                <p className='text-2xl font-bold'>{plan.maxVideosPerListing}</p>
                <p className='text-xs text-muted-foreground'>Videos/Listing</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trial */}
      {plan.trialEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='size-5' />
              Trial Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Badge variant='info'>{plan.trialDays} days free trial</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prices */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <DollarSign className='size-5' />
              Prices
            </div>
            <AddPriceDialog planSlug={slug}>
              <Button variant='outline' size='sm'>
                <Plus className='size-4 mr-1' />
                Add Price
              </Button>
            </AddPriceDialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.prices.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>No prices configured</p>
          ) : (
            <div className='space-y-2'>
              {plan.prices.map((price) => (
                <div key={price.id} className='flex items-center justify-between p-3 rounded-lg border'>
                  <div className='flex items-center gap-4'>
                    <div>
                      <p className='font-bold text-lg'>{formatPrice(price.amount, price.currency)}</p>
                      <p className='text-sm text-muted-foreground'>per {price.interval}</p>
                    </div>
                    <Badge variant={price.isActive ? 'success' : 'secondary'} appearance='outline'>
                      {price.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <code className='text-xs bg-muted px-2 py-1 rounded'>{price.stripePriceId}</code>
                    <DeletePriceDialog priceId={price.id} planSlug={slug}>
                      <Button variant='ghost' size='sm'>
                        <Trash2 className='size-4 text-destructive' />
                      </Button>
                    </DeletePriceDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='size-5' />
              Features
            </div>
            <AddFeatureDialog planSlug={slug}>
              <Button variant='outline' size='sm'>
                <Plus className='size-4 mr-1' />
                Add Feature
              </Button>
            </AddFeatureDialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.features.length === 0 ? (
            <p className='text-muted-foreground text-center py-4'>No features configured</p>
          ) : (
            <div className='space-y-2'>
              {plan.features.map((feature) => (
                <div key={feature.id} className='flex items-center justify-between p-3 rounded-lg border'>
                  <div className='flex items-center gap-3'>
                    {feature.isIncluded ? (
                      <CheckCircle className='size-5 text-emerald-500' />
                    ) : (
                      <XCircle className='size-5 text-muted-foreground' />
                    )}
                    <div>
                      <p className={feature.isIncluded ? '' : 'text-muted-foreground'}>{feature.name}</p>
                      {feature.description && (
                        <p className='text-xs text-muted-foreground'>{feature.description}</p>
                      )}
                    </div>
                  </div>
                  <DeleteFeatureDialog featureId={feature.id} planSlug={slug}>
                    <Button variant='ghost' size='sm'>
                      <Trash2 className='size-4 text-destructive' />
                    </Button>
                  </DeleteFeatureDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overage Costs */}
      {(plan.extraListingCost ||
        plan.extraFeaturedListingCost ||
        plan.extraMemberCost ||
        plan.extraImageCost ||
        plan.extraVideoCost) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='size-5' />
              Overage Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
              {plan.extraListingCost && (
                <div className='p-3 rounded-lg bg-muted/50'>
                  <p className='text-sm text-muted-foreground'>Extra Listing</p>
                  <p className='font-medium'>{plan.extraListingCost / 100} AED</p>
                </div>
              )}
              {plan.extraFeaturedListingCost && (
                <div className='p-3 rounded-lg bg-muted/50'>
                  <p className='text-sm text-muted-foreground'>Extra Featured</p>
                  <p className='font-medium'>{plan.extraFeaturedListingCost / 100} AED</p>
                </div>
              )}
              {plan.extraMemberCost && (
                <div className='p-3 rounded-lg bg-muted/50'>
                  <p className='text-sm text-muted-foreground'>Extra Member</p>
                  <p className='font-medium'>{plan.extraMemberCost / 100} AED</p>
                </div>
              )}
              {plan.extraImageCost && (
                <div className='p-3 rounded-lg bg-muted/50'>
                  <p className='text-sm text-muted-foreground'>Extra Image</p>
                  <p className='font-medium'>{plan.extraImageCost / 100} AED</p>
                </div>
              )}
              {plan.extraVideoCost && (
                <div className='p-3 rounded-lg bg-muted/50'>
                  <p className='text-sm text-muted-foreground'>Extra Video</p>
                  <p className='font-medium'>{plan.extraVideoCost / 100} AED</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

