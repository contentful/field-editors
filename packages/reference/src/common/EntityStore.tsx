import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { BaseAppSDK } from '@contentful/app-sdk';
import {
  createGetContentTypeKey,
  createGetEntryKey,
  createGetSpaceKey,
} from '@contentful/field-editor-shared';
import { FetchQueryOptions, Query, QueryClient, QueryKey } from '@tanstack/react-query';
import constate from 'constate';
import {
  BasicCursorPaginationOptions,
  PlainClientAPI,
  ResourceProvider,
  fetchAll,
} from 'contentful-management';
import { get } from 'lodash';
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
  queryClient?: QueryClient;
};

type FetchService = ReturnType<typeof useFetch>;

type GetOptions = {
  priority?: number;
};

type GetEntityOptions = GetOptions & {
  spaceId?: string;
  environmentId?: string;
  releaseId?: string;
};

type UseEntityOptions = GetEntityOptions & { enabled?: boolean };

type QueryEntityResult<E> = Promise<E>;

type GetResourceOptions = GetOptions & {
  allowExternal?: boolean;
  locale?: string;
  referencingEntryId?: string;
};

type QueryResourceResult<R extends Resource = Resource> = QueryEntityResult<ResourceInfo<R>>;

type UseResourceOptions = GetResourceOptions & { enabled?: boolean };

// all types of the union share the data property to ease destructuring downstream
type UseEntityResult<E> =
  | { status: 'idle'; data: never; currentEntity: never }
  | { status: 'loading'; data: never; currentEntity: never }
  | { status: 'error'; data: never; currentEntity: never }
  | { status: 'success'; data: E; currentEntity?: E };

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
  releaseId: string | undefined,
];

type ResourceProviderQueryKey = [
  ident: 'ResourceProvider',
  organizationId: string,
  appDefinitionId: string,
];

type ScheduledActionsQueryKey = [
  'spaces',
  string,
  'scheduled_actions',
  { query: Record<string, unknown> },
];

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
    // length === 4 when releaseId is not present, length === 5 when releaseId is present
    (queryKey.length === 4 || queryKey.length === 5)
  );
};

type ResourceQueryKey = [
  ident: 'Resource',
  resourceType: string,
  urn: string,
  locale: string | undefined,
  referencingEntryId: string | undefined,
  spaceId: string,
  environmentId: string,
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
    fetch(createGetSpaceKey(spaceId), ({ cmaClient }) => cmaClient.space.get({ spaceId }), options),
    fetch(
      createGetEntryKey(spaceId, environmentId, entryId),
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
      createGetContentTypeKey(spaceId, environmentId, contentTypeId),
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
  referencingEntryId,
}: FetchParams & {
  spaceId: string;
  environmentId: string;
  resourceType: string;
  locale?: string;
  referencingEntryId?: string;
}): Promise<ResourceInfo<ExternalResource>> {
  let resourceFetchError: unknown;
  const [resource, resourceTypes] = await Promise.all([
    fetch(
      ['resource', spaceId, environmentId, resourceType, urn, locale, referencingEntryId],
      ({ cmaClient }): Promise<ExternalResource | null> =>
        cmaClient.resource
          .getMany({
            spaceId,
            environmentId,
            resourceTypeId: resourceType,
            query: { 'sys.urn[in]': urn, locale, referencingEntryId },
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
    fetch(['resource-types', spaceId, environmentId], ({ cmaClient }) => {
      return fetchAll(
        ({ query }: { query?: BasicCursorPaginationOptions }) =>
          cmaClient.resourceType.getForEnvironment({ spaceId, environmentId, query }),
        {},
      );
    }),
  ]);

  const resourceTypeEntity = resourceTypes.find((rt: ResourceType) => rt.sys.id === resourceType);

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
    const cmaClient = props.sdk.cma as unknown as PlainClientAPI;
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

    const isReleaseRequestError = useCallback(
      function isReleaseRequestError(
        error: unknown,
        spaceId?: string,
        environmentId?: string,
      ): boolean {
        return (
          !!releaseId &&
          (!spaceId || spaceId === currentSpaceId) &&
          (!environmentId || environmentId === currentEnvironmentId) &&
          error instanceof Error &&
          error.message.includes('The resource could not be found')
        );
      },
      [releaseId, currentSpaceId, currentEnvironmentId],
    );

    const getEntity = useCallback(
      function getEntity<E extends FetchableEntity>(
        entityType: FetchableEntityType,
        entityId: string,
        releaseId?: string,
        options?: GetEntityOptions,
      ): QueryEntityResult<E> {
        const spaceId = options?.spaceId ?? currentSpaceId;
        const environmentId = options?.environmentId ?? currentEnvironmentId;
        const queryKey: EntityQueryKey = [entityType, entityId, spaceId, environmentId, releaseId];

        return fetch(
          queryKey,
          async ({ cmaClient }) => {
            if (entityType === 'Entry') {
              try {
                const entity = await cmaClient.entry.get({
                  entryId: entityId,
                  spaceId,
                  environmentId,
                  releaseId,
                });
                return entity;
              } catch (error) {
                // Fallback if the entity is not part of the release yet
                if (isReleaseRequestError(error, spaceId, environmentId)) {
                  const currentEntry = await cmaClient.entry.get({
                    entryId: entityId,
                    spaceId,
                    environmentId,
                    releaseId: undefined,
                  });
                  currentEntry.sys.release = {
                    sys: { type: 'Link', linkType: 'Release', id: releaseId! },
                  };
                  return currentEntry;
                }
                throw error;
              }
            }

            if (entityType === 'Asset') {
              try {
                const entity = await cmaClient.asset.get({
                  assetId: entityId,
                  spaceId,
                  environmentId,
                  releaseId,
                });
                return entity;
              } catch (error) {
                // Fallback if the entity is not part of the release yet
                if (isReleaseRequestError(error, spaceId, environmentId)) {
                  const currentAsset = await cmaClient.asset.get({
                    assetId: entityId,
                    spaceId,
                    environmentId,
                    releaseId: undefined,
                  });
                  currentAsset.sys.release = {
                    sys: { type: 'Link', linkType: 'Release', id: releaseId! },
                  };
                  return currentAsset;
                }
                throw error;
              }
            }

            throw new UnsupportedError('Unsupported entity type');
          },
          options,
        );
      },
      [fetch, currentSpaceId, currentEnvironmentId, isReleaseRequestError],
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
        _: FetchableEntityType,
        entityId: string,
        options?: GetEntityOptions,
      ): QueryEntityResult<ScheduledAction[]> {
        // Inside of the release context, the scheduled actions are not available
        if (releaseId) {
          return new Promise<ScheduledAction[]>((resolve) => resolve([]));
        }

        // A space+environment combo can only have up to 1000 scheduled actions
        // With this request we fetch all schedules and can reuse the results.
        // See https://www.contentful.com/developers/docs/references/content-management-api/#/reference/scheduled-actions/limitations
        const maxScheduledActions = 1000;
        const spaceId = options?.spaceId ?? currentSpaceId;
        const environmentId = options?.environmentId ?? currentEnvironmentId;
        const query = {
          'environment.sys.id': environmentId,
          'sys.status': 'scheduled',
          'entity.sys.linkType[in]': 'Entry,Asset',
          order: '-scheduledFor.datetime',
          limit: maxScheduledActions,
        };
        const queryKey: ScheduledActionsQueryKey = [
          'spaces',
          spaceId,
          'scheduled_actions',
          { query },
        ];

        // Fetch + Filter by entity ID in the end
        return fetch(
          queryKey,
          async ({ cmaClient }) => {
            const response = await cmaClient.scheduledActions.getMany({ spaceId, query });
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
        const queryKey: ResourceQueryKey = [
          'Resource',
          resourceType,
          urn,
          options?.locale,
          options?.referencingEntryId,
          currentSpaceId,
          currentEnvironmentId,
        ];
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
              referencingEntryId: options?.referencingEntryId,
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
        const queries = queryCache.findAll({
          predicate: (query: Query) => isSameSpaceEntityQueryKey(query.queryKey),
        });
        return queries;
      }

      if (typeof onEntityChanged !== 'function') {
        return onSlideInNavigation(async ({ oldSlideLevel, newSlideLevel }) => {
          if (oldSlideLevel > newSlideLevel) {
            // Fetch fresh data and update cache directly for all matching queries
            const queries = findSameSpaceQueries();
            await Promise.all(
              queries.map(async (query) => {
                const [entityType, entityId, spaceId, environmentId, releaseId] = query.queryKey;
                try {
                  // Fetch fresh data directly from CMA client bypassing cache
                  let freshData;
                  if (entityType === 'Entry') {
                    freshData = await cmaClient.entry.get({
                      entryId: entityId as string,
                      spaceId: spaceId as string,
                      environmentId: environmentId as string,
                      releaseId: releaseId as string | undefined,
                    });
                  } else if (entityType === 'Asset') {
                    freshData = await cmaClient.asset.get({
                      assetId: entityId as string,
                      spaceId: spaceId as string,
                      environmentId: environmentId as string,
                      releaseId: releaseId as string | undefined,
                    });
                  } else {
                    // For other entity types, just invalidate
                    await queryClient.invalidateQueries(query.queryKey);
                    return;
                  }
                  queryClient.setQueryData(query.queryKey, freshData);
                } catch (error) {
                  // If fetch fails, just invalidate the query
                  await queryClient.invalidateQueries(query.queryKey);
                }
              }),
            );
          }
        }) as { (): void };
      }

      const subscribeQuery = ({ queryKey, queryHash }: Query) => {
        const [entityType, entityId, , , releaseId] = queryKey;
        entityChangeUnsubscribers.current[queryHash] = onEntityChanged(
          entityType,
          entityId,
          (data: unknown) => {
            const dataReleaseId = get(data, 'sys.release.id');
            if (dataReleaseId === releaseId) {
              queryClient.setQueryData(queryKey, data);
            } else if (releaseId && !dataReleaseId) {
              // Entity was updated but response doesn't include release info
              // Invalidate the query to refetch with release context
              void queryClient.invalidateQueries(queryKey);
            }
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
      cmaClient,
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
    releaseId: ids.release,
  }),
);

export function useEntity<E extends FetchableEntity>(
  entityType: FetchableEntityType,
  entityId: string,
  options?: Omit<UseEntityOptions, 'releaseId'>,
): UseEntityResult<E> {
  const { space, environment, releaseId } = useCurrentIds();
  const { getEntity } = useEntityLoader();
  const { status, data } = useQuery(
    [
      entityType,
      entityId,
      options?.spaceId ?? space,
      options?.environmentId ?? environment,
      ...(releaseId ? [releaseId] : []),
    ],
    () => getEntity(entityType, entityId, releaseId, options),
    {
      enabled: options?.enabled,
    },
  );

  const { data: currentEntity } = useQuery(
    [
      entityType,
      entityId,
      options?.spaceId ?? space,
      options?.environmentId ?? environment,
      undefined,
    ],
    () => getEntity(entityType, entityId, undefined, options),
    {
      enabled: options?.enabled && !!releaseId,
    },
  );

  return { status, data, currentEntity } as UseEntityResult<E>;
}

export function useResource<R extends Resource = Resource>(
  resourceType: string,
  urn: string,
  { locale, referencingEntryId, ...options }: UseResourceOptions = {},
) {
  if (resourceType.startsWith('Contentful:')) {
    locale = undefined;
    referencingEntryId = undefined;
  }
  const { space, environment } = useCurrentIds();
  const queryKey: ResourceQueryKey = [
    'Resource',
    resourceType,
    urn,
    locale,
    referencingEntryId,
    space,
    environment,
  ];
  const { getResource } = useEntityLoader();
  const { status, data, error } = useQuery(
    queryKey,
    () => getResource<R>(resourceType, urn, { ...options, locale, referencingEntryId }),
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
    <SharedQueryClientProvider client={props.queryClient}>
      <InternalServiceProvider {...props}>{children}</InternalServiceProvider>
    </SharedQueryClientProvider>
  );
}

export { EntityProvider, useEntityLoader };
