import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { ScheduledAction, Entry } from '@contentful/app-sdk';
import { DragHandle, EntryCard } from '@contentful/f36-components';
import {
  useEntity,
  MissingEntityCard,
  WrappedEntryCard,
  useEntityLoader,
} from '@contentful/field-editor-reference';
import {
  type LocalePublishStatusMap,
  useLocalePublishStatus,
  useActiveLocales,
  useReleaseStatus,
  type ReleaseStatusMap,
  type ReleaseV2Props,
  type ReleaseAction,
} from '@contentful/field-editor-shared';
import areEqual from 'fast-deep-equal';

interface InternalEntryCard {
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  sdk: FieldAppSDK;
  loadEntityScheduledActions: (entityType: string, entityId: string) => Promise<ScheduledAction[]>;
  entry: Entry;
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
  localesStatusMap?: LocalePublishStatusMap;
  releaseStatusMap?: ReleaseStatusMap;
  release?: ReleaseV2Props;
  releaseAction?: ReleaseAction;
}

const InternalEntryCard = React.memo(
  ({
    entry,
    sdk,
    loadEntityScheduledActions,
    releaseStatusMap,
    release,
    releaseAction,
    isSelected,
    isDisabled,
    locale,
    onEdit,
    onRemove,
    localesStatusMap,
  }: InternalEntryCard) => {
    const contentType = sdk.space
      .getCachedContentTypes()
      .find((contentType) => contentType.sys.id === entry.sys.contentType.sys.id);
    const activeLocales = useActiveLocales(sdk);

    return (
      <WrappedEntryCard
        size="default"
        getAsset={sdk.space.getAsset}
        getEntityScheduledActions={loadEntityScheduledActions}
        isSelected={isSelected}
        isDisabled={isDisabled}
        localeCode={locale}
        defaultLocaleCode={sdk.locales.default}
        contentType={contentType}
        entry={entry}
        onEdit={onEdit}
        onRemove={isDisabled ? undefined : onRemove}
        isClickable={false}
        useLocalizedEntityStatus={sdk.parameters.instance.useLocalizedEntityStatus}
        localesStatusMap={localesStatusMap}
        activeLocales={activeLocales}
        renderDragHandle={
          !isDisabled
            ? (dragHandleProps) => <DragHandle label="drag embedded entry" {...dragHandleProps} />
            : undefined
        }
        releaseStatusMap={releaseStatusMap}
        release={release}
        releaseAction={releaseAction}
      />
    );
  },
  areEqual,
);

InternalEntryCard.displayName = 'ReferenceCard';

interface FetchingWrappedEntryCardProps {
  entryId: string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  sdk: FieldAppSDK;
  onEntityFetchComplete?: VoidFunction;
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

export const FetchingWrappedEntryCard = (props: FetchingWrappedEntryCardProps) => {
  const { entryId, onEntityFetchComplete } = props;
  const { data: entry, status, currentEntity } = useEntity<Entry>('Entry', entryId);
  const { getEntityScheduledActions } = useEntityLoader();
  const loadEntityScheduledActions = React.useCallback(
    () => getEntityScheduledActions('Entry', entryId),
    [getEntityScheduledActions, entryId],
  );
  const localesStatusMap = useLocalePublishStatus(entry, props.sdk.locales);
  const { releaseStatusMap, releaseAction } = useReleaseStatus({
    entity: entry,
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
    return <EntryCard isLoading />;
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
    <InternalEntryCard
      entry={entry}
      sdk={props.sdk}
      locale={props.locale}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
      loadEntityScheduledActions={loadEntityScheduledActions}
      localesStatusMap={localesStatusMap}
      releaseStatusMap={releaseStatusMap}
      release={props.sdk.release as ReleaseV2Props | undefined}
      releaseAction={releaseAction}
    />
  );
};
