import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a new QueryClient instance with default field editor options.
 * Use this in tests to provide an explicit QueryClient instead of relying on the singleton.
 *
 * @example
 * ```tsx
 * import { createTestQueryClient } from '@contentful/field-editor-test-utils';
 *
 * it('should work', () => {
 *   const queryClient = createTestQueryClient();
 *   render(
 *     <SharedQueryClientProvider client={queryClient}>
 *       <MyComponent />
 *     </SharedQueryClientProvider>
 *   );
 * });
 * ```
 */
export function createTestQueryClient(): QueryClient {
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
}
