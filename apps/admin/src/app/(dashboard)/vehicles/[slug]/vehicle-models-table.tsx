'use client';

import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EditIcon, TrashIcon, Car } from 'lucide-react';
import Link from 'next/link';
import DeleteVehicleModelDialog from './delete-vehicle-model-dialog';

interface VehicleModelsTableProps {
  brandSlug: string;
}

export default function VehicleModelsTable({ brandSlug }: VehicleModelsTableProps) {
  const { data, isLoading } = useQuery(
    orpc.vehicleModels.list.queryOptions({
      input: {
        brandSlug,
        page: 1,
        take: 50,
      },
    })
  );

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className='py-8 text-center'>
        <Car className='size-12 mx-auto text-muted-foreground mb-4' />
        <p className='text-muted-foreground'>No models found for this brand</p>
        <p className='text-sm text-muted-foreground'>Add a model to get started</p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {data.items.map((model) => (
        <div key={model.slug} className='flex items-center justify-between p-4 rounded-lg border'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded bg-muted flex items-center justify-center'>
              <Car className='size-5 text-muted-foreground' />
            </div>
            <div>
              <h4 className='font-medium'>{model.name}</h4>
              <p className='text-xs text-muted-foreground'>{model.slug}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href={`/vehicles/${brandSlug}/models/${model.slug}/edit`}>
                <EditIcon className='size-4' />
              </Link>
            </Button>
            <DeleteVehicleModelDialog slug={model.slug} name={model.name} brandSlug={brandSlug}>
              <Button variant='destructive' size='sm'>
                <TrashIcon className='size-4' />
              </Button>
            </DeleteVehicleModelDialog>
          </div>
        </div>
      ))}

      {data.pagination.totalPages > 1 && (
        <p className='text-sm text-muted-foreground text-center pt-2'>
          Showing {data.items.length} of {data.pagination.total} models
        </p>
      )}
    </div>
  );
}
