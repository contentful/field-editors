import * as React from 'react';

import { QueryClient, useQuery as useRQ } from '@tanstack/react-query';

/**
 * A custom client context ensures zero conflict with host apps also using
 * React Query.
 */
const clientContext = React.createContext<QueryClient | undefined>(undefined);

export function useQueryClient(): QueryClient {
  const client = React.useContext(clientContext);

  return React.useMemo(() => {
    if (client) {
      return client;
    }

    return new QueryClient({
      defaultOptions: {
        queries: {
          useErrorBoundary: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
          refetchOnMount: false,
          staleTime: Infinity,
          retry: false,
        },
      },
    });
  }, [client]);
}

// @ts-expect-error
export const useQuery: typeof useRQ = (key, fn, opt) => {
  return useRQ(key, fn, { ...opt, context: clientContext });
};

/**
 * Provides access to a query client either by sharing an existing client or
 * creating a new one.
 */
export function SharedQueryClientProvider({ children }: React.PropsWithChildren<{}>) {
  const client = useQueryClient();

  return <clientContext.Provider value={client}>{children}</clientContext.Provider>;
}
