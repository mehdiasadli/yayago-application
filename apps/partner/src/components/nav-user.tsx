'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Bell,
  Building2,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Loader2,
  ExternalLink,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';

export function NavUser() {
  const { data: session } = authClient.useSession();
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const organization = (session as any).organization;
  const memberRole = (session as any).member?.role || 'member';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success('Logged out successfully');
            router.push('/sign-in');
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || 'Failed to log out');
          },
        },
      });
    } catch (error) {
      toast.error('Failed to log out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className='rounded-lg'>{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user.name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {organization?.name || user.email}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback className='rounded-lg'>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                </div>
                <Badge variant={getRoleBadgeVariant(memberRole)} className='capitalize text-xs'>
                  {memberRole}
                </Badge>
              </div>
            </DropdownMenuLabel>
            
            {organization && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className='text-xs text-muted-foreground px-2'>
                  Organization
                </DropdownMenuLabel>
                <div className='px-2 py-1.5'>
                  <div className='flex items-center gap-2'>
                    <Building2 className='size-4 text-muted-foreground' />
                    <span className='text-sm font-medium truncate'>{organization.name}</span>
                  </div>
                </div>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href='/account'>
                  <User className='size-4 mr-2' />
                  My Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/notifications'>
                  <Bell className='size-4 mr-2' />
                  Notifications
                </Link>
              </DropdownMenuItem>
              {(memberRole === 'owner' || memberRole === 'admin') && (
                <DropdownMenuItem asChild>
                  <Link href='/settings'>
                    <Settings className='size-4 mr-2' />
                    Organization Settings
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            
            {(memberRole === 'owner' || memberRole === 'admin') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href='/subscription'>
                      <CreditCard className='size-4 mr-2' />
                      Subscription & Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href='/payouts'>
                      <ExternalLink className='size-4 mr-2' />
                      Payouts
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <>
                    <Sun className='size-4 mr-2' />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className='size-4 mr-2' />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className='text-destructive focus:text-destructive'
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className='size-4 mr-2 animate-spin' />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className='size-4 mr-2' />
                  Log out
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
