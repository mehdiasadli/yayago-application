import { authClient } from '@/lib/auth-client';
import AccountHeader from './_components/account-header';
import AccountNavigation from './_components/account-navigation';
import { headers } from 'next/headers';
import { redirect } from '@/lib/navigation/navigation-server';

export default async function AccountLayout({ children, params }: LayoutProps<'/[locale]/[city]/account'>) {
  const { city, locale } = await params;
  const hdrs = await headers();

  const session = await authClient.getSession({
    fetchOptions: { headers: hdrs },
  });

  if (!session.data?.user) {
    redirect(`/login?callback_url=/account`, { locale, city });
    return null;
  }

  const user = session.data.user;

  return (
    <div className='min-h-screen bg-muted/30'>
      <div className='container mx-auto py-8 space-y-6'>
        <AccountHeader user={user} />
        <div className='flex flex-col lg:flex-row gap-6'>
          <aside className='w-full lg:w-64 shrink-0'>
            <AccountNavigation userRole={user.role as 'user' | 'moderator' | 'admin'} />
          </aside>
          <main className='flex-1 min-w-0'>{children}</main>
        </div>
      </div>
    </div>
  );
}
