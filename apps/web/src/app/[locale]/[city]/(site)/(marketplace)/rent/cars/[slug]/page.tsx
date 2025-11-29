import { Suspense } from 'react';
import ListingDetails from './_components/listing-details';
import { Skeleton } from '@/components/ui/skeleton';

interface ListingPageProps {
  params: Promise<{ locale: string; city: string; slug: string }>;
}

function ListingDetailsSkeleton() {
  return (
    <div className='min-h-screen bg-linear-to-b from-muted/30 to-background'>
      <div className='container mx-auto px-4 py-8'>
        <Skeleton className='h-4 w-48 mb-6' />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-8'>
            <Skeleton className='aspect-video rounded-2xl' />

            <div className='flex gap-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='w-24 h-16 rounded-lg' />
              ))}
            </div>

            <div className='space-y-4'>
              <Skeleton className='h-10 w-3/4' />
              <Skeleton className='h-6 w-1/2' />
            </div>

            <div className='border rounded-xl p-6'>
              <div className='grid grid-cols-4 gap-6'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <Skeleton className='size-12 rounded-xl' />
                    <div className='space-y-2'>
                      <Skeleton className='h-3 w-12' />
                      <Skeleton className='h-5 w-16' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='lg:col-span-1'>
            <div className='border rounded-xl p-6 space-y-4'>
              <Skeleton className='h-12 w-32' />
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-12 w-full' />
              <Skeleton className='h-14 w-full' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ListingDetailsSkeleton />}>
      <ListingDetails slug={slug} />
    </Suspense>
  );
}
