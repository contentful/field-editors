/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';

import type {
  QueryClient,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
  QueryFunction,
} from '@tanstack/react-query';

// Conditional import - only available if @tanstack/react-query is installed
let RQQueryClient: typeof import('@tanstack/react-query').QueryClient | undefined;
let useRQ:
  | (<
      TQueryFnData = unknown,
      TError = unknown,
      TData = TQueryFnData,
      TQueryKey extends QueryKey = QueryKey,
    >(
      queryKey: TQueryKey,
      queryFn: QueryFunction<TQueryFnData, TQueryKey>,
      options?: Omit<
        UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
        'queryKey' | 'queryFn'
      >,
    ) => UseQueryResult<TData, TError>)
  | undefined;
let useHostQueryClient: () => QueryClient | undefined = () => undefined; // Default no-op hook

try {
  const rq = require('@tanstack/react-query');
  RQQueryClient = rq.QueryClient;
  useRQ = rq.useQuery;
  useHostQueryClient = rq.useQueryClient;
} catch {
  // React Query not available - will throw helpful errors if features are used
}

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

    if (!RQQueryClient) {
      throw new Error(
        '@tanstack/react-query is required to use QueryClient. Please install it as a dependency: npm install @tanstack/react-query',
      );
    }

    // Create singleton instance only once if not already created
    if (!sharedQueryClientInstance) {
      sharedQueryClientInstance = new RQQueryClient({
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
  if (!useRQ) {
    throw new Error(
      '@tanstack/react-query is required to use useQuery. Please install it as a dependency: npm install @tanstack/react-query',
    );
  }
  return useRQ(queryKey, queryFn, { ...options, context: clientContext });
}

/**
 * Provides access to a query client either by sharing an existing client or
 * creating a new one.
 */
export function SharedQueryClientProvider({
  children,
  client: providedClient,
}: React.PropsWithChildren<{ client?: QueryClient }>) {
  const internalClient = useQueryClient();
  // Use provided client if available, otherwise use internal client
  const client = React.useMemo(
    () => providedClient ?? internalClient,
    [providedClient, internalClient],
  );

  return <clientContext.Provider value={client}>{children}</clientContext.Provider>;
}
