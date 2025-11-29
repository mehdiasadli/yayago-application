'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useNavigation } from '@/contexts/navigation-context';

export function NavMain() {
  const pathname = usePathname();
  const { groups } = useNavigation();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {groups.map((group, groupIndex) => (
        <SidebarGroup key={group.label || groupIndex}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.links.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive(item.href) || item.items?.some((sub) => isActive(sub.href))}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.Icon />
                      <span>{item.title}</span>
                      {item.badge !== undefined && (
                        <Badge variant='secondary' className='ml-auto text-xs'>
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className='data-[state=open]:rotate-90'>
                          <ChevronRight />
                          <span className='sr-only'>Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(subItem.href)}>
                                <Link href={subItem.href}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
