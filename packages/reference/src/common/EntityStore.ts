import * as React from 'react';
import { BaseExtensionSDK, Entry, Asset } from '../types';
import constate from 'constate';

type EntriesMap = {
  [key: string]: 'failed' | undefined | Entry;
};

type AssetsMap = {
  [key: string]: 'failed' | undefined | Asset;
};

type State = {
  entries: EntriesMap;
  assets: AssetsMap;
};

type DispatchAction =
  | { type: 'set_entry'; id: string; entry: Entry }
  | { type: 'set_entry_failed'; id: string }
  | { type: 'set_asset'; id: string; asset: Asset }
  | { type: 'set_asset_failed'; id: string };

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
    default:
      return state;
  }
}

const initialState: State = {
  entries: {},
  assets: {},
};

function useEntitiesStore(props: { sdk: BaseExtensionSDK }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const loadEntry = (id: string) => {
    props.sdk.space
      .getEntry<Entry>(id)
      .then((entry) => {
        dispatch({ type: 'set_entry', id, entry });
      })
      .catch(() => {
        dispatch({ type: 'set_entry_failed', id });
      });
  };

  const loadAsset = (id: string) => {
    props.sdk.space
      .getAsset<Asset>(id)
      .then((asset) => {
        dispatch({ type: 'set_asset', id, asset });
      })
      .catch(() => {
        dispatch({ type: 'set_asset_failed', id });
      });
  };

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (typeof props.sdk.space.onEntityChanged !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const onEntityChanged = props.sdk.space.onEntityChanged;
      const listeners: Function[] = [];
      Object.keys(state.entries).forEach((id) => {
        if (state.entries[id] && state.entries['id'] !== 'failed') {
          listeners.push(
            onEntityChanged('Entry', id, (entry: Entry) =>
              dispatch({ type: 'set_entry', id, entry })
            )
          );
        }
      });
      Object.keys(state.assets).forEach((id) => {
        if (state.assets[id] && state.assets['id'] !== 'failed') {
          listeners.push(
            onEntityChanged('Asset', id, (asset: Asset) =>
              dispatch({ type: 'set_asset', id, asset })
            )
          );
        }
      });

      return () => listeners.forEach((off) => off());
    }

    return props.sdk.navigator.onSlideInNavigation(({ oldSlideLevel, newSlideLevel }) => {
      if (oldSlideLevel > newSlideLevel) {
        Object.keys(state.entries).map((id) => {
          if (state.entries[id] && state.entries[id] !== 'failed') {
            loadEntry(id);
          }
        });
        Object.keys(state.assets).map((id) => {
          if (state.assets[id] && state.assets[id] !== 'failed') {
            loadAsset(id);
          }
        });
      }
    }) as { (): void };
  }, [props.sdk, state.assets, state.entries]);

  return { loadEntry, loadAsset, ...state };
}

const [EntityProvider, useEntities] = constate(useEntitiesStore);

export { EntityProvider, useEntities };
