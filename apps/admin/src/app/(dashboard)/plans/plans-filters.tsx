'use client';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

const activeOptions = ['all', 'active', 'inactive'] as const;

export default function PlansFilters() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [isActive, setIsActive] = useQueryState('isActive', parseAsStringLiteral(activeOptions).withDefault('all'));

  return (
    <div className='flex items-center gap-2'>
      <InputGroup>
        <InputGroupInput value={q || ''} onChange={(e) => setQ(e.target.value)} placeholder='Search plans...' />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <Select value={isActive} onValueChange={(value) => setIsActive(value as typeof isActive)}>
        <SelectTrigger className='w-[140px]'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='inactive'>Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

