import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { ScheduledAction, Entry } from '@contentful/app-sdk';
import { EntryCard } from '@contentful/f36-components';
import {
  useEntities,
  MissingEntityCard,
  WrappedEntryCard,
} from '@contentful/field-editor-reference';
import areEqual from 'fast-deep-equal';

import { useFetchedEntity } from './useFetchedEntity';

interface InternalEntryCard {
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  sdk: FieldExtensionSDK;
  loadEntityScheduledActions: (entityType: string, entityId: string) => Promise<ScheduledAction[]>;
  entry?: Entry | 'failed';
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

const InternalEntryCard = React.memo((props: InternalEntryCard) => {
  const { entry, sdk, loadEntityScheduledActions } = props;
  console.log('re-rendering');

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

  const contentType = sdk.space
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
      onRemove={props.isDisabled ? undefined : props.onRemove}
      isClickable={false}
    />
  );
}, areEqual);

InternalEntryCard.displayName = 'ReferenceCard';

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

export const FetchingWrappedEntryCard = (props: FetchingWrappedEntryCardProps) => {
  const { entryId, onEntityFetchComplete } = props;
  const { loadEntityScheduledActions } = useEntities();

  const entry = useFetchedEntity({
    type: 'Entry',
    id: entryId,
    onEntityFetchComplete,
  });

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
    />
  );
};
