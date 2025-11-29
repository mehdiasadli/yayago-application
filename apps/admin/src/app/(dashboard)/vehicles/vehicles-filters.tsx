'use client';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { SearchIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';

export default function VehiclesFilters() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));

  return (
    <div className='flex items-center gap-2'>
      <InputGroup>
        <InputGroupInput value={q || ''} onChange={(e) => setQ(e.target.value)} placeholder='Search brands...' />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

