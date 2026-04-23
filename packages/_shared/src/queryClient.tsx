import * as React from 'react';

import * as ReactQuery from '@tanstack/react-query';
import {
  QueryClient,
  QueryClientProvider,
  useQuery as useRQv4,
  useQueryClient as useHostQueryClientV4,
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

// `version` is exported at runtime in v4.36+ and v5, but not typed in v4's type declarations.
const rqVersion: string | undefined = (ReactQuery as any).version;
const RQ_MAJOR = parseInt(rqVersion ?? '4', 10);
const IS_V5 = RQ_MAJOR >= 5;

/**
 * A custom client context ensures zero conflict with host apps also using
 * React Query.
 */
const clientContext = React.createContext<QueryClient | undefined>(undefined);

// Singleton QueryClient instance shared across all field editors
let sharedQueryClientInstance: QueryClient | undefined;

function createDefaultQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...(IS_V5 ? { throwOnError: false } : { useErrorBoundary: false }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false,
        staleTime: Infinity,
        retry: false,
      },
    },
  });
}

function useMaybeHostQueryClient(): QueryClient | undefined {
  try {
    return useHostQueryClientV4();
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
      sharedQueryClientInstance = createDefaultQueryClient();
    }

    return sharedQueryClientInstance;
  }, [client, hostClient]);
}

// v5: useQuery takes a single options object with an optional `client` field.
// Cast to this shape to avoid depending on v5 types when installed on v4.
type UseQueryV5Fn = (opts: {
  queryKey: QueryKey;
  queryFn: QueryFunction<unknown, QueryKey>;
  client?: QueryClient;
  [key: string]: unknown;
}) => UseQueryResult<unknown, unknown>;

function useQueryV4<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<TData, TError> {
  return useRQv4(queryKey, queryFn, {
    ...options,
    context: clientContext,
  } as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>);
}

function useQueryV5<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>,
): UseQueryResult<TData, TError> {
  const queryClient = useQueryClient();
  return (useRQv4 as unknown as UseQueryV5Fn)({
    queryKey,
    queryFn: queryFn as QueryFunction<unknown, QueryKey>,
    ...(options as Record<string, unknown>),
    client: queryClient,
  }) as UseQueryResult<TData, TError>;
}

// Select the correct implementation once at module load time.
// Both implementations are valid hooks; we assign one to the export slot.
// This is safe because IS_V5 is a constant that never changes at runtime.
export const useQuery: <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>,
) => UseQueryResult<TData, TError> = IS_V5 ? useQueryV5 : useQueryV4;

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

  if (IS_V5) {
    // v5: wrap with QueryClientProvider so useQueryClient() from react-query
    // returns our isolated client. Isolation is also enforced by the `client`
    // option passed directly in useQuery above.
    return (
      <QueryClientProvider client={client}>
        <clientContext.Provider value={client}>{children}</clientContext.Provider>
      </QueryClientProvider>
    );
  }

  // v4: just set the custom context value; QueryClientProvider is in the host
  return <clientContext.Provider value={client}>{children}</clientContext.Provider>;
}
