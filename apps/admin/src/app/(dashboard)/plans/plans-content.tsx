'use client';

import PlansFilters from './plans-filters';
import PlansTable from './plans-table';

export default function PlansContent() {
  return (
    <div className='space-y-2'>
      <PlansFilters />
      <PlansTable />
    </div>
  );
}

