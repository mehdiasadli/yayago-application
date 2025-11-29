'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { NavigationContext, NavigationGroup, NavigationLink, SubscriptionFeatures } from '@/lib/nav-data';
import { getNavigationGroups, getQuickActions, externalLinks } from '@/lib/nav-data';

interface NavigationContextValue {
  context: NavigationContext;
  groups: NavigationGroup[];
  quickActions: NavigationLink[];
  externalLinks: NavigationLink[];
  canAccessRoute: (href: string) => boolean;
}

const NavContext = createContext<NavigationContextValue | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
  organizationStatus: NavigationContext['organizationStatus'];
  memberRole: string;
  subscription?: SubscriptionFeatures | null;
}

export function NavigationProvider({
  children,
  organizationStatus,
  memberRole,
  subscription,
}: NavigationProviderProps) {
  const context: NavigationContext = {
    organizationStatus,
    memberRole,
    subscription,
  };

  const groups = getNavigationGroups(context);
  const quickActions = getQuickActions(context);

  // Helper to check if a route is accessible based on current navigation
  const canAccessRoute = (href: string): boolean => {
    // Check if the href is in any of the navigation groups
    for (const group of groups) {
      for (const link of group.links) {
        if (link.href === href) return true;
        if (link.items) {
          for (const subItem of link.items) {
            if (subItem.href === href) return true;
          }
        }
      }
    }
    // Also check quick actions
    for (const action of quickActions) {
      if (action.href === href) return true;
    }
    return false;
  };

  return (
    <NavContext.Provider
      value={{
        context,
        groups,
        quickActions,
        externalLinks,
        canAccessRoute,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

export function useCanAccessRoute(href: string) {
  const { canAccessRoute } = useNavigation();
  return canAccessRoute(href);
}
