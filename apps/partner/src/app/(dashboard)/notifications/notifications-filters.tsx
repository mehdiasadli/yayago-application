'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseAsString, useQueryState } from 'nuqs';
import { Filter, X, Tag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const categoryOptions = [
  { value: 'BOOKING', label: 'Booking' },
  { value: 'LISTING', label: 'Listing' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'FINANCIAL', label: 'Financial' },
  { value: 'VERIFICATION', label: 'Verification' },
  { value: 'SYSTEM', label: 'System' },
] as const;

const readStatusOptions = [
  { value: 'unread', label: 'Unread only' },
  { value: 'read', label: 'Read only' },
] as const;

export default function NotificationsFilters() {
  const [category, setCategory] = useQueryState('category', parseAsString.withDefault(''));
  const [readStatus, setReadStatus] = useQueryState('status', parseAsString.withDefault(''));

  const hasFilters = category || readStatus;

  const clearFilters = () => {
    setCategory('');
    setReadStatus('');
  };

  return (
    <div className='flex flex-col gap-4 p-4 rounded-lg border bg-card'>
      <div className='flex items-center gap-2'>
        <Filter className='size-4 text-muted-foreground' />
        <span className='text-sm font-medium'>Filters</span>
        {hasFilters && (
          <Button variant='ghost' size='sm' onClick={clearFilters} className='ml-auto h-7 text-xs'>
            <X className='size-3' />
            Clear all
          </Button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Category Filter */}
        <Select value={category || 'all'} onValueChange={(value) => setCategory(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <Tag className='size-4 text-muted-foreground mr-2' />
            <SelectValue placeholder='All categories' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All categories</SelectItem>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Read Status Filter */}
        <Select value={readStatus || 'all'} onValueChange={(value) => setReadStatus(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <Eye className='size-4 text-muted-foreground mr-2' />
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            {readStatusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

