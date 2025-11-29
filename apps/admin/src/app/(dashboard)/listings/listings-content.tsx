'use client';

import ListingsFilters from './listings-filters';
import ListingsTable from './listings-table';
import PendingListingsAlert from './pending-listings-alert';

export default function ListingsContent() {
  return (
    <div className='space-y-4'>
      <PendingListingsAlert />
      <ListingsFilters />
      <ListingsTable />
    </div>
  );
}

