'use client';

import * as React from 'react';
import { Car } from 'lucide-react';
import Link from 'next/link';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  organizationName?: string;
}

export function AppSidebar({ organizationName, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link href='/'>
                <div className='bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Car className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>YayaGO</span>
                  <span className='truncate text-xs text-muted-foreground'>{organizationName || 'Partner Portal'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavSecondary className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
