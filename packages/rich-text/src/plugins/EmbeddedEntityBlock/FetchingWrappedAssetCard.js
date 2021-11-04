import * as React from 'react';
import PropTypes from 'prop-types';
import { AssetCard } from '@contentful/f36-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';

export function FetchingWrappedAssetCard(props) {
  const { getOrLoadAsset, loadEntityScheduledActions, assets } = useEntities();

  React.useEffect(() => {
    getOrLoadAsset(props.assetId);
  }, [props.assetId]);

  const asset = assets[props.assetId];

  React.useEffect(() => {
    if (asset) {
      props.onEntityFetchComplete && props.onEntityFetchComplete();
    }
  }, [asset]);

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
      getAsset={props.sdk.space.getAsset}
      getEntityScheduledActions={loadEntityScheduledActions}
      getAssetUrl={props.getAssetUrl}
      size="default"
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

FetchingWrappedAssetCard.propTypes = {
  sdk: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  assetId: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onRemove: PropTypes.func,
  onEdit: PropTypes.func,
  getAssetUrl: PropTypes.func,
  onEntityFetchComplete: PropTypes.func,
};
