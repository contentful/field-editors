/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';

import type {
  QueryClient as QC,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
  QueryFunction,
} from '@tanstack/react-query';

// Conditional import - only available if @tanstack/react-query is installed
let QueryClient: typeof QC | undefined;
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
let useHostQueryClient: () => QC | undefined = () => undefined; // Default no-op hook

try {
  const rq = require('@tanstack/react-query');
  QueryClient = rq.QueryClient;
  useRQ = rq.useQuery;
  useHostQueryClient = rq.useQueryClient;
} catch {
  // React Query not available - will throw helpful errors if features are used
}

/**
 * A custom client context ensures zero conflict with host apps also using
 * React Query.
 */
const clientContext = React.createContext<QC | undefined>(undefined);

function useMaybeHostQueryClient(): QC | undefined {
  try {
    return useHostQueryClient();
  } catch {
    return undefined;
  }
}

export function useQueryClient(): QC {
  const client = React.useContext(clientContext);
  const hostClient = useMaybeHostQueryClient();

  return React.useMemo(() => {
    if (client) {
      return client;
    }

    if (hostClient) return hostClient;

    if (!QueryClient) {
      throw new Error(
        '@tanstack/react-query is required to use QueryClient. Please install it as a dependency: npm install @tanstack/react-query',
      );
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
export function SharedQueryClientProvider({ children }: React.PropsWithChildren<{}>) {
  const client = useQueryClient();

  return <clientContext.Provider value={client}>{children}</clientContext.Provider>;
}
