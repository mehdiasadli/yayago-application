'use client';

import AddonsFilters from './addons-filters';
import AddonsTable from './addons-table';
import AddonsStats from './addons-stats';

export default function AddonsContent() {
  return (
    <div className='space-y-4'>
      <AddonsStats />
      <AddonsFilters />
      <AddonsTable />
    </div>
  );
}

