import { AppSidebar } from '@/components/app-sidebar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session.data?.user) {
    redirect('/login');
  }

  const user = session.data.user as any;

  if (user.role !== 'admin' && user.role !== 'moderator') {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2'>
          <div className='flex items-center gap-2 px-4 justify-between w-full'>
            <div className='flex items-center gap-2'>
              <SidebarTrigger className='-ml-1' />
              {/* <Separator orientation='vertical' className='mr-2 data-[orientation=vertical]:h-4' /> */}
            </div>
            <div className='flex items-center gap-2 ml-auto'>
              <AnimatedThemeToggler />
            </div>
          </div>
        </header>
        <main className='px-4 pt-4'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
