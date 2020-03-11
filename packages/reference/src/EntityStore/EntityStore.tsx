import * as React from 'react';
import { BaseExtensionSDK, Entry, Asset } from '../types';
import constate from 'constate';

type EntriesMap = {
  [key: string]: 'failed' | undefined | Entry;
};

type AssetsMap = {
  [key: string]: 'failed' | undefined | Asset;
};

function useEntries(props: { sdk: BaseExtensionSDK }) {
  const [entries, setEntries] = React.useState<EntriesMap>({});

  const loadEntry = React.useCallback((id: string) => {
    props.sdk.space
      .getEntry<Entry>(id)
      .then(entry => {
        setEntries({
          ...entries,
          [id]: entry
        });
      })
      .catch(() => {
        setEntries({
          ...entries,
          [id]: 'failed'
        });
      });
  }, []);

  const setEntry = React.useCallback((id: string, entry: Entry) => {
    setEntries({
      ...entries,
      [id]: entry
    });
  }, []);

  return { loadEntry, setEntry, entries };
}

function useAssets(props: { sdk: BaseExtensionSDK }) {
  const [assets, setAssets] = React.useState<AssetsMap>({});

  const loadAsset = React.useCallback((id: string) => {
    props.sdk.space
      .getAsset<Asset>(id)
      .then(asset => {
        setAssets({
          ...assets,
          [id]: asset
        });
      })
      .catch(() => {
        setAssets({
          ...assets,
          [id]: 'failed'
        });
      });
  }, []);

  const setAsset = React.useCallback((id: string, asset: Asset) => {
    setAssets({
      ...assets,
      [id]: asset
    });
  }, []);

  return { loadAsset, setAsset, assets };
}

const [EntriesProvider, useEntriesStore] = constate(useEntries);
const [AssetsProvider, useAssetsStore] = constate(useAssets);

export { EntriesProvider, useEntriesStore, AssetsProvider, useAssetsStore };
