import * as React from 'react';
import { BaseExtensionSDK, Asset, Action } from '../types';
import constate from 'constate';

type AssetsMap = {
  [key: string]: 'failed' | undefined | Asset;
};

function useAssetsStore(props: { sdk: BaseExtensionSDK; onAction?: (action: Action) => void }) {
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

const [AssetsProvider, useAssets] = constate(useAssetsStore);

export { AssetsProvider, useAssets };
