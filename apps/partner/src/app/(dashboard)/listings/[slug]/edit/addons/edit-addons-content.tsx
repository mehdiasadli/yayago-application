'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Puzzle, CheckCircle, DollarSign, Star, Package, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { FindOneListingOutputType } from '@yayago-app/validators';
import AddAddonDialog from './add-addon-dialog';
import EditAddonDialog from './edit-addon-dialog';

interface EditAddonsContentProps {
  listing: FindOneListingOutputType;
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

export default function EditAddonsContent({ listing }: EditAddonsContentProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any>(null);

  // Fetch configured listing addons
  const { data: configuredAddons, isLoading: isLoadingConfigured } = useQuery(
    orpc.addons.listListingAddons.queryOptions({
      input: { listingId: listing.id, page: 1, take: 100 },
    })
  );

  // Fetch available base addons
  const { data: availableAddons, isLoading: isLoadingAvailable } = useQuery(
    orpc.addons.list.queryOptions({
      input: { isActive: true, page: 1, take: 100 },
    })
  );

  // Delete mutation
  const { mutate: deleteAddon, isPending: isDeleting } = useMutation(
    orpc.addons.deleteListingAddon.mutationOptions({
      onSuccess: () => {
        toast.success('Addon removed');
        queryClient.invalidateQueries({
          queryKey: orpc.addons.listListingAddons.queryKey({ input: { listingId: listing.id, page: 1, take: 100 } }),
        });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove addon');
      },
    })
  );

  // Toggle active status
  const { mutate: toggleActive, isPending: isToggling } = useMutation(
    orpc.addons.updateListingAddon.mutationOptions({
      onSuccess: () => {
        toast.success('Addon updated');
        queryClient.invalidateQueries({
          queryKey: orpc.addons.listListingAddons.queryKey({ input: { listingId: listing.id, page: 1, take: 100 } }),
        });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update addon');
      },
    })
  );

  // Filter out already configured addons from available list
  const configuredAddonIds = new Set(configuredAddons?.items.map((la) => la.addonId) || []);
  const unconfiguredAddons = availableAddons?.items.filter((addon) => !configuredAddonIds.has(addon.id)) || [];

  const isLoading = isLoadingConfigured || isLoadingAvailable;

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-48' />
        <Skeleton className='h-48' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Configured Addons */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Puzzle className='size-5' />
              Configured Addons ({configuredAddons?.items.length || 0})
            </CardTitle>
            <CardDescription>Extras and add-ons available for renters on this listing</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} disabled={unconfiguredAddons.length === 0}>
            <Plus className='size-4 mr-2' />
            Add Addon
          </Button>
        </CardHeader>
        <CardContent>
          {!configuredAddons?.items.length ? (
            <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
              <Package className='size-16 mb-4 opacity-50' />
              <p className='text-lg font-medium'>No addons configured</p>
              <p className='text-sm'>Add extras like GPS, child seats, or insurance to offer to renters</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {configuredAddons.items.map((listingAddon) => (
                <div
                  key={listingAddon.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <div className='flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <Puzzle className='size-6' />
                    </div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <h3 className='font-medium'>
                          {getLocalizedValue(listingAddon.customName) || getLocalizedValue(listingAddon.addon.name)}
                        </h3>
                        {listingAddon.isIncludedFree && (
                          <Badge variant='success' className='text-xs'>
                            Free
                          </Badge>
                        )}
                        {listingAddon.isRecommended && (
                          <Badge variant='warning' className='text-xs'>
                            <Star className='size-3 mr-1' />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Badge variant='outline' className='text-xs'>
                          {formatCategory(listingAddon.addon.category)}
                        </Badge>
                        <span>•</span>
                        <span>
                          {listingAddon.isIncludedFree
                            ? 'Included'
                            : `${listingAddon.price} ${listingAddon.currency}/${listingAddon.addon.billingType === 'PER_DAY' ? 'day' : 'fixed'}`}
                        </span>
                        {listingAddon.discountAmount && listingAddon.discountAmount > 0 && (
                          <>
                            <span>•</span>
                            <span className='text-green-600'>
                              {listingAddon.discountType === 'PERCENTAGE'
                                ? `${listingAddon.discountAmount}% off`
                                : `${listingAddon.discountAmount} ${listingAddon.currency} off`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-4'>
                    {/* Active Toggle */}
                    <div className='flex items-center gap-2'>
                      <Switch
                        checked={listingAddon.isActive}
                        onCheckedChange={(checked) =>
                          toggleActive({ listingAddonId: listingAddon.id, isActive: checked })
                        }
                        disabled={isToggling}
                      />
                      <Label className='text-sm text-muted-foreground'>
                        {listingAddon.isActive ? 'Active' : 'Inactive'}
                      </Label>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm' onClick={() => setEditingAddon(listingAddon)}>
                        <Edit2 className='size-4' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => deleteAddon({ listingAddonId: listingAddon.id })}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className='size-4 animate-spin' /> : <Trash2 className='size-4' />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Addons to Add */}
      {unconfiguredAddons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='size-5 text-muted-foreground' />
              Available Addons ({unconfiguredAddons.length})
            </CardTitle>
            <CardDescription>Platform addons you can configure for this listing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {unconfiguredAddons.slice(0, 6).map((addon) => (
                <div
                  key={addon.id}
                  className='flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer'
                  onClick={() => {
                    setIsAddDialogOpen(true);
                  }}
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                      <Puzzle className='size-5' />
                    </div>
                    <div>
                      <h4 className='font-medium text-sm'>{getLocalizedValue(addon.name)}</h4>
                      <p className='text-xs text-muted-foreground'>{formatCategory(addon.category)}</p>
                    </div>
                  </div>
                  {addon.suggestedPrice && (
                    <div className='text-right'>
                      <p className='text-sm font-medium'>{addon.suggestedPrice} AED</p>
                      <p className='text-xs text-muted-foreground'>suggested</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {unconfiguredAddons.length > 6 && (
              <p className='text-sm text-muted-foreground mt-4 text-center'>
                And {unconfiguredAddons.length - 6} more addons available...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Addon Dialog */}
      <AddAddonDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        listingId={listing.id}
        availableAddons={unconfiguredAddons}
      />

      {/* Edit Addon Dialog */}
      {editingAddon && (
        <EditAddonDialog
          open={!!editingAddon}
          onOpenChange={(open) => !open && setEditingAddon(null)}
          listingAddon={editingAddon}
        />
      )}
    </div>
  );
}
