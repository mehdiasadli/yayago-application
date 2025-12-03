'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Mail, Shield } from 'lucide-react';

interface TeamContentProps {
  maxMembers: number;
}

export default function TeamContent({ maxMembers }: TeamContentProps) {
  return (
    <div className='space-y-6'>
      {/* Team Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Team Members</CardTitle>
            <Users className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1</div>
            <p className='text-xs text-muted-foreground mt-1'>of {maxMembers} seats used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Pending Invites</CardTitle>
            <Mail className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground mt-1'>Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Available Seats</CardTitle>
            <Shield className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{maxMembers - 1}</div>
            <p className='text-xs text-muted-foreground mt-1'>Can be added</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage who has access to your organization</CardDescription>
          </div>
          <Button>
            <UserPlus className='size-4' />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent className='min-h-[200px] flex items-center justify-center'>
          <div className='text-center text-muted-foreground'>
            <Users className='size-16 mx-auto mb-4 opacity-50' />
            <p className='text-lg font-medium'>Team Management</p>
            <p className='text-sm'>Full team management features coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

