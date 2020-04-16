import * as React from 'react';
import PropTypes from 'prop-types';
import { AssetCard } from '@contentful/forma-36-react-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedAssetCard
} from '@contentful/field-editor-reference';

export function FetchingWrappedAssetCard(props) {
  const { loadAsset, assets } = useEntities();

  React.useEffect(() => {
    loadAsset(props.assetId);
  }, [props.assetId]);

  const asset = assets[props.assetId];

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
      getEntityScheduledActions={props.sdk.space.getEntityScheduledActions}
      getAssetUrl={props.getAssetUrl}
      size="default"
      isSelected={props.isSelected}
      isDisabled={props.isDisabled}
      localeCode={props.sdk.field.locale}
      defaultLocaleCode={props.sdk.locales.default}
      asset={asset}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
    />
  );
}

FetchingWrappedAssetCard.propTypes = {
  sdk: PropTypes.object.isRequired,
  assetId: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  getAssetUrl: PropTypes.func
};
