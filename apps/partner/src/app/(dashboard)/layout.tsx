import { AppSidebar } from '@/components/app-sidebar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import OrganizationStatusGuard from '@/components/organization-status-guard';
import type { OrganizationStatus } from '@/components/organization-status-guard';
import { NavigationProvider } from '@/contexts/navigation-context';
import type { SubscriptionFeatures } from '@/lib/nav-data';
import { orpc } from '@/utils/orpc';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  const organizationName = sessionData.organization.name as string;
  const memberRole = sessionData.member?.role || 'member';
  const rejectionReason = sessionData.organization.rejectionReason;
  const banReason = sessionData.organization.banReason;

  // For IDLE/ONBOARDING owners, redirect to onboarding
  if ((organizationStatus === 'IDLE' || organizationStatus === 'ONBOARDING') && memberRole === 'owner') {
    redirect('/onboarding');
  }

  // Get subscription features if organization is active
  let subscriptionFeatures: SubscriptionFeatures | null = null;
  if (organizationStatus === 'ACTIVE') {
    try {
      const usage = await orpc.listings.getSubscriptionUsage.call();
      const plan = usage.plan as { name: string; slug: string; maxMembers?: number; hasAnalytics?: boolean };
      subscriptionFeatures = {
        maxMembers: plan.maxMembers ?? 1,
        maxListings: usage.usage.listings.max || 5,
        hasAnalytics: plan.hasAnalytics ?? false,
        hasBookings: true, // Assume all plans have bookings
        hasReviews: true, // Assume all plans have reviews
      };
    } catch {
      // If subscription check fails, use defaults
      subscriptionFeatures = null;
    }
  }

  return (
    <NavigationProvider
      organizationStatus={organizationStatus}
      memberRole={memberRole}
      subscription={subscriptionFeatures}
    >
      <SidebarProvider>
        <AppSidebar organizationName={organizationName} />
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 border-b'>
            <div className='flex items-center gap-2 px-4 justify-between w-full'>
              <div className='flex items-center gap-2'>
                <SidebarTrigger className='-ml-1' />
              </div>
              <div className='flex items-center gap-2 ml-auto'>
                <AnimatedThemeToggler />
              </div>
            </div>
          </header>
          <main className='p-4'>
            <OrganizationStatusGuard
              status={organizationStatus}
              memberRole={memberRole}
              rejectionReason={rejectionReason}
              banReason={banReason}
              context='dashboard'
            >
              {children}
            </OrganizationStatusGuard>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </NavigationProvider>
  );
}
