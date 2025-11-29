'use client';

import CitiesFilters from './cities-filters';
import CitiesTable from './cities-table';

interface CitiesContentProps {
  code: string;
}

export default function CitiesContent({ code }: CitiesContentProps) {
  return (
    <div className='space-y-2'>
      <CitiesFilters />
      <CitiesTable code={code} />
    </div>
  );
}
