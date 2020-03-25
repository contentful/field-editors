import * as React from 'react';
import { BaseExtensionSDK, Entry, Asset } from '../types';
import constate from 'constate';

type EntriesMap = {
  [key: string]: 'failed' | undefined | Entry;
};

type AssetsMap = {
  [key: string]: 'failed' | undefined | Asset;
};

function useEntriesStore(props: { sdk: BaseExtensionSDK }) {
  const [entries, setEntries] = React.useState<EntriesMap>({});

  const loadEntry = (id: string) => {
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
  };

  const setEntry = (id: string, entry: Entry) => {
    setEntries({
      ...entries,
      [id]: entry
    });
  };

  return { loadEntry, setEntry, entries };
}

function useAssetsStore(props: { sdk: BaseExtensionSDK }) {
  const [assets, setAssets] = React.useState<AssetsMap>({});

  const loadAsset = (id: string) => {
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
  };

  const setAsset = (id: string, asset: Asset) => {
    setAssets({
      ...assets,
      [id]: asset
    });
  };

  return { loadAsset, setAsset, assets };
}

const [EntriesProvider, useEntries] = constate(useEntriesStore);
const [AssetsProvider, useAssets] = constate(useAssetsStore);

export { EntriesProvider, useEntries, AssetsProvider, useAssets };
