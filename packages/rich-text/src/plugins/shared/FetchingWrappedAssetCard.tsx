import * as React from 'react';

import { Asset, FieldExtensionSDK, ScheduledAction } from '@contentful/app-sdk';
import { AssetCard } from '@contentful/f36-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';
import areEqual from 'fast-deep-equal';

import { useFetchedEntity } from './useFetchedEntity';
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
  const { onEntityFetchComplete, assetId } = props;
  const { loadEntityScheduledActions } = useEntities();

  // FIXME: remove when useEntities() has been refactored to avoid
  // unnecessary re-rendering
  const stableLoadEntityScheduledActions = useStableCallback(loadEntityScheduledActions);

  const asset = useFetchedEntity({
    type: 'Asset',
    id: assetId,
    onEntityFetchComplete,
  });

  return (
    <InternalAssetCard
      asset={asset as Asset | 'failed' | undefined}
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
