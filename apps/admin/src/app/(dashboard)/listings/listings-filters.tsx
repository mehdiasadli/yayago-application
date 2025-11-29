'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseAsString, useQueryState } from 'nuqs';
import { Search, Filter, X } from 'lucide-react';
import { ListingStatusSchema, VerificationStatusSchema } from '@yayago-app/db/enums';
import { Button } from '@/components/ui/button';
import { formatEnumValue } from '@/lib/utils';

export default function ListingsFilters() {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(''));
  const [verificationStatus, setVerificationStatus] = useQueryState('verification', parseAsString.withDefault(''));

  const hasFilters = search || status || verificationStatus;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setVerificationStatus('');
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

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Search */}
        <div className='relative md:col-span-2'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder='Search by title or organization...'
            value={search}
            onChange={(e) => setSearch(e.target.value || '')}
            className='pl-9'
          />
        </div>

        {/* Listing Status Filter */}
        <Select value={status} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder='All statuses' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All statuses</SelectItem>
            {ListingStatusSchema.options.map((statusOption) => (
              <SelectItem key={statusOption} value={statusOption}>
                {formatEnumValue(statusOption)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Verification Status Filter */}
        <Select value={verificationStatus} onValueChange={(value) => setVerificationStatus(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <SelectValue placeholder='All verification' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All verification</SelectItem>
            {VerificationStatusSchema.options.map((option) => (
              <SelectItem key={option} value={option}>
                {formatEnumValue(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

