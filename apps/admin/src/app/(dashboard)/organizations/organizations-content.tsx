'use client';

import OrganizationsFilters from './organizations-filters';
import OrganizationsTable from './organizations-table';
import PendingOrganizationsAlert from './pending-organizations-alert';

export default function OrganizationsContent() {
  return (
    <div className='space-y-4'>
      <PendingOrganizationsAlert />
      <OrganizationsFilters />
      <OrganizationsTable />
    </div>
  );
}

