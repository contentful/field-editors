import * as React from 'react';

import { Asset, FieldAppSDK, ScheduledAction } from '@contentful/app-sdk';
import { AssetCard, DragHandle } from '@contentful/f36-components';
import {
  useEntity,
  useEntityLoader,
  MissingEntityCard,
  WrappedAssetCard,
} from '@contentful/field-editor-reference';
import {
  type LocalePublishStatusMap,
  useLocalePublishStatus,
  useActiveLocales,
  type ReleaseStatusMap,
  type ReleaseV2Props,
  useReleaseStatus,
  type ReleaseEntityStatus,
} from '@contentful/field-editor-shared';
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
  releaseStatusMap?: ReleaseStatusMap;
  release?: ReleaseV2Props;
  releaseEntityStatus?: ReleaseEntityStatus;
}

const InternalAssetCard = React.memo(
  ({
    asset,
    sdk,
    isDisabled,
    isSelected,
    locale,
    onEdit,
    onRemove,
    loadEntityScheduledActions,
    localesStatusMap,
    release,
    releaseStatusMap,
    releaseEntityStatus,
  }: InternalAssetCardProps) => {
    const activeLocales = useActiveLocales(sdk);

    return (
      <WrappedAssetCard
        getEntityScheduledActions={loadEntityScheduledActions}
        size="small"
        isSelected={isSelected}
        isDisabled={isDisabled}
        localeCode={locale}
        defaultLocaleCode={sdk.locales.default}
        asset={asset}
        onEdit={onEdit}
        onRemove={isDisabled ? undefined : onRemove}
        isClickable={false}
        useLocalizedEntityStatus={sdk.parameters.instance.useLocalizedEntityStatus}
        localesStatusMap={localesStatusMap}
        activeLocales={activeLocales}
        renderDragHandle={
          !isDisabled
            ? (dragHandleProps) => <DragHandle label="drag embedded asset" {...dragHandleProps} />
            : undefined
        }
        releaseStatusMap={releaseStatusMap}
        release={release}
        releaseEntityStatus={releaseEntityStatus}
      />
    );
  },
  areEqual,
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
  const { data: asset, status, currentEntity } = useEntity<Asset>('Asset', props.assetId);
  const { getEntityScheduledActions } = useEntityLoader();
  const loadEntityScheduledActions = React.useCallback(
    () => getEntityScheduledActions(props.assetId),
    [getEntityScheduledActions, props.assetId],
  );
  const localesStatusMap = useLocalePublishStatus(asset, props.sdk.locales);
  const { releaseStatusMap, releaseEntityStatus } = useReleaseStatus({
    entity: asset,
    previousEntityOnTimeline: currentEntity,
    locales: props.sdk.locales,
    release: props.sdk.release,
  });

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
      releaseStatusMap={releaseStatusMap}
      release={props.sdk.release as ReleaseV2Props | undefined}
      releaseEntityStatus={releaseEntityStatus}
    />
  );
}
