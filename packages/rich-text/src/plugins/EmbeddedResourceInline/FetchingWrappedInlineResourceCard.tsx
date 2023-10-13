import * as React from 'react';

import { Entry } from '@contentful/app-sdk';
import { InlineEntryCard, MenuItem, Text } from '@contentful/f36-components';
import { ResourceLink, ResourceInfo, useResource } from '@contentful/field-editor-reference';
import { entityHelpers } from '@contentful/field-editor-shared';
import { FieldAppSDK } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';

const { getEntryTitle, getEntryStatus } = entityHelpers;

interface FetchingWrappedInlineResourceCardProps {
  link: ResourceLink['sys'];
  sdk: FieldAppSDK;
  isSelected: boolean;
  isDisabled: boolean;
  onRemove: (event: React.MouseEvent<Element, MouseEvent>) => void;
  onEntityFetchComplete?: VoidFunction;
}

export function FetchingWrappedInlineResourceCard(props: FetchingWrappedInlineResourceCardProps) {
  const { link, onEntityFetchComplete } = props;
  const { data, status: requestStatus } = useResource(link.linkType, link.urn);

  React.useEffect(() => {
    if (requestStatus === 'success') {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, requestStatus]);

  if (requestStatus === 'error') {
    return (
      <InlineEntryCard
        title="Entry missing or inaccessible"
        testId={INLINES.EMBEDDED_RESOURCE}
        isSelected={props.isSelected}
      />
    );
  }

  if (requestStatus === 'loading' || data === undefined) {
    return <InlineEntryCard isLoading />;
  }

  const { resource: entry, contentType, defaultLocaleCode } = data as ResourceInfo<Entry>;

  const title = getEntryTitle({
    entry,
    contentType,
    defaultLocaleCode,
    localeCode: defaultLocaleCode,
    defaultTitle: 'Untitled',
  });
  const status = getEntryStatus(entry?.sys);

  return (
    <InlineEntryCard
      testId={INLINES.EMBEDDED_RESOURCE}
      isSelected={props.isSelected}
      title={`${data?.contentType.name}: ${title}`}
      status={status}
      actions={[
        <MenuItem key="remove" onClick={props.onRemove} disabled={props.isDisabled} testId="delete">
          Remove
        </MenuItem>,
      ]}
    >
      <Text>{title}</Text>
    </InlineEntryCard>
  );
}
