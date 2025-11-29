'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    take: number;
    total: number;
    totalPages: number;
  };
}

interface AsyncSelectComboboxProps<T> {
  // Query configuration
  queryKey: string[];
  queryFn: (search: string, page: number, take: number) => Promise<PaginatedResponse<T>>;

  // Value configuration
  value: string | null;
  onValueChange: (value: string | null) => void;

  // Customization
  getItemValue: (item: T) => string;
  getItemLabel: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;

  // UI configuration
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;

  // Pagination
  itemsPerPage?: number;
}

export default function AsyncSelectCombobox<T>({
  queryKey,
  queryFn,
  value,
  onValueChange,
  getItemValue,
  getItemLabel,
  renderItem,
  placeholder = 'Select an item...',
  emptyText = 'No items found.',
  searchPlaceholder = 'Search...',
  className,
  disabled = false,
  itemsPerPage = 20,
}: AsyncSelectComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, debouncedSearch],
    queryFn: () => queryFn(debouncedSearch, 1, itemsPerPage),
    enabled: open,
  });

  const items = data?.items || [];

  const selectedItem = items.find((item) => getItemValue(item) === value);
  const selectedLabel = selectedItem ? getItemLabel(selectedItem) : placeholder;

  const handleSelect = (itemValue: string) => {
    if (value === itemValue) {
      onValueChange(null);
    } else {
      onValueChange(itemValue);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <span className='truncate'>{selectedLabel}</span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList>
            {isLoading && (
              <div className='flex items-center justify-center py-6'>
                <Loader2Icon className='h-4 w-4 animate-spin' />
              </div>
            )}
            {!isLoading && items.length === 0 && <CommandEmpty>{emptyText}</CommandEmpty>}
            {!isLoading && items.length > 0 && (
              <CommandGroup>
                {items.map((item) => {
                  const itemValue = getItemValue(item);
                  const isSelected = value === itemValue;

                  return (
                    <CommandItem key={itemValue} value={itemValue} onSelect={() => handleSelect(itemValue)}>
                      <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                      {renderItem ? renderItem(item) : getItemLabel(item)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
