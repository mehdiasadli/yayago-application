'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import ListingsFilters from './listings-filters';
import { cn } from '@/lib/utils';

interface MobileFiltersSheetProps {
  activeFilterCount?: number;
}

export default function MobileFiltersSheet({ activeFilterCount = 0 }: MobileFiltersSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          'lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
          'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
          'h-9 px-4 py-2'
        )}
      >
        <SlidersHorizontal className='size-4' />
        Filters
        {activeFilterCount > 0 && (
          <span className='rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs'>
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side='left' className='w-full sm:max-w-md overflow-y-auto'>
        <SheetHeader className='mb-4'>
          <SheetTitle>Filter Vehicles</SheetTitle>
        </SheetHeader>
        <ListingsFilters className='border-0 shadow-none' onApply={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
