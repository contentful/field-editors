import * as React from 'react';

import { Asset, FieldAppSDK, ScheduledAction } from '@contentful/app-sdk';
import { AssetCard } from '@contentful/f36-components';
import {
  useEntity,
  useEntityLoader,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';
import { LocalePublishStatusMap, useLocalePublishStatus } from '@contentful/field-editor-shared';
import areEqual from 'fast-deep-equal';

interface InternalAssetCardProps {
  asset: Asset;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit?: () => void;
  onRemove?: () => unknown;
  sdk: FieldAppSDK;
  loadEntityScheduledActions: (entityType: string, entityId: string) => Promise<ScheduledAction[]>;
  localesStatusMap?: LocalePublishStatusMap;
}

const InternalAssetCard = React.memo(
  (props: InternalAssetCardProps) => (
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
      useLocalizedEntityStatus={props.sdk.parameters.instance.useLocalizedEntityStatus}
      localesStatusMap={props.localesStatusMap}
      activeLocales={props.sdk.parameters.instance.activeLocales}
    />
  ),
  areEqual
);

InternalAssetCard.displayName = 'InternalAssetCard';

interface FetchingWrappedAssetCardProps {
  assetId: string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit?: () => void;
  onRemove?: () => unknown;
  sdk: FieldAppSDK;
  onEntityFetchComplete?: VoidFunction;
}

export function FetchingWrappedAssetCard(props: FetchingWrappedAssetCardProps) {
  const { onEntityFetchComplete } = props;
  const { data: asset, status } = useEntity<Asset>('Asset', props.assetId);
  const { getEntityScheduledActions } = useEntityLoader();
  const loadEntityScheduledActions = React.useCallback(
    () => getEntityScheduledActions('Asset', props.assetId),
    [getEntityScheduledActions, props.assetId]
  );
  const localesStatusMap = useLocalePublishStatus(asset, props.sdk.locales);

  React.useEffect(() => {
    if (status === 'success') {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, status]);

  if (status === 'loading' || status === 'idle') {
    return <AssetCard size="default" isLoading />;
  }

  if (status === 'error') {
    return (
      <MissingEntityCard
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
        providerName="Contentful"
      />
    );
  }

  return (
    <InternalAssetCard
      asset={asset}
      sdk={props.sdk}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      loadEntityScheduledActions={loadEntityScheduledActions}
      locale={props.locale}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
      localesStatusMap={localesStatusMap}
    />
  );
}
