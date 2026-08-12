'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthRefreshWatcher queryClient={queryClient} />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

/* ── Supabase session auto-refresh watcher ── */
function AuthRefreshWatcher({ queryClient }: { queryClient: QueryClient }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        // Session silently refreshed — nothing to do
        console.debug('[auth] token refreshed');
      }

      if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        // Session expired and could not be refreshed — redirect to login
        queryClient.clear();
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient, router]);

  return null;
}
