'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useNavigation } from '@/contexts/navigation-context';

export function NavSecondary({ ...props }: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { externalLinks } = useNavigation();

  if (externalLinks.length === 0) {
    return null;
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel>External</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {externalLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size='sm'>
                <Link href={item.href} target='_blank' rel='noopener noreferrer'>
                  <item.Icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
