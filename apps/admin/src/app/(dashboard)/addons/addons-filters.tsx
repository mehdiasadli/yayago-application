'use client';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

const activeOptions = ['all', 'active', 'inactive'] as const;
const featuredOptions = ['all', 'featured', 'not-featured'] as const;
const categoryOptions = [
  'all',
  'INSURANCE',
  'PROTECTION',
  'CHILD_SAFETY',
  'NAVIGATION',
  'CONNECTIVITY',
  'COMFORT',
  'WINTER',
  'OUTDOOR',
  'MOBILITY',
  'DRIVER',
  'DELIVERY',
  'FUEL',
  'CLEANING',
  'TOLL',
  'BORDER',
  'PARKING',
  'OTHER',
] as const;

export default function AddonsFilters() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [isActive, setIsActive] = useQueryState('isActive', parseAsStringLiteral(activeOptions).withDefault('all'));
  const [isFeatured, setIsFeatured] = useQueryState(
    'isFeatured',
    parseAsStringLiteral(featuredOptions).withDefault('all')
  );
  const [category, setCategory] = useQueryState('category', parseAsStringLiteral(categoryOptions).withDefault('all'));

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <InputGroup className='w-full sm:w-auto'>
        <InputGroupInput value={q || ''} onChange={(e) => setQ(e.target.value)} placeholder='Search addons...' />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
        <SelectTrigger className='w-[160px]'>
          <SelectValue placeholder='Category' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Categories</SelectItem>
          <SelectItem value='INSURANCE'>Insurance</SelectItem>
          <SelectItem value='PROTECTION'>Protection</SelectItem>
          <SelectItem value='CHILD_SAFETY'>Child Safety</SelectItem>
          <SelectItem value='NAVIGATION'>Navigation</SelectItem>
          <SelectItem value='CONNECTIVITY'>Connectivity</SelectItem>
          <SelectItem value='COMFORT'>Comfort</SelectItem>
          <SelectItem value='WINTER'>Winter</SelectItem>
          <SelectItem value='OUTDOOR'>Outdoor</SelectItem>
          <SelectItem value='MOBILITY'>Mobility</SelectItem>
          <SelectItem value='DRIVER'>Driver</SelectItem>
          <SelectItem value='DELIVERY'>Delivery</SelectItem>
          <SelectItem value='FUEL'>Fuel</SelectItem>
          <SelectItem value='CLEANING'>Cleaning</SelectItem>
          <SelectItem value='TOLL'>Toll</SelectItem>
          <SelectItem value='BORDER'>Border</SelectItem>
          <SelectItem value='PARKING'>Parking</SelectItem>
          <SelectItem value='OTHER'>Other</SelectItem>
        </SelectContent>
      </Select>

      <Select value={isActive} onValueChange={(value) => setIsActive(value as typeof isActive)}>
        <SelectTrigger className='w-[140px]'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='inactive'>Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select value={isFeatured} onValueChange={(value) => setIsFeatured(value as typeof isFeatured)}>
        <SelectTrigger className='w-[140px]'>
          <SelectValue placeholder='Featured' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All</SelectItem>
          <SelectItem value='featured'>Featured</SelectItem>
          <SelectItem value='not-featured'>Not Featured</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

