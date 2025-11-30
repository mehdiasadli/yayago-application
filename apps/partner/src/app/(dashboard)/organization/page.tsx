'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { GetMyOrganizationOutputType } from '@yayago-app/validators';
import { OrganizationHeader } from './_components/organization-header';
import { OrganizationDetails } from './_components/organization-details';
import { OrganizationContact } from './_components/organization-contact';
import { OrganizationLocation } from './_components/organization-location';
import { OrganizationSocial } from './_components/organization-social';
import { OrganizationBusinessHours } from './_components/organization-business-hours';
import { OrganizationPolicies } from './_components/organization-policies';

// Context for role-based access
type OrgContextType = {
  org: GetMyOrganizationOutputType;
  canEdit: boolean; // owner only
  canEditLimited: boolean; // owner or admin (social, hours, policies)
};

export const OrgContext = createContext<OrgContextType | null>(null);

export function useOrgContext() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrgContext must be used within OrgContext.Provider');
  return ctx;
}

export default function OrganizationPage() {
  const { data: org, isLoading, error } = useQuery(orpc.organizations.getMyOrganization.queryOptions());

  if (isLoading) {
    return (
      <div className='container py-6 space-y-6'>
        <Skeleton className='h-48 w-full' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
        </div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className='container py-6'>
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertDescription>
            {error?.message || 'Failed to load organization data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Role-based permissions
  const canEdit = org.memberRole === 'owner';
  const canEditLimited = org.memberRole === 'owner' || org.memberRole === 'admin';

  return (
    <OrgContext.Provider value={{ org, canEdit, canEditLimited }}>
      <div className='container py-6 space-y-6'>
        <OrganizationHeader />
        
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <OrganizationDetails />
          <OrganizationContact />
          <OrganizationLocation />
          <OrganizationSocial />
        </div>
        
        <OrganizationBusinessHours />
        <OrganizationPolicies />
      </div>
    </OrgContext.Provider>
  );
}

