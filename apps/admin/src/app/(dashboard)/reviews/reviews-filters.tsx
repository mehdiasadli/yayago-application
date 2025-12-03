'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseAsString, parseAsInteger, useQueryState } from 'nuqs';
import { Filter, X, Star, ArrowUpDown, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

const ratingOptions = [1, 2, 3, 4, 5] as const;
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest', label: 'Lowest Rating' },
] as const;

export default function ReviewsFilters() {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [organizationSlug, setOrganizationSlug] = useQueryState('org', parseAsString.withDefault(''));
  const [rating, setRating] = useQueryState('rating', parseAsInteger);
  const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('newest'));
  const [dateFrom, setDateFrom] = useQueryState('from', parseAsString.withDefault(''));
  const [dateTo, setDateTo] = useQueryState('to', parseAsString.withDefault(''));

  const hasFilters = search || organizationSlug || rating !== null || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch('');
    setOrganizationSlug('');
    setRating(null);
    setSortBy('newest');
    setDateFrom('');
    setDateTo('');
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
        {/* Search */}
        <div className='relative lg:col-span-2'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder='Search in comments...'
            value={search}
            onChange={(e) => setSearch(e.target.value || '')}
            className='pl-9'
          />
        </div>

        {/* Organization Filter */}
        <div className='relative'>
          <Building2 className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder='Organization slug...'
            value={organizationSlug}
            onChange={(e) => setOrganizationSlug(e.target.value || '')}
            className='pl-9'
          />
        </div>

        {/* Rating Filter */}
        <Select
          value={rating?.toString() || 'all'}
          onValueChange={(value) => setRating(value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger>
            <Star className='size-4 text-muted-foreground mr-2' />
            <SelectValue placeholder='All ratings' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All ratings</SelectItem>
            {ratingOptions.map((r) => (
              <SelectItem key={r} value={r.toString()}>
                <div className='flex items-center gap-2'>
                  <div className='flex'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${i < r ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <span>({r} star{r > 1 ? 's' : ''})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Date From */}
        <DatePicker
          date={dateFrom ? new Date(dateFrom) : undefined}
          setDate={(date) => setDateFrom(date ? date.toISOString().split('T')[0] : '')}
          placeholder='From date'
        />

        {/* Date To */}
        <DatePicker
          date={dateTo ? new Date(dateTo) : undefined}
          setDate={(date) => setDateTo(date ? date.toISOString().split('T')[0] : '')}
          placeholder='To date'
        />

        {/* Sort By */}
        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger>
            <ArrowUpDown className='size-4 text-muted-foreground mr-2' />
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

