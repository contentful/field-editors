import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { BaseExtensionSDK } from '@contentful/app-sdk';
import {
  FetchQueryOptions,
  Query,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  QueryKey,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import constate from 'constate';
import { createClient, PlainClientAPI } from 'contentful-management';
import PQueue from 'p-queue';

import {
  Asset,
  ContentType,
  Entry,
  Resource,
  ResourceType,
  Space,
  ScheduledAction,
} from '../types';

export type ResourceInfo<R extends Resource = Resource> = {
  resource: R;
  defaultLocaleCode: string;
  contentType: ContentType;
  space: Space;
};

// global queue for all requests, the actual number is picked without scientific research
const globalQueue = new PQueue({ concurrency: 20 });

type EntityStoreProps = {
  sdk: BaseExtensionSDK;
  queryConcurrency?: number;
};

type FetchService = ReturnType<typeof useFetch>;

type GetOptions = {
  priority?: number;
};

type GetEntityOptions = GetOptions & {
  spaceId?: string;
  environmentId?: string;
};

type UseEntityOptions = GetEntityOptions & { enabled?: boolean };

type QueryEntityResult<E> = Promise<E>;

type GetResourceOptions = GetOptions;

type QueryResourceResult<R extends Resource = Resource> = QueryEntityResult<ResourceInfo<R>>;

type UseResourceOptions = GetResourceOptions & { enabled?: boolean };

// all types of the union share the data property to ease destructuring downstream
type UseEntityResult<E> =
  | { status: 'idle'; data: never }
  | { status: 'loading'; data: never }
  | { status: 'error'; data: never }
  | { status: 'success'; data: E };

type FetchFunction<TQueryData> = (context: { cmaClient: PlainClientAPI }) => Promise<TQueryData>;
type FetchServiceOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey> & GetOptions;
type FetchParams = { fetch: FetchService; urn: string; options?: GetOptions };

type FetchableEntityType = 'Entry' | 'Asset';
type FetchableEntity = Entry | Asset;

type EntityQueryKey = [
  entityType: FetchableEntityType,
  entityId: string,
  spaceId: string,
  environmentId: string
];

type ScheduledActionsQueryKey = ['scheduled-actions', ...EntityQueryKey];

export class UnsupportedError extends Error {
  isUnsupportedError: boolean;
  constructor(message: string) {
    super(message);
    this.isUnsupportedError = true;
  }
}

export function isUnsupportedError(value: unknown): value is UnsupportedError {
  return (
    typeof value === 'object' && (value as UnsupportedError | null)?.isUnsupportedError === true
  );
}

const isEntityQueryKey = (queryKey: QueryKey): queryKey is EntityQueryKey => {
  return (
    Array.isArray(queryKey) &&
    (queryKey[0] === 'Entry' || queryKey[0] === 'Asset') &&
    queryKey.length === 4
  );
};

type ResourceQueryKey = [ident: 'Resource', resourceType: ResourceType, urn: string];

async function fetchContentfulEntry(params: FetchParams): Promise<ResourceInfo<Entry>> {
  console.log(params);
  const { urn, fetch, options } = params;
  const resourceId = urn.split(':', 6)[5];
  const [, spaceId, , entryId] = resourceId.split('/');
  const environmentId = 'master';

  console.log(1);
  try {
    const [space, entry] = await Promise.all([
      fetch(
        ['space', spaceId],
        ({ cmaClient }) => {
          console.log(cmaClient.space.get({ spaceId }));
          return cmaClient.space.get({ spaceId });
        },
        options
      ),
      fetch(
        ['entry', spaceId, environmentId, entryId],
        ({ cmaClient }) =>
          cmaClient.entry.get({
            spaceId,
            environmentId,
            entryId,
          }),
        options
      ),
    ]);
  } catch (e) {
    console.error(e);
  }
  console.log(2);
  const contentTypeId = entry.sys.contentType.sys.id;
  const [contentType, defaultLocaleCode] = await Promise.all([
    fetch(
      ['contentType', spaceId, environmentId, contentTypeId],
      ({ cmaClient }) =>
        cmaClient.contentType.get({
          contentTypeId,
          spaceId,
          environmentId,
        }),
      options
    ),
    fetch(
      ['defaultLocale', spaceId, environmentId],
      async ({ cmaClient }) => {
        const locales = await cmaClient.locale.getMany({
          spaceId,
          environmentId,
          query: { limit: 100 },
        });
        const defaultLocaleCode = locales.items.find((locale) => locale.default)?.code as string;

        return defaultLocaleCode;
      },
      options
    ),
  ]);
  console.log(3);
  console.log(defaultLocaleCode, entry, space, contentType);

  return {
    defaultLocaleCode,
    resource: entry,
    space: space,
    contentType: contentType,
  };
}

const [InternalServiceProvider, useFetch, useEntityLoader, useCurrentIds] = constate(
  function useInitServices(props: EntityStoreProps) {
    const currentSpaceId = props.sdk.ids.space;
    const currentEnvironmentId = props.sdk.ids.environment;
    const queryClient = useQueryClient();
    const queryCache = queryClient.getQueryCache();
    const entityChangeUnsubscribers = useRef<Record<string, Function>>({});
    const cmaClient = useMemo(
      () => createClient({ apiAdapter: props.sdk.cmaAdapter }, { type: 'plain' }),
      [props.sdk.cmaAdapter]
    );
    const queryQueue = useMemo(() => {
      if (props.queryConcurrency) {
        return new PQueue({ concurrency: props.queryConcurrency });
      }

      return globalQueue;
    }, [props.queryConcurrency]);

    const fetch = useCallback(
      function fetch<
        TQueryFnData = unknown,
        TError = unknown,
        TData = TQueryFnData,
        TQueryKey extends QueryKey = QueryKey
      >(
        queryKey: TQueryKey,
        fn: FetchFunction<TQueryFnData>,
        options: FetchServiceOptions<TQueryFnData, TError, TData, TQueryKey> = {}
      ) {
        const { priority, ...queryOptions } = options;
        return queryClient.fetchQuery(
          queryKey,
          () => queryQueue.add(() => fn({ cmaClient }), { priority }),
          queryOptions
        );
      },
      [queryClient, queryQueue, cmaClient]
    );

    const getEntity = useCallback(
      function getEntity<E extends FetchableEntity>(
        entityType: FetchableEntityType,
        entityId: string,
        options?: GetEntityOptions
      ): QueryEntityResult<E> {
        const spaceId = options?.spaceId ?? currentSpaceId;
        const environmentId = options?.environmentId ?? currentEnvironmentId;
        const queryKey: EntityQueryKey = [entityType, entityId, spaceId, environmentId];

        return fetch(
          queryKey,
          ({ cmaClient }) => {
            if (entityType === 'Entry') {
              return cmaClient.entry.get({ entryId: entityId, spaceId, environmentId });
            }

            if (entityType === 'Asset') {
              return cmaClient.asset.get({ assetId: entityId, spaceId, environmentId });
            }

            throw new UnsupportedError('Unsupported entity type');
          },
          options
        );
      },
      [fetch, currentSpaceId, currentEnvironmentId]
    );

    const getEntityScheduledActions = useCallback(
      function getEntityScheduledActions(
        entityType: FetchableEntityType,
        entityId: string,
        options?: GetEntityOptions
      ): QueryEntityResult<ScheduledAction[]> {
        const spaceId = options?.spaceId ?? currentSpaceId;
        const environmentId = options?.environmentId ?? currentEnvironmentId;
        const queryKey: ScheduledActionsQueryKey = [
          'scheduled-actions',
          entityType,
          entityId,
          spaceId,
          environmentId,
        ];

        return fetch(
          queryKey,
          async ({ cmaClient }) => {
            const response = await cmaClient.scheduledActions.getMany({
              spaceId,
              query: {
                'environment.sys.id': environmentId,
                'entity.sys.id': entityId,
                'sys.status[in]': 'scheduled',
                order: 'scheduledFor.datetime',
              },
            });
            return response.items;
          },
          options
        );
      },
      [fetch, currentSpaceId, currentEnvironmentId]
    );

    const getResource = useCallback(
      function getResource<R extends Resource = Resource>(
        resourceType: ResourceType,
        urn: string,
        options?: GetResourceOptions
      ): QueryResourceResult<R> {
        const queryKey: ResourceQueryKey = ['Resource', resourceType, urn];
        return fetch(
          queryKey,
          () => {
            if (resourceType === 'Contentful:Entry') {
              return fetchContentfulEntry({
                fetch,
                urn,
                options,
              });
            }

            throw new UnsupportedError('Unsupported resource type');
          },
          options
        );
      },
      [fetch]
    );

    const isSameSpaceEntityQueryKey = useCallback(
      (queryKey: QueryKey) => {
        const isEntityKey = isEntityQueryKey(queryKey);
        const isSameSpaceEntityKey =
          isEntityKey && queryKey[2] === currentSpaceId && queryKey[3] === currentEnvironmentId;

        return isSameSpaceEntityKey;
      },
      [currentSpaceId, currentEnvironmentId]
    );
    // @ts-expect-error ...
    const onEntityChanged = props.sdk.space.onEntityChanged;

    useEffect(() => {
      if (typeof onEntityChanged !== 'function') {
        return;
      }

      const subscribeQuery = ({ queryKey, queryHash }: Query) => {
        const [entityType, entityId] = queryKey;
        entityChangeUnsubscribers.current[queryHash] = onEntityChanged(
          entityType,
          entityId,
          (data: unknown) => {
            queryClient.setQueryData(queryKey, data);
          }
        );
      };
      const queries: Query[] = queryCache.findAll({
        type: 'active',
        predicate: (query) => isSameSpaceEntityQueryKey(query.queryKey),
      });
      queries.forEach(subscribeQuery);

      const unsubscribe = queryCache.subscribe((event) => {
        if (!event) {
          return;
        }

        const { type, query } = event;
        const { queryKey, queryHash } = query;

        if (!isSameSpaceEntityQueryKey(queryKey)) {
          return;
        }

        if (type === 'added') {
          subscribeQuery(query);
        }

        if (type === 'removed') {
          // calling unsubscribe
          entityChangeUnsubscribers.current[queryHash]?.();
        }
      });

      return () => {
        unsubscribe();
        Object.values(entityChangeUnsubscribers.current).forEach((off) => off());
        entityChangeUnsubscribers.current = {};
      };
    }, [onEntityChanged, queryCache, isSameSpaceEntityQueryKey, queryClient]);

    return {
      cmaClient,
      fetch,
      getResource,
      getEntity,
      ids: props.sdk.ids,
      getEntityScheduledActions,
    };
  },
  ({ fetch }) => fetch,
  ({ getResource, getEntity, getEntityScheduledActions }) => ({
    getResource,
    getEntity,
    getEntityScheduledActions,
  }),
  ({ ids }) => ids
);

export function useEntity<E extends FetchableEntity>(
  entityType: FetchableEntityType,
  entityId: string,
  options?: UseEntityOptions
): UseEntityResult<E> {
  const { space, environment } = useCurrentIds();
  const { getEntity } = useEntityLoader();
  const queryKey: EntityQueryKey = [
    entityType,
    entityId,
    options?.spaceId ?? space,
    options?.environmentId ?? environment,
  ];
  const { status, data } = useQuery(queryKey, () => getEntity(entityType, entityId, options), {
    enabled: options?.enabled,
  });
  return { status, data } as UseEntityResult<E>;
}

export function useResource(resourceType: ResourceType, urn: string, options?: UseResourceOptions) {
  const queryKey: ResourceQueryKey = ['Resource', resourceType, urn];
  const { getResource } = useEntityLoader();
  const { status, data, error } = useQuery(
    queryKey,
    () => getResource(resourceType, urn, options),
    {
      enabled: options?.enabled,
    }
  );
  return { status, data, error };
}

function EntityProvider({ children, ...props }: React.PropsWithChildren<EntityStoreProps>) {
  const reactQueryClient = useMemo(() => {
    const queryCache = new QueryCache();
    const queryClient = new QueryClient({
      queryCache,
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

    return queryClient;
  }, []);

  return (
    <QueryClientProvider client={reactQueryClient}>
      <InternalServiceProvider {...props}>{children}</InternalServiceProvider>
    </QueryClientProvider>
  );
}

export { EntityProvider, useEntityLoader };
