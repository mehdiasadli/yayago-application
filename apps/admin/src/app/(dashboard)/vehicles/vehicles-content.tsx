'use client';

import VehiclesFilters from './vehicles-filters';
import VehiclesTable from './vehicles-table';

export default function VehiclesContent() {
  return (
    <div className='space-y-2'>
      <VehiclesFilters />
      <VehiclesTable />
    </div>
  );
}
