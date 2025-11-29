'use client';

import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompleteStatus,
} from '@/components/ui/autocomplete';
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

interface AsyncComboboxProps<T> extends Omit<React.ComponentProps<typeof Autocomplete>, 'itemToStringValue'> {
  query: string;
  setQuery: (query: string) => void;
  items?: T[];
  isLoading: boolean;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemToStringValue?: (item: T) => string;
  popupProps?: React.ComponentProps<typeof AutocompletePopup>;
  statusProps?: React.ComponentProps<typeof AutocompleteStatus>;
  listProps?: React.ComponentProps<typeof AutocompleteList>;
  inputProps?: Omit<React.ComponentProps<typeof AutocompleteInput>, 'placeholder'>;
  inputClassName?: string;
  emptyMessage?: string;
  placeholder?: string;
  statusText?: string;
  onItemClick: (item: T) => void;
}

export default function AsyncCombobox<T>({
  query,
  setQuery,
  items,
  renderItem,
  itemToStringValue,
  isLoading,
  popupProps,
  statusProps,
  listProps,
  inputProps,
  placeholder = 'Search...',
  emptyMessage = 'No items found',
  statusText = '',
  inputClassName,
  onItemClick,
  ...props
}: AsyncComboboxProps<T>) {
  return (
    <Autocomplete filter={null} {...props} items={items ?? []} onValueChange={setQuery} value={query ?? ''}>
      <AutocompleteInput showTrigger showClear {...inputProps} placeholder={placeholder} className={inputClassName} />

      <AutocompletePopup aria-busy={isLoading || undefined} {...popupProps}>
        <AutocompleteStatus {...statusProps} className={cn(statusProps?.className, 'text-muted-foreground')}>
          {isLoading ? (
            <Loader2Icon className='size-4 animate-spin' />
          ) : items?.length === 0 ? (
            emptyMessage
          ) : (
            statusText
          )}
        </AutocompleteStatus>
        <AutocompleteList {...listProps}>
          {(item: T, index: number) => (
            <AutocompleteItem key={index} value={itemToStringValue?.(item)} onClick={() => onItemClick(item)}>
              {renderItem(item, index)}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  );
}
