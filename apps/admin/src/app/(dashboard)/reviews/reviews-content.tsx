'use client';

import ReviewsStats from './reviews-stats';
import ReviewsFilters from './reviews-filters';
import ReviewsTable from './reviews-table';

export default function ReviewsContent() {
  return (
    <div className='space-y-4'>
      <ReviewsStats />
      <ReviewsFilters />
      <ReviewsTable />
    </div>
  );
}

