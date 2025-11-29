'use client';

import ListingsFilters from './listings-filters';
import ListingsTable from './listings-table';
import SubscriptionUsageCard from './subscription-usage-card';

export default function ListingsContent() {
  return (
    <div className='space-y-4'>
      <SubscriptionUsageCard />
      <ListingsFilters />
      <ListingsTable />
    </div>
  );
}

