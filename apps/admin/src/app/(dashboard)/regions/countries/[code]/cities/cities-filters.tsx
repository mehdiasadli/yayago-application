'use client';

import { PlaceStatus, PlaceStatusSchema } from '@yayago-app/db/enums';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { makeEnumLabels } from '@/lib/utils';

export default function CitiesFilters() {
  const [status, setStatus] = useQueryState('status', parseAsStringLiteral(PlaceStatusSchema.options));

  return (
    <div className='flex items-center gap-2'>
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
