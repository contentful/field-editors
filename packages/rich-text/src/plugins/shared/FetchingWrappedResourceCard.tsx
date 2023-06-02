import * as React from 'react';

import { Entry, FieldExtensionSDK } from '@contentful/app-sdk';
import { EntryCard } from '@contentful/f36-components';
import {
  MissingEntityCard,
  ResourceInfo,
  WrappedEntryCard,
  useResource,
} from '@contentful/field-editor-reference';
import { ResourceLink } from '@contentful/rich-text-types';
import areEqual from 'fast-deep-equal';

interface InternalEntryCard {
  isDisabled: boolean;
  isSelected: boolean;
  sdk: FieldExtensionSDK;
  data?: ResourceInfo<Entry>;
  status: 'loading' | 'error' | 'success';
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

const InternalEntryCard = React.memo((props: InternalEntryCard) => {
  if (props.status === 'loading') {
    return <EntryCard isLoading />;
  }

  if (!props.data || props.status === 'error') {
    return (
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const { contentType, resource: entry, space } = props.data;

  return (
    <WrappedEntryCard
      size="default"
      getAsset={() => Promise.resolve()}
      isSelected={props.isSelected}
      isDisabled={props.isDisabled}
      localeCode={props.data.defaultLocaleCode}
      defaultLocaleCode={props.data.defaultLocaleCode}
      contentType={contentType}
      spaceName={space?.name}
      entry={entry}
      onEdit={props.onEdit}
      onRemove={props.isDisabled ? undefined : props.onRemove}
      isClickable={false}
      getEntityScheduledActions={() => Promise.resolve([])}
    />
  );
}, areEqual);

InternalEntryCard.displayName = 'ReferenceCard';

interface FetchingWrappedResourceCardProps {
  link: ResourceLink['sys'];
  isDisabled: boolean;
  isSelected: boolean;
  sdk: FieldExtensionSDK;
  onEntityFetchComplete?: VoidFunction;
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

export const FetchingWrappedResourceCard = (props: FetchingWrappedResourceCardProps) => {
  const { link, onEntityFetchComplete } = props;
  const { data, status } = useResource(link.linkType, link.urn);

  React.useEffect(() => {
    if (status === 'success') {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, status]);

  return (
    <InternalEntryCard
      // @TODO: check incompatible type
      data={data as any}
      status={status}
      sdk={props.sdk}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
    />
  );
};
