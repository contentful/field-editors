import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntryCard } from '@contentful/f36-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedEntryCard,
} from '@contentful/field-editor-reference';

interface FetchingWrappedEntryCardProps {
  entryId: string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  sdk: FieldExtensionSDK;
  onEntityFetchComplete?: VoidFunction;
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

export function FetchingWrappedEntryCard(props: FetchingWrappedEntryCardProps) {
  const { entryId, onEntityFetchComplete } = props;
  const { getOrLoadEntry, loadEntityScheduledActions, entries } = useEntities();

  React.useEffect(() => {
    getOrLoadEntry(entryId);
  }, [getOrLoadEntry, entryId]);

  const entry = entries[entryId];

  React.useEffect(() => {
    if (entry) {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, entry]);

  if (entry === undefined) {
    return <EntryCard isLoading />;
  }

  if (entry === 'failed') {
    return (
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const contentType = props.sdk.space
    .getCachedContentTypes()
    .find((contentType) => contentType.sys.id === entry.sys.contentType.sys.id);

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
      onRemove={props.onRemove}
      isClickable={false}
    />
  );
}
