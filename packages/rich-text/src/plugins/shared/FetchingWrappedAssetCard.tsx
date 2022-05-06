import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { AssetCard } from '@contentful/f36-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';

interface FetchingWrappedAssetCardProps {
  assetId: string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit?: () => void;
  onRemove?: () => unknown;
  sdk: FieldExtensionSDK;
  onEntityFetchComplete?: VoidFunction;
}

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { onEntityFetchComplete, assetId } = props;
  const { getOrLoadAsset, loadEntityScheduledActions, assets } = useEntities();

  React.useEffect(() => {
    getOrLoadAsset(assetId);
  }, [getOrLoadAsset, assetId]);

  const asset = assets[assetId];

  React.useEffect(() => {
    if (asset) {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, asset]);

  if (asset === 'failed') {
    return (
      <MissingEntityCard
        entityType="Asset"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  if (asset === undefined) {
    return <AssetCard size="default" isLoading />;
  }

  return (
    <WrappedAssetCard
      getEntityScheduledActions={loadEntityScheduledActions}
      size="small"
      isSelected={props.isSelected}
      isDisabled={props.isDisabled}
      localeCode={props.locale}
      defaultLocaleCode={props.sdk.locales.default}
      asset={asset}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
      isClickable={false}
    />
  );
}
