'use client';

import UsersFilters from './users-filters';
import UsersTable from './users-table';

export default function UsersContent() {
  return (
    <div className='space-y-4'>
      <UsersFilters />
      <UsersTable />
    </div>
  );
}
