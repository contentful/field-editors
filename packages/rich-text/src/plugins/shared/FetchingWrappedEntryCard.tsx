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
  LocalePublishStatusMap,
  useLocalePublishStatus,
  useActiveLocales,
  parseReleaseParams,
  useActiveReleaseLocalesStatuses,
  getEntityReleaseStatus,
  type ReleaseLocalesStatusMap,
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
  releaseLocalesStatusMap?: ReleaseLocalesStatusMap;
  isActiveReleaseLoading?: boolean;
  activeRelease?: ReleaseV2Props;
  releaseAction?: ReleaseAction;
}

const InternalEntryCard = React.memo((props: InternalEntryCard) => {
  const {
    entry,
    sdk,
    loadEntityScheduledActions,
    releaseLocalesStatusMap,
    isActiveReleaseLoading,
    activeRelease,
    releaseAction,
  } = props;

  const contentType = sdk.space
    .getCachedContentTypes()
    .find((contentType) => contentType.sys.id === entry.sys.contentType.sys.id);
  const activeLocales = useActiveLocales(props.sdk);

  return (
    <WrappedEntryCard
      size="default"
      getAsset={props.sdk.space.getAsset}
      getEntityScheduledActions={loadEntityScheduledActions}
      isSelected={props.isSelected}
      isDisabled={props.isDisabled}
      localeCode={props.locale}
      defaultLocaleCode={props.sdk.locales.default}
      contentType={contentType}
      entry={entry}
      onEdit={props.onEdit}
      onRemove={props.isDisabled ? undefined : props.onRemove}
      isClickable={false}
      useLocalizedEntityStatus={sdk.parameters.instance.useLocalizedEntityStatus}
      localesStatusMap={props.localesStatusMap}
      activeLocales={activeLocales}
      renderDragHandle={
        !props.isDisabled
          ? (dragHandleProps) => <DragHandle label="drag embedded entry" {...dragHandleProps} />
          : undefined
      }
      releaseLocalesStatusMap={releaseLocalesStatusMap}
      isReleasesLoading={isActiveReleaseLoading}
      activeRelease={activeRelease}
      releaseAction={releaseAction}
    />
  );
}, areEqual);

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
  const { data: entry, status } = useEntity<Entry>('Entry', entryId);
  const { getEntityScheduledActions } = useEntityLoader();
  const loadEntityScheduledActions = React.useCallback(
    () => getEntityScheduledActions('Entry', entryId),
    [getEntityScheduledActions, entryId],
  );
  const localesStatusMap = useLocalePublishStatus(entry, props.sdk.locales);
  const { releaseVersionMap, locales, activeRelease, releases, isActiveReleaseLoading } =
    parseReleaseParams(props.sdk.parameters.instance.release);
  const { releaseLocalesStatusMap } = useActiveReleaseLocalesStatuses({
    currentEntityDraft: entry,
    entityId: props.entryId,
    entityType: 'Entry',
    releaseVersionMap,
    locales,
    activeRelease,
    releases,
  });
  const { releaseAction } = getEntityReleaseStatus(props.entryId, locales, activeRelease);

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
      releaseLocalesStatusMap={releaseLocalesStatusMap}
      isActiveReleaseLoading={isActiveReleaseLoading}
      activeRelease={activeRelease}
      releaseAction={releaseAction}
    />
  );
};
