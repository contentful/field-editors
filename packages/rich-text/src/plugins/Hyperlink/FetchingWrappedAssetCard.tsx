import * as React from 'react';
import { AssetCard } from '@contentful/forma-36-react-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';
import { FieldExtensionSDK } from '@contentful/field-editor-reference/dist/types';

interface FetchingWrappedAssetCardProps {
  assetId: string;
  getAssetUrl?: (assetId: string) => string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit?: () => void;
  onEntityFetchComplete?: () => void;
  onRemove?: () => unknown;
  sdk: FieldExtensionSDK;
}

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { getOrLoadAsset, loadEntityScheduledActions, assets } = useEntities();

  React.useEffect(() => {
    getOrLoadAsset(props.assetId);
  }, [props.assetId]); // eslint-disable-line

  const asset = assets[props.assetId];

  React.useEffect(() => {
    if (!asset) return;

    props.onEntityFetchComplete && props.onEntityFetchComplete();
  }, [asset]); // eslint-disable-line

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
    return <AssetCard size="default" isLoading title="" src="" href="" />;
  }

  return (
    <WrappedAssetCard
      asset={asset}
      defaultLocaleCode={props.sdk.locales.default}
      // @ts-expect-error
      getAsset={props.sdk.space.getAsset} // TODO: How can we fix its type?
      getAssetUrl={props.getAssetUrl}
      getEntityScheduledActions={loadEntityScheduledActions}
      isClickable={false}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      localeCode={props.locale}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
      size="default"
    />
  );
}
