import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { BaseAppSDK } from '@contentful/app-sdk';
import { FetchQueryOptions, Query, QueryKey } from '@tanstack/react-query';
import constate from 'constate';
import { PlainClientAPI, ResourceProvider, fetchAll } from 'contentful-management';
import PQueue from 'p-queue';

import {
  Asset,
  ContentType,
  Entry,
  ExternalResource,
  Resource,
  ResourceType,
  ScheduledAction,
  Space,
} from '../types';
import { SharedQueryClientProvider, useQuery, useQueryClient } from './queryClient';

export type ContentfulResourceInfo = {
  resource: Entry;
  defaultLocaleCode: string;
  contentType: ContentType;
  space: Space;
};
export type ExternalResourceInfo = {
  resource: ExternalResource;
  resourceType: ResourceType;
};

export type ResourceInfo<R extends Resource = Resource> = R extends Entry
  ? ContentfulResourceInfo
  : ExternalResourceInfo;

export function isContentfulResourceInfo(info: ResourceInfo): info is ContentfulResourceInfo {
  return info.resource.sys.type === 'Entry';
}

// global queue for all requests, the actual number is picked without scientific research
const globalQueue = new PQueue({ concurrency: 50 });

type EntityStoreProps = {
  sdk: BaseAppSDK;
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

type GetResourceOptions = GetOptions & { allowExternal?: boolean; locale?: string };

type QueryResourceResult<R extends Resource = Resource> = QueryEntityResult<ResourceInfo<R>>;

type UseResourceOptions = GetResourceOptions & { enabled?: boolean; locale?: string };

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
  TQueryKey extends QueryKey = QueryKey,
> = FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey> & GetOptions;
type FetchParams = { fetch: FetchService; urn: string; options?: GetOptions };

type FetchableEntityType = 'Entry' | 'Asset';
type FetchableEntity = Entry | Asset;

type EntityQueryKey = [
  entityType: FetchableEntityType,
  entityId: string,
  spaceId: string,
  environmentId: string,
];

type ResourceProviderQueryKey = [
  ident: 'ResourceProvider',
  organizationId: string,
  appDefinitionId: string,
];

type ScheduledActionsQueryKey = ['scheduled-actions', ...EntityQueryKey];

export type FunctionInvocationErrorResponse = {
  status: number;
  statusText: string;
  message:
    | 'Response payload of the Contentful Function is invalid'
    | 'An error occurred while executing the Contentful Function code';
  request: {
    url: string;
    headers: Record<string, string>;
    method: string;
  };
};

function isFunctionInvocationErrorResponse(
  response: unknown,
): response is FunctionInvocationErrorResponse {
  const functionInvocationErrorMessages = [
    'An error occurred while executing the Contentful Function code',
    'Response payload of the Contentful Function is invalid',
  ];
  return (
    response !== null &&
    typeof response === 'object' &&
    'message' in response &&
    typeof response.message === 'string' &&
    functionInvocationErrorMessages.includes(response.message)
  );
}

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

export class FunctionInvocationError extends Error {
  isFunctionInvocationError: boolean;
  organizationId: string;
  appDefinitionId: string;
  constructor(message: string, organizationId: string, appDefinitionId: string) {
    super(message);
    this.isFunctionInvocationError = true;
    this.organizationId = organizationId;
    this.appDefinitionId = appDefinitionId;
  }
}

export function isFunctionInvocationError(value: unknown): value is FunctionInvocationError {
  return (
    typeof value === 'object' &&
    (value as FunctionInvocationError | null)?.isFunctionInvocationError === true
  );
}

function handleResourceFetchError(
  resourceFetchError: Error,
  resourceTypeEntity: ResourceType,
): void {
  const parsedError = JSON.parse(resourceFetchError.message);
  if (isFunctionInvocationErrorResponse(parsedError)) {
    const organizationId = resourceTypeEntity.sys.organization?.sys.id;
    const appDefinitionId = resourceTypeEntity.sys.appDefinition?.sys.id;

    if (!organizationId || !appDefinitionId) throw new Error('Missing resource');

    throw new FunctionInvocationError(resourceFetchError.message, organizationId, appDefinitionId);
  }

  // Rethrow original error if it's not a function invocation error
  throw resourceFetchError;
}

const isEntityQueryKey = (queryKey: QueryKey): queryKey is EntityQueryKey => {
  return (
    Array.isArray(queryKey) &&
    (queryKey[0] === 'Entry' || queryKey[0] === 'Asset') &&
    queryKey.length === 4
  );
};

type ResourceQueryKey = [
  ident: 'Resource',
  resourceType: string,
  urn: string,
  locale: string | undefined,
];

async function fetchContentfulEntry({
  urn,
  fetch,
  options,
}: FetchParams): Promise<ResourceInfo<Entry>> {
  // TODO use resource-names package EntryResourceName `fromString` method instead when the package becomes public
  const resourceId = urn.split(':', 6)[5];
  const ENTITY_RESOURCE_ID_REGEX =
    /^spaces\/(?<spaceId>[^/]+)(?:\/environments\/(?<environmentId>[^/]+))?\/entries\/(?<entityId>[^/]+)$/;
  const resourceIdMatch = resourceId?.match(ENTITY_RESOURCE_ID_REGEX);
  if (!resourceIdMatch || !resourceIdMatch?.groups?.spaceId || !resourceIdMatch?.groups?.entityId) {
    throw new Error('Not a valid crn');
  }
  const spaceId = resourceIdMatch.groups.spaceId;
  const environmentId = resourceIdMatch?.groups?.environmentId || 'master';
  const entryId = resourceIdMatch.groups.entityId;

  const [space, entry] = await Promise.all([
    fetch(['space', spaceId], ({ cmaClient }) => cmaClient.space.get({ spaceId }), options),
    fetch(
      ['entry', spaceId, environmentId, entryId],
      ({ cmaClient }) =>
        cmaClient.entry.get({
          spaceId,
          environmentId,
          entryId,
        }),
      options,
    ),
  ]);
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
      options,
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
      options,
    ),
  ]);

  return {
    defaultLocaleCode,
    resource: entry,
    space: space,
    contentType: contentType,
  };
}

async function fetchExternalResource({
  urn,
  fetch,
  options,
  spaceId,
  environmentId,
  resourceType,
  locale,
}: FetchParams & {
  spaceId: string;
  environmentId: string;
  resourceType: string;
  locale?: string;
}): Promise<ResourceInfo<ExternalResource>> {
  let resourceFetchError: unknown;
  const [resource, resourceTypes] = await Promise.all([
    fetch(
      ['resource', spaceId, environmentId, resourceType, urn, locale],
      ({ cmaClient }): Promise<ExternalResource | null> =>
        cmaClient.resource
          .getMany({
            spaceId,
            environmentId,
            resourceTypeId: resourceType,
            query: { 'sys.urn[in]': urn, locale },
          })
          .then(({ items }) => {
            return items[0] ?? null;
          })
          .catch((e) => {
            /*
            We're storing the error in this variable
            so we can use the data returned by the
            resourceType CMA client call in our
            error handling logic later.
            */
            resourceFetchError = e;
            return null;
          }),
      options,
    ),
    fetch(['resource-types', spaceId, environmentId], ({ cmaClient }) =>
      fetchAll(
        ({ query }) => cmaClient.resourceType.getForEnvironment({ spaceId, environmentId, query }),
        {},
      ),
    ),
  ]);

  const resourceTypeEntity = resourceTypes.find((rt) => rt.sys.id === resourceType);

  if (!resourceTypeEntity) {
    throw new UnsupportedError('Unsupported resource type');
  }

  if (resourceFetchError instanceof Error) {
    handleResourceFetchError(resourceFetchError, resourceTypeEntity);
  }

  if (!resource) {
    throw new Error('Missing resource');
  }

  return {
    resource,
    resourceType: resourceTypeEntity,
  };
}

const [InternalServiceProvider, useFetch, useEntityLoader, useCurrentIds] = constate(
  function useInitServices(props: EntityStoreProps) {
    const currentSpaceId = props.sdk.ids.space;
    const currentEnvironmentId = props.sdk.ids.environmentAlias ?? props.sdk.ids.environment;
    const releaseId = props.sdk.ids.release;

    const environmentIds = useMemo(
      () => [props.sdk.ids.environmentAlias, props.sdk.ids.environment],
      [props.sdk.ids.environmentAlias, props.sdk.ids.environment],
    );
    const queryClient = useQueryClient();
    const queryCache = queryClient.getQueryCache();
    const entityChangeUnsubscribers = useRef<Record<string, Function>>({});
    const cmaClient = props.sdk.cma as PlainClientAPI;
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
        TQueryKey extends QueryKey = QueryKey,
      >(
        queryKey: TQueryKey,
        fn: FetchFunction<TQueryFnData>,
        options: FetchServiceOptions<TQueryFnData, TError, TData, TQueryKey> = {},
      ) {
        const { priority, ...queryOptions } = options;
        return queryClient.fetchQuery(
          queryKey,
          () => queryQueue.add(() => fn({ cmaClient }), { priority }),
          queryOptions,
        );
      },
      [queryClient, queryQueue, cmaClient],
    );

    const getEntity = useCallback(
      function getEntity<E extends FetchableEntity>(
        entityType: FetchableEntityType,
        entityId: string,
        options?: GetEntityOptions,
      ): QueryEntityResult<E> {
        const spaceId = options?.spaceId ?? currentSpaceId;
        const environmentId = options?.environmentId ?? currentEnvironmentId;
        const queryKey: EntityQueryKey = [entityType, entityId, spaceId, environmentId];

        return fetch(
          queryKey,
          // @ts-expect-error
          ({ cmaClient }) => {
            if (entityType === 'Entry') {
              return cmaClient.entry.get({ entryId: entityId, spaceId, environmentId });
            }

            if (entityType === 'Asset') {
              return cmaClient.asset.get({ assetId: entityId, spaceId, environmentId });
            }

            throw new UnsupportedError('Unsupported entity type');
          },
          options,
        );
      },
      [fetch, currentSpaceId, currentEnvironmentId],
    );

    /**
     * Fetch all scheduled actions for a given entity.
     * This function fetches all schedules for all entries and then returns
     * a filtered result based on the entityID provided.
     *
     * The result is then reused/cached for subsequent calls to this function.
     */
    const getEntityScheduledActions = useCallback(
      function getEntityScheduledActions(
        entityType: FetchableEntityType,
        entityId: string,
        options?: GetEntityOptions,
      ): QueryEntityResult<ScheduledAction[]> {
        // Inside of the release context, the scheduled actions are not available
        if (releaseId) {
          return new Promise<ScheduledAction[]>((resolve) => resolve([]));
        }

        // This is fixed to force the cache to reuse previous results
        const fixedEntityCacheId = 'scheduledActionEntityId';

        // A space+environment combo can only have up to 500 scheduled actions
        // With this request we fetch all schedules and can reuse the results.
        // See https://www.contentful.com/developers/docs/references/content-management-api/#/reference/scheduled-actions/limitations
        const maxScheduledActions = 500;
        const spaceId = options?.spaceId ?? currentSpaceId;
        const environmentId = options?.environmentId ?? currentEnvironmentId;
        const queryKey: ScheduledActionsQueryKey = [
          'scheduled-actions',
          entityType,
          fixedEntityCacheId,
          spaceId,
          environmentId,
        ];

        // Fetch + Filter by entity ID in the end
        return fetch(
          queryKey,
          async ({ cmaClient }) => {
            const response = await cmaClient.scheduledActions.getMany({
              spaceId,
              query: {
                'environment.sys.id': environmentId,
                'sys.status[in]': 'scheduled',
                order: 'scheduledFor.datetime',
                limit: maxScheduledActions,
              },
            });

            return response.items;
          },
          options,
        ).then((items) => items.filter((action) => action.entity.sys.id === entityId));
      },
      [fetch, currentSpaceId, currentEnvironmentId, releaseId],
    );

    const getResource = useCallback(
      function getResource<R extends Resource = Resource>(
        resourceType: string,
        urn: string,
        options?: GetResourceOptions,
      ): QueryResourceResult<R> {
        const queryKey: ResourceQueryKey = ['Resource', resourceType, urn, options?.locale];
        return fetch(
          queryKey,
          (): Promise<ResourceInfo> => {
            if (resourceType === 'Contentful:Entry') {
              return fetchContentfulEntry({
                fetch,
                urn,
                options,
              });
            }

            if (!options?.allowExternal) {
              throw new UnsupportedError('Unsupported resource type');
            }

            return fetchExternalResource({
              fetch,
              urn,
              locale: options?.locale,
              options,
              resourceType,
              spaceId: currentSpaceId,
              environmentId: currentEnvironmentId,
            });
          },
          options,
        );
      },
      [currentEnvironmentId, currentSpaceId, fetch],
    );

    const isSameSpaceEntityQueryKey = useCallback(
      (queryKey: QueryKey) => {
        const isEntityKey = isEntityQueryKey(queryKey);
        const isSameSpaceEntityKey =
          isEntityKey && queryKey[2] === currentSpaceId && environmentIds.includes(queryKey[3]);

        return isSameSpaceEntityKey;
      },
      [currentSpaceId, environmentIds],
    );
    // @ts-expect-error ...
    const onEntityChanged = props.sdk.space.onEntityChanged;
    const onSlideInNavigation = props.sdk.navigator.onSlideInNavigation;

    useEffect(() => {
      function findSameSpaceQueries(): Query[] {
        return queryCache.findAll({
          type: 'active',
          predicate: (query) => isSameSpaceEntityQueryKey(query.queryKey),
        });
      }

      if (typeof onEntityChanged !== 'function') {
        return onSlideInNavigation(({ oldSlideLevel, newSlideLevel }) => {
          if (oldSlideLevel > newSlideLevel) {
            findSameSpaceQueries().forEach((query) => {
              // automatically refetches the query
              void queryClient.invalidateQueries(query.queryKey);
            });
          }
        }) as { (): void };
      }

      const subscribeQuery = ({ queryKey, queryHash }: Query) => {
        const [entityType, entityId] = queryKey;
        entityChangeUnsubscribers.current[queryHash] = onEntityChanged(
          entityType,
          entityId,
          (data: unknown) => {
            queryClient.setQueryData(queryKey, data);
          },
        );
      };
      findSameSpaceQueries().forEach(subscribeQuery);

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
    }, [
      onEntityChanged,
      queryCache,
      isSameSpaceEntityQueryKey,
      queryClient,
      getEntity,
      onSlideInNavigation,
    ]);

    const getResourceProvider = useCallback(
      function getResourceProvider(
        organizationId: string,
        appDefinitionId: string,
      ): QueryEntityResult<ResourceProvider> {
        const queryKey: ResourceProviderQueryKey = [
          'ResourceProvider',
          organizationId,
          appDefinitionId,
        ];
        return fetch(queryKey, async ({ cmaClient }) => {
          return cmaClient.resourceProvider.get({
            organizationId,
            appDefinitionId,
          });
        });
      },
      [fetch],
    );

    return {
      ids: props.sdk.ids,
      cmaClient,
      fetch,
      getResource,
      getEntity,
      getEntityScheduledActions,
      getResourceProvider,
    };
  },
  ({ fetch }) => fetch,
  ({ getResource, getEntity, getEntityScheduledActions, getResourceProvider }) => ({
    getResource,
    getEntity,
    getEntityScheduledActions,
    getResourceProvider,
  }),
  ({ ids }) => ({
    environment: ids.environmentAlias ?? ids.environment,
    space: ids.space,
  }),
);

export function useEntity<E extends FetchableEntity>(
  entityType: FetchableEntityType,
  entityId: string,
  options?: UseEntityOptions,
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

export function useResource<R extends Resource = Resource>(
  resourceType: string,
  urn: string,
  { locale, ...options }: UseResourceOptions = {},
) {
  if (resourceType.startsWith('Contentful:')) {
    locale = undefined;
  }
  const queryKey: ResourceQueryKey = ['Resource', resourceType, urn, locale];
  const { getResource } = useEntityLoader();
  const { status, data, error } = useQuery(
    queryKey,
    () => getResource<R>(resourceType, urn, { ...options, locale }),
    {
      enabled: options?.enabled,
    },
  );

  return { status, data, error };
}

export function useResourceProvider(organizationId: string, appDefinitionId: string) {
  const queryKey = ['Resource', organizationId, appDefinitionId];
  const { getResourceProvider } = useEntityLoader();
  const { status, data, error } = useQuery(
    queryKey,
    () => getResourceProvider(organizationId, appDefinitionId),
    {},
  );

  return { status, data, error };
}

function EntityProvider({ children, ...props }: React.PropsWithChildren<EntityStoreProps>) {
  return (
    <SharedQueryClientProvider>
      <InternalServiceProvider {...props}>{children}</InternalServiceProvider>
    </SharedQueryClientProvider>
  );
}

export { EntityProvider, useEntityLoader };
