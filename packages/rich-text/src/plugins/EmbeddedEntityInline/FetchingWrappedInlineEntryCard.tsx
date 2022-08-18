import React from 'react';

import { InlineEntryCard, MenuItem, Text } from '@contentful/f36-components';
import { ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import {
  useEntity,
  useEntityLoader,
  ScheduledIconWithTooltip,
} from '@contentful/field-editor-reference';
import { Entry, entityHelpers, FieldExtensionSDK } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { css } from 'emotion';

const { getEntryTitle, getEntryStatus } = entityHelpers;

const styles = {
  scheduledIcon: css({
    verticalAlign: 'text-bottom',
    marginRight: tokens.spacing2Xs,
  }),
};

interface FetchingWrappedInlineEntryCardProps {
  entryId: string;
  sdk: FieldExtensionSDK;
  isSelected: boolean;
  isDisabled: boolean;
  onEdit: (event: React.MouseEvent<Element, MouseEvent>) => void;
  onRemove: (event: React.MouseEvent<Element, MouseEvent>) => void;
  onEntityFetchComplete?: VoidFunction;
}

export function FetchingWrappedInlineEntryCard(props: FetchingWrappedInlineEntryCardProps) {
  const { data: entry, status: requestStatus } = useEntity<Entry>('Entry', props.entryId);
  const { getEntityScheduledActions } = useEntityLoader();
  const loadEntityScheduledActions = () => getEntityScheduledActions('Entry', props.entryId);

  const allContentTypes = props.sdk.space.getCachedContentTypes();
  const { onEntityFetchComplete } = props;
  const contentType = React.useMemo(() => {
    if (!entry || !allContentTypes) return undefined;

    return allContentTypes.find(
      (contentType) => contentType.sys.id === entry.sys.contentType.sys.id
    );
  }, [allContentTypes, entry]);

  React.useEffect(() => {
    if (requestStatus !== 'success') {
      return;
    }
    onEntityFetchComplete?.();
  }, [requestStatus, onEntityFetchComplete]);

  const contentTypeName = contentType ? contentType.name : '';

  const title = React.useMemo(
    () =>
      getEntryTitle({
        entry,
        contentType,
        localeCode: props.sdk.field.locale,
        defaultLocaleCode: props.sdk.locales.default,
        defaultTitle: 'Untitled',
      }),
    [entry, contentType, props.sdk.field.locale, props.sdk.locales.default]
  );

  if (requestStatus === 'error') {
    return (
      <InlineEntryCard
        title="Entry missing or inaccessible"
        testId={INLINES.EMBEDDED_ENTRY}
        isSelected={props.isSelected}
      />
    );
  }

  if (requestStatus === 'loading') {
    return <InlineEntryCard isLoading />;
  }

  const entryStatus = getEntryStatus(entry.sys);
  if (entryStatus === 'deleted') {
    return (
      <InlineEntryCard
        title="Entry missing or inaccessible"
        testId={INLINES.EMBEDDED_ENTRY}
        isSelected={props.isSelected}
        actions={[
          <MenuItem key="remove" onClick={props.onRemove} testId="delete">
            Remove
          </MenuItem>,
        ]}
      />
    );
  }

  return (
    <InlineEntryCard
      testId={INLINES.EMBEDDED_ENTRY}
      isSelected={props.isSelected}
      title={`${contentTypeName}: ${title}`}
      status={entryStatus}
      actions={[
        <MenuItem key="edit" onClick={props.onEdit}>
          Edit
        </MenuItem>,
        <MenuItem key="remove" onClick={props.onRemove} disabled={props.isDisabled} testId="delete">
          Remove
        </MenuItem>,
      ]}>
      <ScheduledIconWithTooltip
        getEntityScheduledActions={loadEntityScheduledActions}
        entityType="Entry"
        entityId={entry.sys.id}>
        <ClockIcon className={styles.scheduledIcon} variant="muted" testId="scheduled-icon" />
      </ScheduledIconWithTooltip>
      <Text>{title}</Text>
    </InlineEntryCard>
  );
}
