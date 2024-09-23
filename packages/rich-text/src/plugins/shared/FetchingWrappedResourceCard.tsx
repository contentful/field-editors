import * as React from 'react';

import { Entry, FieldAppSDK } from '@contentful/app-sdk';
import { EntryCard } from '@contentful/f36-components';
import {
  ResourceEntityErrorCard,
  ResourceInfo,
  WrappedEntryCard,
  useResource,
} from '@contentful/field-editor-reference';
import { ResourceLink } from '@contentful/rich-text-types';
import areEqual from 'fast-deep-equal';

interface InternalEntryCard {
  isDisabled: boolean;
  isSelected: boolean;
  sdk: FieldAppSDK;
  data?: ResourceInfo<Entry>;
  status: 'loading' | 'error' | 'success';
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

const InternalEntryCard = React.memo((props: InternalEntryCard) => {
  if (props.data === undefined || props.status === 'loading') {
    return <EntryCard isLoading />;
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
      useLocalizedEntityStatus={props.sdk.parameters.instance.useLocalizedEntityStatus}
      isLocalized={!!('localized' in props.sdk.field && props.sdk.field.localized)}
    />
  );
}, areEqual);

InternalEntryCard.displayName = 'ReferenceCard';

interface FetchingWrappedResourceCardProps {
  link: ResourceLink['sys'];
  isDisabled: boolean;
  isSelected: boolean;
  sdk: FieldAppSDK;
  onEntityFetchComplete?: VoidFunction;
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

export const FetchingWrappedResourceCard = (props: FetchingWrappedResourceCardProps) => {
  const { link, onEntityFetchComplete } = props;
  const { data, status, error } = useResource(link.linkType, link.urn);

  React.useEffect(() => {
    if (status === 'success') {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, status]);

  if (status === 'error') {
    return (
      <ResourceEntityErrorCard
        error={error}
        linkType={link.linkType}
        isSelected={props.isSelected}
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  return (
    <InternalEntryCard
      // entry is the only currently supported  entity but TypeScript is not aware
      data={data as ResourceInfo<Entry> | undefined}
      status={status}
      sdk={props.sdk}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
    />
  );
};
