import { guardTeamAccess } from '@/lib/page-access';
import PageHeader from '@/components/page-header';
import TeamContent from './team-content';

export default async function TeamPage() {
  // Server-side access check
  // Requires: ACTIVE org, admin/owner role, maxMembers > 1 subscription
  const context = await guardTeamAccess();

  return (
    <div className='space-y-4'>
      <PageHeader
        title='Team'
        description={`Manage your team members (${context.subscription?.maxMembers || 1} seats available)`}
      />
      <TeamContent maxMembers={context.subscription?.maxMembers || 1} memberRole={context.memberRole} />
    </div>
  );
}
