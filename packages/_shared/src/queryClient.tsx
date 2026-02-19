import * as React from 'react';

import {
  QueryClient,
  useQuery as useRQ,
  useQueryClient as useHostQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryKey,
  type QueryFunction,
} from '@tanstack/react-query';

/**
 * A custom client context ensures zero conflict with host apps also using
 * React Query.
 */
const clientContext = React.createContext<QueryClient | undefined>(undefined);

// Singleton QueryClient instance shared across all field editors
let sharedQueryClientInstance: QueryClient | undefined;

function useMaybeHostQueryClient(): QueryClient | undefined {
  try {
    return useHostQueryClient();
  } catch {
    return undefined;
  }
}

export function useQueryClient(): QueryClient {
  const client = React.useContext(clientContext);
  const hostClient = useMaybeHostQueryClient();

  return React.useMemo(() => {
    if (client) {
      return client;
    }

    if (hostClient) return hostClient;

    // Create singleton instance only once if not already created
    if (!sharedQueryClientInstance) {
      sharedQueryClientInstance = new QueryClient({
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
    }

    return sharedQueryClientInstance;
  }, [client, hostClient]);
}

export function useQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<TData, TError> {
  return useRQ(queryKey, queryFn, { ...options, context: clientContext });
}

/**
 * Provides access to a query client either by sharing an existing client or
 * creating a new one.
 *
 * @param client - Optional QueryClient instance. When provided (e.g., in tests),
 *                 it takes priority over any host client or singleton.
 */
export function SharedQueryClientProvider({
  children,
  client: providedClient,
}: React.PropsWithChildren<{ client?: QueryClient }>) {
  const internalClient = useQueryClient();
  const client = React.useMemo(
    () => providedClient ?? internalClient,
    [providedClient, internalClient],
  );

  return <clientContext.Provider value={client}>{children}</clientContext.Provider>;
}
