'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import ListingsFilters from './listings-filters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileFiltersSheetProps {
  activeFilterCount?: number;
}

export default function MobileFiltersSheet({ activeFilterCount = 0 }: MobileFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const closeBlockedRef = useRef(false);

  // Listen for select/popover open events and block sheet close temporarily
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;

      // Check if the click is on or within a select trigger, popover trigger, or their content
      const isSelectTrigger = target.closest('[data-slot="select-trigger"]');
      const isPopoverTrigger = target.closest('[data-slot="popover-trigger"]');
      const isSelectContent = target.closest('[data-slot="select-content"]');
      const isPopoverContent = target.closest('[data-slot="popover-content"]');
      const isCalendar = target.closest('[data-slot="calendar"]');
      const isListbox = target.closest('[role="listbox"]');
      const isOption = target.closest('[role="option"]');

      if (
        isSelectTrigger ||
        isPopoverTrigger ||
        isSelectContent ||
        isPopoverContent ||
        isCalendar ||
        isListbox ||
        isOption
      ) {
        closeBlockedRef.current = true;
        // Unblock after a short delay
        setTimeout(() => {
          closeBlockedRef.current = false;
        }, 300);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [open]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    // If trying to close and close is blocked, don't close
    if (!newOpen && closeBlockedRef.current) {
      return;
    }
    setOpen(newOpen);
  }, []);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className={cn(
          'lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium',
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
          'h-10 px-4 py-2 transition-colors'
        )}
      >
        <SlidersHorizontal className='size-4' />
        Filters
        {activeFilterCount > 0 && (
          <span className='rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold'>
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side='left' className='w-full sm:max-w-md p-0 flex flex-col' showCloseButton={false} inset>
        <div className='flex-1 overflow-y-auto'>
          <ListingsFilters className='border-0 rounded-none shadow-none' onApply={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
