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
  Settings,
  FileText,
  Car,
  Shield,
  Clock,
  Hash,
  Globe,
  CheckCircle,
  XCircle,
  Star,
  Sparkles,
} from 'lucide-react';

interface AddonDetailsContentProps {
  slug: string;
}

function getLocalizedValue(value: Record<string, string> | null | undefined, locale = 'en'): string {
  if (!value) return '';
  return value[locale] || value['en'] || Object.values(value)[0] || '';
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export default function AddonDetailsContent({ slug }: AddonDetailsContentProps) {
  const { data: addon, isLoading } = useQuery(
    orpc.addons.get.queryOptions({
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

  if (!addon) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Addon not found</CardContent>
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
              {getLocalizedValue(addon.name)}
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={addon.isActive ? 'success' : 'secondary'} appearance='outline'>
                {addon.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {addon.isFeatured && (
                <Badge variant='warning' appearance='outline'>
                  <Star className='size-3 mr-1' />
                  Featured
                </Badge>
              )}
              {addon.isPopular && (
                <Badge variant='info' appearance='outline'>
                  <Sparkles className='size-3 mr-1' />
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
              <p className='font-medium'>{addon.slug}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Category</p>
              <Badge variant='outline'>{formatCategory(addon.category)}</Badge>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Created</p>
              <p className='font-medium'>{format(addon.createdAt, 'dd.MM.yyyy HH:mm')}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Display Order</p>
              <p className='font-medium'>{addon.displayOrder}</p>
            </div>
          </div>
          {addon.description && (
            <div>
              <p className='text-sm text-muted-foreground'>Description</p>
              <p>{getLocalizedValue(addon.description)}</p>
            </div>
          )}
          {addon.shortName && (
            <div>
              <p className='text-sm text-muted-foreground'>Short Name</p>
              <p>{getLocalizedValue(addon.shortName)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='size-5' />
            Pricing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Input Type</p>
              <p className='font-bold'>{addon.inputType}</p>
            </div>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Billing Type</p>
              <p className='font-bold'>{addon.billingType}</p>
            </div>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Suggested Price</p>
              <p className='font-bold'>{addon.suggestedPrice ?? 'Not set'} AED</p>
            </div>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Max Price</p>
              <p className='font-bold'>{addon.maxPrice ?? 'No limit'} AED</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quantity Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Hash className='size-5' />
            Quantity Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Min Quantity</p>
              <p className='font-bold text-2xl'>{addon.minQuantity}</p>
            </div>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Max Quantity</p>
              <p className='font-bold text-2xl'>{addon.maxQuantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements & Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='size-5' />
            Requirements & Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Min Rental Days</p>
              <p className='font-bold'>{addon.minRentalDays ?? 'No minimum'}</p>
            </div>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Max Rental Days</p>
              <p className='font-bold'>{addon.maxRentalDays ?? 'No maximum'}</p>
            </div>
            <div className='p-3 rounded-lg bg-muted/50'>
              <p className='text-sm text-muted-foreground'>Min Driver Age</p>
              <p className='font-bold'>{addon.minDriverAge ?? 'No requirement'}</p>
            </div>
            <div className='p-3 rounded-lg bg-muted/50 flex items-center gap-2'>
              {addon.requiresApproval ? (
                <CheckCircle className='size-5 text-amber-500' />
              ) : (
                <XCircle className='size-5 text-muted-foreground' />
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Requires Approval</p>
                <p className='font-bold'>{addon.requiresApproval ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Restrictions */}
          {(addon.allowedVehicleClasses || addon.allowedVehicleBodyTypes) && (
            <div className='mt-4 space-y-2'>
              {addon.allowedVehicleClasses && addon.allowedVehicleClasses.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Allowed Vehicle Classes</p>
                  <div className='flex flex-wrap gap-1'>
                    {addon.allowedVehicleClasses.map((cls) => (
                      <Badge key={cls} variant='outline'>
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {addon.allowedVehicleBodyTypes && addon.allowedVehicleBodyTypes.length > 0 && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Allowed Body Types</p>
                  <div className='flex flex-wrap gap-1'>
                    {addon.allowedVehicleBodyTypes.map((type) => (
                      <Badge key={type} variant='outline'>
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='size-5' />
            Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            <div className='p-3 rounded-lg bg-muted/50 flex items-center gap-2'>
              {addon.isRefundable ? (
                <CheckCircle className='size-5 text-emerald-500' />
              ) : (
                <XCircle className='size-5 text-red-500' />
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Refundable</p>
                <p className='font-bold'>{addon.isRefundable ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className='p-3 rounded-lg bg-muted/50 flex items-center gap-2'>
              {addon.isTaxExempt ? (
                <CheckCircle className='size-5 text-emerald-500' />
              ) : (
                <XCircle className='size-5 text-muted-foreground' />
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Tax Exempt</p>
                <p className='font-bold'>{addon.isTaxExempt ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {addon.termsAndConditions && (
            <div className='mt-4'>
              <p className='text-sm text-muted-foreground mb-1'>Terms & Conditions</p>
              <p className='text-sm'>{getLocalizedValue(addon.termsAndConditions)}</p>
            </div>
          )}

          {addon.refundPolicy && (
            <div className='mt-4'>
              <p className='text-sm text-muted-foreground mb-1'>Refund Policy</p>
              <p className='text-sm'>{getLocalizedValue(addon.refundPolicy)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selection Options (if SELECTION type) */}
      {addon.inputType === 'SELECTION' && addon.selectionOptions && addon.selectionOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='size-5' />
              Selection Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {addon.selectionOptions.map((option: any, index: number) => (
                <div key={index} className='flex items-center justify-between p-3 rounded-lg border'>
                  <div>
                    <p className='font-medium'>{getLocalizedValue(option.name)}</p>
                    {option.description && (
                      <p className='text-sm text-muted-foreground'>{getLocalizedValue(option.description)}</p>
                    )}
                  </div>
                  <Badge variant='outline'>×{option.priceMultiplier}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Globe className='size-5' />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {addon.iconKey && (
              <div className='p-3 rounded-lg bg-muted/50'>
                <p className='text-sm text-muted-foreground'>Icon Key</p>
                <p className='font-mono text-sm'>{addon.iconKey}</p>
              </div>
            )}
            {addon.imageUrl && (
              <div className='p-3 rounded-lg bg-muted/50'>
                <p className='text-sm text-muted-foreground'>Image</p>
                <img src={addon.imageUrl} alt={getLocalizedValue(addon.name)} className='w-16 h-16 object-cover rounded mt-1' />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

