import type { Context as HonoContext } from 'hono';
import { auth } from '@yayago-app/auth';

export type CreateContextOptions = {
  context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  return {
    session,
    city: context.req.raw.headers.get('x-city-code') || 'dubai',
    locale: context.req.raw.headers.get('x-language-code') || 'en',
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
