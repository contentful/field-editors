import * as React from 'react';
import { EntryCard } from '@contentful/forma-36-react-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedEntryCard,
} from '@contentful/field-editor-reference';
import { FieldExtensionSDK } from '@contentful/field-editor-reference/dist/types';

interface FetchingWrappedEntryCardProps {
  entryId: string;
  getEntryUrl?: (entryId: string) => string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit?: () => void;
  onEntityFetchComplete?: () => void;
  onRemove?: () => unknown;
  sdk: FieldExtensionSDK;
}

export function FetchingWrappedEntryCard(props: FetchingWrappedEntryCardProps) {
  const { getOrLoadEntry, loadEntityScheduledActions, entries } = useEntities();

  React.useEffect(() => {
    getOrLoadEntry(props.entryId);
  }, [props.entryId]); // eslint-disable-line

  const entry = entries[props.entryId];

  React.useEffect(() => {
    if (!entry) return;

    props.onEntityFetchComplete && props.onEntityFetchComplete();
  }, [entry]); // eslint-disable-line

  if (entry === 'failed') {
    return (
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  if (entry === undefined) {
    return <EntryCard size="default" loading={true} />;
  }

  const contentType = props.sdk.space
    .getCachedContentTypes()
    .find((contentType) => contentType.sys.id === entry.sys.contentType.sys.id);

  return (
    <WrappedEntryCard
      contentType={contentType}
      defaultLocaleCode={props.sdk.locales.default}
      entry={entry}
      entryUrl={props.getEntryUrl && props.getEntryUrl(entry.sys.id)}
      getAsset={props.sdk.space.getAsset}
      getEntityScheduledActions={loadEntityScheduledActions}
      isClickable={false}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      localeCode={props.locale}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
      size="default"
    />
  );
}
