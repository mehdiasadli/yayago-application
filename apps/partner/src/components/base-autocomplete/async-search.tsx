'use client';

import * as React from 'react';
import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
} from '@/components/ui/base-autocomplete';
import { Label } from '@/components/ui/base-label';
import { LoaderCircle } from 'lucide-react';

interface AsyncSearchProps<T> {
  searchValue: string;
  setSearchValue: (value: string) => void;
  isLoading: boolean;
  items: T[];
  error?: Error | null;
  placeholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  foundMessage?: string;
  label?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemToStringValue?: (item: T) => string;
  onItemClick: (item: T) => void;
  value: T | null;
}

export default function AsyncSearch<T>({
  searchValue,
  setSearchValue,
  isLoading,
  items,
  error,
  placeholder = 'Search...',
  emptyMessage = 'No items found',
  loadingMessage = 'Searching...',
  errorMessage = 'Failed to fetch items. Please try again.',
  foundMessage = 'Found {count} items',
  label = 'Search',
  renderItem,
  itemToStringValue,
  onItemClick,
  value,
}: AsyncSearchProps<T>) {
  const [searchResults, setSearchResults] = React.useState<T[]>([]);

  let status: React.ReactNode = '';

  if (isLoading) {
    status = (
      <div className='flex items-center gap-2'>
        <LoaderCircle className='size-4 animate-spin' aria-hidden />
        {loadingMessage}
      </div>
    );
  } else if (error) {
    status = error instanceof Error ? error.message : errorMessage;
  } else if (searchResults.length === 0 && searchValue) {
    status = emptyMessage;
  } else if (searchResults.length > 0) {
    status = foundMessage?.replace('{count}', searchResults.length.toString()) ?? '';
  } else if (!searchValue) {
    status = placeholder;
  }

  const shouldRenderPopup = searchValue !== '';

  React.useEffect(() => {
    if (items.length > 0) {
      setSearchResults(items);
    }
  }, [items]);

  return (
    <div className='w-full max-w-xs'>
      <Autocomplete
        items={searchResults}
        value={searchValue}
        onValueChange={setSearchValue}
        itemToStringValue={(item: any) => itemToStringValue?.(item) ?? ''}
        filter={null}
      >
        <Label className='flex flex-col gap-2'>
          <span className='text-sm font-medium'>{label}</span>
          <AutocompleteControl>
            <AutocompleteInput placeholder='e.g. John Smith, React, San Francisco' />
            {searchValue && <AutocompleteClear />}
          </AutocompleteControl>
        </Label>
        {shouldRenderPopup && (
          <AutocompleteContent>
            <AutocompleteStatus>{status}</AutocompleteStatus>
            <AutocompleteList>
              {(item: T, index: number) => (
                <AutocompleteItem key={index} value={item} className='rounded-lg' onClick={() => onItemClick(item)}>
                  {renderItem(item, index)}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        )}
      </Autocomplete>
    </div>
  );
}
