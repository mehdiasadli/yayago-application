'use client';

import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuShortcut,
} from '@/components/animate-ui/components/base/menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Link, useRouter } from '@/lib/navigation/navigation-client';

interface UserMenuProps {
  user: {
    name: string;
    image?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  async function handleLogout() {
    authClient
      .signOut()
      .then(() => {
        router.refresh();
      })
      .catch(() => {
        toast.error('Failed to log out');
      });
  }

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant='outline' size='icon'>
            <Avatar className='cursor-pointer rounded-none!'>
              <AvatarImage className='rounded-none!' src={user.image ?? undefined} />
              <AvatarFallback className='rounded-none!'>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <MenuPanel className='w-56' align='end' alignOffset={0} side='bottom' sideOffset={0}>
        <MenuGroup>
          <MenuGroupLabel>My Account</MenuGroupLabel>
          <MenuItem>
            <Link href='/account'>Profile</Link>
          </MenuItem>
          <MenuItem>
            <Link href='/account/settings'>Settings</Link>
          </MenuItem>
          <MenuItem>
            <Link href='/account/bookings'>My Bookings</Link>
          </MenuItem>
          <MenuItem>
            <Link href='/account/notifications'>Notifications</Link>
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem>
            <Link href='/become-a-host'>Become a Host</Link>
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuItem>
          <Link href='/help-center'>Support</Link>
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant='destructive' onClick={handleLogout}>
          Log out
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
}
