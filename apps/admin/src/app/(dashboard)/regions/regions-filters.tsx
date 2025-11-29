'use client';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { makeEnumLabels } from '@/lib/utils';
import { PlaceStatus, PlaceStatusSchema } from '@yayago-app/db/enums';
import { SearchIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';

export default function RegionsFilters() {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsStringLiteral(PlaceStatusSchema.options));

  return (
    <div className='flex items-center gap-2'>
      <InputGroup>
        <InputGroupInput value={q || ''} onChange={(e) => setQ(e.target.value)} placeholder='Search' />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <Select
        value={!status ? 'all' : status}
        onValueChange={(status) => setStatus(status === 'all' ? null : (status as PlaceStatus))}
      >
        <SelectTrigger>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All</SelectItem>

          {makeEnumLabels(PlaceStatusSchema.options).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
