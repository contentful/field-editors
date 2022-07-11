import * as React from 'react';

import { AssetCard } from '@contentful/f36-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';
import PropTypes from 'prop-types';

export function FetchingWrappedAssetCard(props) {
  const { getAsset, loadEntityScheduledActions, assets } = useEntities();

  React.useEffect(() => {
    getAsset(props.assetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
  }, [props.assetId]);

  const asset = assets[props.assetId];

  React.useEffect(() => {
    if (asset) {
      props.onEntityFetchComplete && props.onEntityFetchComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
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
