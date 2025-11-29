import type { auth } from '@yayago-app/auth';
import { createAuthClient } from 'better-auth/react';
import {
  inferAdditionalFields,
  usernameClient,
  phoneNumberClient,
  adminClient,
  organizationClient,
  multiSessionClient,
} from 'better-auth/client/plugins';
import { stripeClient } from '@better-auth/stripe/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    usernameClient(),
    phoneNumberClient(),
    adminClient(),
    organizationClient(),
    multiSessionClient(),
    stripeClient({
      subscription: true,
    }),
  ],
});
