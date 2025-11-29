'use client';

import RegionsFilters from './regions-filters';
import RegionsTable from './regions-table';

export default function RegionsContent() {
  return (
    <div className='space-y-2'>
      <RegionsFilters />
      <RegionsTable />
    </div>
  );
}
