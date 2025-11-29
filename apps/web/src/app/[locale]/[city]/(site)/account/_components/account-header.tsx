import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PencilIcon } from 'lucide-react';
import AccountTabs from './account-tabs';
import AccountSubscriptionInfo from './account-subscription-info';

type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  username?: string | null | undefined;
  displayUsername?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  phoneNumberVerified?: boolean | null | undefined;
  banned: boolean | null | undefined;
  role?: string | null | undefined;
  banReason?: string | null | undefined;
  banExpires?: Date | null | undefined;
};

export default function AccountHeader({ user }: { user: User }) {
  return (
    <div>
      <Card>
        <CardContent className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Avatar className='size-20'>
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className='text-2xl'>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className='text-2xl font-bold'>{user.name}</h1>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <AccountTabs />
        </CardFooter>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className='w-[100px] bg-accent'>
      <CardContent className='flex flex-col items-center w-full'>
        <p className='text-3xl font-bold'>{value}</p>
        <p className='text-xs text-muted-foreground'>{title}</p>
      </CardContent>
    </Card>
  );
}
