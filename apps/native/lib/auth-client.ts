import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import {
  inferAdditionalFields,
  usernameClient,
  phoneNumberClient,
  adminClient,
  organizationClient,
} from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { auth } from '@yayago-app/auth';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URL,
  plugins: [
    expoClient({
      scheme: Constants.expoConfig?.scheme as string,
      storagePrefix: Constants.expoConfig?.scheme as string,
      storage: SecureStore,
    }),
    inferAdditionalFields<typeof auth>(),
    usernameClient(),
    phoneNumberClient(),
    adminClient(),
    organizationClient(),
  ],
});
