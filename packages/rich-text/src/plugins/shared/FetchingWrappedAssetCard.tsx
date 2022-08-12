import * as React from 'react';

import { Asset, FieldExtensionSDK, ScheduledAction } from '@contentful/app-sdk';
import { AssetCard } from '@contentful/f36-components';
import {
  useEntity,
  useEntityLoader,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';
import areEqual from 'fast-deep-equal';

import { useStableCallback } from './useStableCallback';

interface InternalAssetCardProps {
  asset?: Asset | 'failed';
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit?: () => void;
  onRemove?: () => unknown;
  sdk: FieldExtensionSDK;
  loadEntityScheduledActions: (entityType: string, entityId: string) => Promise<ScheduledAction[]>;
}

const InternalAssetCard = React.memo((props: InternalAssetCardProps) => {
  if (props.asset === undefined) {
    return <AssetCard size="default" isLoading />;
  }

  if (props.asset === 'failed') {
    return (
      <MissingEntityCard
        entityType="Asset"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  return (
    <WrappedAssetCard
      getEntityScheduledActions={props.loadEntityScheduledActions}
      size="small"
      isSelected={props.isSelected}
      isDisabled={props.isDisabled}
      localeCode={props.locale}
      defaultLocaleCode={props.sdk.locales.default}
      asset={props.asset}
      onEdit={props.onEdit}
      onRemove={props.isDisabled ? undefined : props.onRemove}
      isClickable={false}
    />
  );
}, areEqual);

InternalAssetCard.displayName = 'InternalAssetCard';

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
  const { onEntityFetchComplete } = props;
  const { data: asset, status } = useEntity<Asset>('Asset', props.assetId);
  const { getEntityScheduledActions } = useEntityLoader();
  const loadEntityScheduledActions = React.useCallback(
    () => getEntityScheduledActions('Entry', props.assetId),
    [getEntityScheduledActions, props.assetId]
  );

  // FIXME: remove when useEntities() has been refactored to avoid
  // unnecessary re-rendering
  const stableLoadEntityScheduledActions = useStableCallback(loadEntityScheduledActions);

  React.useEffect(() => {
    if (status === 'success') {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, status]);

  return (
    <InternalAssetCard
      asset={asset as Asset | undefined}
      sdk={props.sdk}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      loadEntityScheduledActions={stableLoadEntityScheduledActions}
      locale={props.locale}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
    />
  );
}
