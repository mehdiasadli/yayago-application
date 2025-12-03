'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseAsString, useQueryState } from 'nuqs';
import { Filter, X, ArrowUpDown, Tag, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

const categoryOptions = [
  { value: 'BOOKING', label: 'Booking' },
  { value: 'LISTING', label: 'Listing' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'FINANCIAL', label: 'Financial' },
  { value: 'FAVORITE', label: 'Favorite' },
  { value: 'VERIFICATION', label: 'Verification' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'SECURITY', label: 'Security' },
] as const;

const priorityOptions = [
  { value: 'URGENT', label: 'Urgent', color: 'text-red-500' },
  { value: 'HIGH', label: 'High', color: 'text-amber-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-blue-500' },
  { value: 'LOW', label: 'Low', color: 'text-slate-500' },
] as const;

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
] as const;

export default function NotificationsFilters() {
  const [category, setCategory] = useQueryState('category', parseAsString.withDefault(''));
  const [priority, setPriority] = useQueryState('priority', parseAsString.withDefault(''));
  const [userId, setUserId] = useQueryState('userId', parseAsString.withDefault(''));
  const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('newest'));
  const [dateFrom, setDateFrom] = useQueryState('from', parseAsString.withDefault(''));
  const [dateTo, setDateTo] = useQueryState('to', parseAsString.withDefault(''));

  const hasFilters = category || priority || userId || dateFrom || dateTo;

  const clearFilters = () => {
    setCategory('');
    setPriority('');
    setUserId('');
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

        {/* Priority Filter */}
        <Select value={priority || 'all'} onValueChange={(value) => setPriority(value === 'all' ? '' : value)}>
          <SelectTrigger>
            <AlertCircle className='size-4 text-muted-foreground mr-2' />
            <SelectValue placeholder='All priorities' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All priorities</SelectItem>
            {priorityOptions.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                <div className='flex items-center gap-2'>
                  <span className={`size-2 rounded-full ${p.color} bg-current`} />
                  <span>{p.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User ID Filter */}
        <div className='relative'>
          <User className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
          <Input
            placeholder='User ID...'
            value={userId}
            onChange={(e) => setUserId(e.target.value || '')}
            className='pl-9'
          />
        </div>

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

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
      </div>
    </div>
  );
}

