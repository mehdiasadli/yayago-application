import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import OrganizationStatusGuard from '@/components/organization-status-guard';
import type { OrganizationStatus } from '@/components/organization-status-guard';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();

  const session = await authClient.getSession({
    fetchOptions: {
      headers: headersList,
    },
  });

  if (!session.data?.user) {
    redirect('/login');
  }

  // Check if user has an organization
  const sessionData = session.data as any;
  if (!sessionData?.organization) {
    // No organization - sign out and redirect
    await authClient.signOut({
      fetchOptions: {
        headers: headersList,
      },
    });
    redirect('/login');
  }

  // Get organization data from session
  const organizationStatus = sessionData.organization.status as OrganizationStatus;
  const memberRole = sessionData.member?.role || 'member';
  const rejectionReason = sessionData.organization.rejectionReason;
  const banReason = sessionData.organization.banReason;

  // For PENDING/ACTIVE, redirect to dashboard
  if (organizationStatus === 'PENDING' || organizationStatus === 'ACTIVE') {
    redirect('/');
  }

  // For SUSPENDED/ARCHIVED, show error page
  if (organizationStatus === 'SUSPENDED' || organizationStatus === 'ARCHIVED') {
    return (
      <div className='min-h-screen bg-background'>
        <OrganizationStatusGuard
          status={organizationStatus}
          memberRole={memberRole}
          rejectionReason={rejectionReason}
          banReason={banReason}
          context='onboarding'
        >
          {children}
        </OrganizationStatusGuard>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <OrganizationStatusGuard
        status={organizationStatus}
        memberRole={memberRole}
        rejectionReason={rejectionReason}
        banReason={banReason}
        context='onboarding'
      >
        {children}
      </OrganizationStatusGuard>
    </div>
  );
}

