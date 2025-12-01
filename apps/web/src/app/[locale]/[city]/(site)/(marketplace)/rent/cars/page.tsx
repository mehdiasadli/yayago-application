import { Suspense } from 'react';
import ListingsGrid from './_components/listings-grid';
import ListingsFilters from './_components/listings-filters';
import ListingsHeader from './_components/listings-header';
import MobileFiltersSheet from './_components/mobile-filters-sheet';
import { Skeleton } from '@/components/ui/skeleton';

interface RentCarsPageProps {
  params: Promise<{ locale: string; city: string }>;
}

function ListingsLoadingSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='space-y-4 rounded-xl border bg-card p-0 overflow-hidden'>
          <Skeleton className='h-56 w-full' />
          <div className='p-4 space-y-3'>
            <Skeleton className='h-5 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
            <div className='grid grid-cols-4 gap-2'>
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className='h-12 rounded-lg' />
              ))}
            </div>
            <Skeleton className='h-px w-full' />
            <div className='flex justify-between'>
              <Skeleton className='h-10 w-32' />
              <Skeleton className='h-10 w-24' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function RentCarsPage({ params }: RentCarsPageProps) {
  const resolvedParams = await params;

  return (
    <div className='container mx-auto px-4 py-8'>
      <ListingsHeader city={resolvedParams.city} />

      {/* Mobile Filters Button */}
      <div className='flex justify-between items-center mt-6 lg:hidden'>
        <Suspense>
          <MobileFiltersSheet />
        </Suspense>
      </div>

      <div className='flex flex-col lg:flex-row gap-8 mt-8'>
        {/* Filters Sidebar - Hidden on mobile */}
        <aside className='hidden lg:block w-72 shrink-0'>
          <div className='sticky top-4'>
            <Suspense>
              <ListingsFilters />
            </Suspense>
          </div>
        </aside>

        {/* Main Content */}
        <main className='flex-1'>
          <Suspense fallback={<ListingsLoadingSkeleton />}>
            <ListingsGrid cityCode={resolvedParams.city} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
