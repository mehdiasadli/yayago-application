import { authClient } from '@/lib/auth-client';
import AccountHeader from './_components/account-header';
import { headers } from 'next/headers';
import { redirect } from '@/lib/navigation/navigation-server';

export default async function AccountLayout({ children, params }: LayoutProps<'/[locale]/[city]/account'>) {
  const { city, locale } = await params;
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) {
    redirect(`/login?callback_url=/account`, { locale, city });
    return null;
  }

  return (
    <div className='container mx-auto mt-12'>
      <AccountHeader user={session.data.user} />
      <div className='mt-12'>{children}</div>
    </div>
  );
}
