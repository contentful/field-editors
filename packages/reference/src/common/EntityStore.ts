import * as React from 'react';
import { useMemo } from 'react';

import constate from 'constate';
import { createClient } from 'contentful-management';

import {
  Asset,
  BaseExtensionSDK,
  ContentType,
  Entity,
  Entry,
  Resource,
  ResourceType,
  ScheduledAction,
  Space,
} from '../types';

type EntriesMap = {
  [key: string]: 'failed' | undefined | Entry;
};

type AssetsMap = {
  [key: string]: 'failed' | undefined | Asset;
};

type ScheduledActionsMap = {
  [key: string]: ScheduledAction[] | undefined;
};

type ResourcesMap = {
  [key: string]: 'failed' | undefined | ResourceInfo;
};

type State = {
  entries: EntriesMap;
  assets: AssetsMap;
  scheduledActions: ScheduledActionsMap;
  resources: ResourcesMap;
};

type SetEntryAction = { type: 'set_entry'; id: string; entry: Entry };
type SetEntryFailedAction = { type: 'set_entry_failed'; id: string };

type SetAssetAction = { type: 'set_asset'; id: string; asset: Asset };
type SetAssetFailedAction = { type: 'set_asset_failed'; id: string };

type SetScheduledActionsAction = {
  type: 'set_scheduled_actions';
  key: string;
  actions: ScheduledAction[] | undefined;
};

type SetResourceAction = {
  type: 'set_resource';
  resourceType: ResourceType;
  urn: string;
  resourceInfo: ResourceInfo;
};
type SetResourceFailedAction = {
  type: 'set_resource_failed';
  resourceType: ResourceType;
  urn: string;
};

type DispatchAction =
  | SetEntryAction
  | SetEntryFailedAction
  | SetAssetAction
  | SetAssetFailedAction
  | SetScheduledActionsAction
  | SetResourceAction
  | SetResourceFailedAction;

export type ResourceInfo<R extends Resource = Resource> = {
  resource: R;
  defaultLocaleCode: string;
  contentType: ContentType;
  space: Space;
};
type ResourceResolver = (
  resourceType: ResourceType,
  urn: string
) => Promise<ResourceInfo | undefined>;

function reducer(state: State, action: DispatchAction): State {
  switch (action.type) {
    case 'set_entry':
      return {
        ...state,
        entries: {
          ...state.entries,
          [action.id]: action.entry,
        },
      };
    case 'set_entry_failed':
      return {
        ...state,
        entries: {
          ...state.entries,
          [action.id]: 'failed',
        },
      };
    case 'set_asset':
      return {
        ...state,
        assets: {
          ...state.assets,
          [action.id]: action.asset,
        },
      };
    case 'set_asset_failed':
      return {
        ...state,
        assets: {
          ...state.assets,
          [action.id]: 'failed',
        },
      };
    case 'set_scheduled_actions':
      return {
        ...state,
        scheduledActions: {
          ...state.scheduledActions,
          [action.key]: action.actions,
        },
      };
    case 'set_resource':
      return {
        ...state,
        resources: {
          ...state.resources,
          [`${action.resourceType}.${action.urn}`]: action.resourceInfo,
        },
      };
    case 'set_resource_failed':
      return {
        ...state,
        resources: {
          ...state.resources,
          [`${action.resourceType}.${action.urn}`]: 'failed',
        },
      };
    default:
      return state;
  }
}

const initialState: State = {
  entries: {},
  assets: {},
  scheduledActions: {},
  resources: {},
};

const isNotNil = <E>(entity: 'failed' | undefined | E): entity is E => {
  return Boolean(entity && entity !== 'failed');
};

const nonNilResources = <E extends Entity>(
  map: Record<string, 'failed' | undefined | E>
): [string, E][] => {
  return Object.entries(map).filter(([, value]) => isNotNil(value)) as [string, E][];
};

function useEntitiesStore(props: { sdk: BaseExtensionSDK }) {
  const spaceId = props.sdk.ids.space;
  const environmentId = props.sdk.ids.environment;
  const [cmaClient] = React.useState(() =>
    createClient({ apiAdapter: props.sdk.cmaAdapter }, { type: 'plain' })
  );
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const loadEntityScheduledActions = React.useCallback(
    (entityType: string, id: string) => {
      const key = `${entityType}:${id}`;
      if (state.scheduledActions[key]) {
        return Promise.resolve(state.scheduledActions[key] as ScheduledAction[]);
      }
      return props.sdk.space
        .getEntityScheduledActions(entityType, id)
        .then((data) => {
          dispatch({ type: 'set_scheduled_actions', key, actions: data });
          return data;
        })
        .catch(() => {
          dispatch({ type: 'set_scheduled_actions', key, actions: undefined });
          return [];
        });
    },
    [props.sdk.space, state.scheduledActions]
  );

  const loadEntry = React.useCallback(
    async (entryId: string) => {
      try {
        const entry = await cmaClient.entry.get({ spaceId, environmentId, entryId });
        dispatch({ type: 'set_entry', id: entryId, entry });
        return entry;
      } catch (error) {
        dispatch({ type: 'set_entry_failed', id: entryId });
        return;
      }
    },
    [cmaClient, spaceId, environmentId]
  );

  const getEntry = React.useCallback(
    async (entryId: string) => {
      const cachedEntry = state.entries[entryId];

      if (isNotNil(cachedEntry)) {
        return cachedEntry;
      }

      return loadEntry(entryId);
    },
    [loadEntry, state.entries]
  );

  const loadAsset = React.useCallback(
    async (assetId: string) => {
      try {
        const asset = await cmaClient.asset.get({ spaceId, environmentId, assetId });
        dispatch({ type: 'set_asset', id: assetId, asset });
        return asset;
      } catch (error) {
        dispatch({ type: 'set_asset_failed', id: assetId });
        return;
      }
    },
    [cmaClient, spaceId, environmentId]
  );

  const getAsset = React.useCallback(
    async (assetId: string) => {
      const cachedAsset = state.assets[assetId];

      if (isNotNil(cachedAsset)) {
        return cachedAsset;
      }

      return loadAsset(assetId);
    },
    [loadAsset, state.assets]
  );

  const loadContentfulEntry = React.useCallback(
    async (urn: string): Promise<ResourceInfo<Entry>> => {
      const resourceId = urn.split(':', 6)[5];
      const [, spaceId, , entryId] = resourceId.split('/');
      const environmentId = 'master';
      const [space, entry] = await Promise.all([
        await cmaClient.space.get({ spaceId }),
        await cmaClient.entry.get({ spaceId, environmentId, entryId }),
      ]);
      const contentTypeId = entry.sys.contentType.sys.id;
      const [contentType, locales] = await Promise.all([
        await cmaClient.contentType.get({
          contentTypeId,
          spaceId,
          environmentId,
        }),
        await cmaClient.locale.getMany({ spaceId, environmentId, query: { limit: 100 } }),
      ]);
      const defaultLocaleCode = locales.items.find((locale) => locale.default)?.code as string;

      return {
        resource: entry,
        defaultLocaleCode,
        space,
        contentType,
      };
    },
    [cmaClient]
  );

  const getResource = React.useCallback(
    async (resourceType: ResourceType, urn: string) => {
      const cachedResource = state.resources[`${resourceType}.${urn}`];

      if (isNotNil(cachedResource)) {
        return cachedResource;
      }

      try {
        let resourceInfo;

        if (resourceType === 'Contentful:Entry') {
          resourceInfo = await loadContentfulEntry(urn);
        }

        dispatch({
          type: 'set_resource',
          resourceType,
          urn,
          resourceInfo: resourceInfo as ResourceInfo,
        });

        return resourceInfo;
      } catch (error) {
        dispatch({ type: 'set_resource_failed', resourceType, urn });
        return;
      }
    },
    [loadContentfulEntry, state.resources]
  ) as ResourceResolver;

  React.useEffect(() => {
    // @ts-expect-error
    if (typeof props.sdk.space.onEntityChanged !== 'undefined') {
      // @ts-expect-error
      const onEntityChanged = props.sdk.space.onEntityChanged;
      const listeners: Function[] = [];

      for (const [id] of nonNilResources(state.entries)) {
        listeners.push(
          onEntityChanged('Entry', id, (entry: Entry) => dispatch({ type: 'set_entry', id, entry }))
        );
      }

      for (const [id] of nonNilResources(state.assets)) {
        listeners.push(
          onEntityChanged('Asset', id, (asset: Asset) => dispatch({ type: 'set_asset', id, asset }))
        );
      }

      return () => listeners.forEach((off) => off());
    }

    return props.sdk.navigator.onSlideInNavigation(({ oldSlideLevel, newSlideLevel }) => {
      if (oldSlideLevel > newSlideLevel) {
        for (const [id] of nonNilResources(state.entries)) {
          loadEntry(id);
        }

        for (const [id] of nonNilResources(state.assets)) {
          loadAsset(id);
        }
      }
    }) as { (): void };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [props.sdk, state.assets, state.entries]);

  return useMemo(
    () => ({
      /**
       * @deprecated use `getEntry` instead
       */
      getOrLoadEntry: getEntry,
      /**
       * @deprecated use `getAsset` instead
       */
      getOrLoadAsset: getAsset,
      getResource,
      getEntry,
      getAsset,
      loadEntityScheduledActions,
      entries: state.entries,
      assets: state.assets,
      scheduledActions: state.scheduledActions,
      resources: state.resources,
    }),
    [
      getResource,
      getEntry,
      getAsset,
      loadEntityScheduledActions,
      state.entries,
      state.assets,
      state.scheduledActions,
      state.resources,
    ]
  );
}

const [EntityProvider, useEntities] = constate(useEntitiesStore);

export { EntityProvider, useEntities };
