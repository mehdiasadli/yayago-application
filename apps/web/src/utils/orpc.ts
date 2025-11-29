import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AppRouterClient } from '@yayago-app/api/routers/index';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: 'retry',
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const link = new RPCLink({
  url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: 'include',
    });
  },
  headers: async () => {
    if (typeof window !== 'undefined') {
      // URL: /[locale]/[city]/...
      // e.g., /en/dubai/rent/cars
      // split('/') gives: ['', 'en', 'dubai', 'rent', 'cars']
      const pathSegments = window.location.pathname.split('/');

      const lang = pathSegments[1]; // "en" (locale)
      const city = pathSegments[2]; // "dubai" (city)

      const headers: Record<string, string> = {};

      if (lang && lang.length === 2) headers['x-language-code'] = lang;
      if (city) headers['x-city-code'] = city;

      return headers;
    }

    const { headers } = await import('next/headers');
    return Object.fromEntries(await headers());
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
