'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/utils/orpc';
import { ThemeProvider } from './theme-provider';
import { Toaster } from './ui/sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='light' disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter
          defaultOptions={{
            clearOnDefault: true,
            scroll: false,
          }}
        >
          {children}
        </NuqsAdapter>
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
