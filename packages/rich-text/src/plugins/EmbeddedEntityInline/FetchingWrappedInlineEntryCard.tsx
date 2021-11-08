import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { InlineEntryCard, MenuItem } from '@contentful/f36-components';
import { ClockIcon } from '@contentful/f36-icons';
import { entityHelpers, FieldExtensionSDK } from '@contentful/field-editor-shared';
import { useEntities, ScheduledIconWithTooltip } from '@contentful/field-editor-reference';
import { INLINES } from '@contentful/rich-text-types';

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
}

export function FetchingWrappedInlineEntryCard(props: FetchingWrappedInlineEntryCardProps) {
  const { getOrLoadEntry, loadEntityScheduledActions, entries } = useEntities();
  const entry = React.useMemo(() => entries[props.entryId], [entries, props.entryId]);

  const allContentTypes = props.sdk.space.getCachedContentTypes();
  const contentType = React.useMemo(() => {
    if (!entry || entry === 'failed' || !allContentTypes) return undefined;

    return allContentTypes.find(
      (contentType) => contentType.sys.id === entry.sys.contentType.sys.id
    );
  }, [allContentTypes, entry]);

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

  React.useEffect(() => {
    if (!props.entryId) return;
    getOrLoadEntry(props.entryId);
    // We don't include getOrLoadEntry below because it's part of the constate-derived
    // useEntities(), not props.
    // eslint-disable-next-line
  }, [props.entryId]);

  if (entry === 'failed') {
    return (
      <InlineEntryCard
        title="Entry missing or inaccessible"
        testId={INLINES.EMBEDDED_ENTRY}
        isSelected={props.isSelected}
      />
    );
  }

  if (entry === undefined) {
    return <InlineEntryCard isLoading />;
  }

  const status = getEntryStatus(entry.sys);
  if (status === 'deleted') {
    return (
      <InlineEntryCard
        title="Entry missing or inaccessible"
        testId={INLINES.EMBEDDED_ENTRY}
        isSelected={props.isSelected}
        actions={[
          <MenuItem key="remove" onClick={props.onRemove}>
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
      title={
        (
          <>
            <span>
              {contentTypeName} {title}
            </span>
            <ScheduledIconWithTooltip
              getEntityScheduledActions={loadEntityScheduledActions}
              entityType="Entry"
              entityId={entry.sys.id}>
              <ClockIcon className={styles.scheduledIcon} variant="muted" testId="scheduled-icon" />
            </ScheduledIconWithTooltip>
          </>
        ) as any
      }
      status={status}
      actions={[
        <MenuItem key="edit" onClick={props.onEdit}>
          Edit
        </MenuItem>,
        <MenuItem key="edit" onClick={props.onRemove} disabled={props.isDisabled}>
          Remove
        </MenuItem>,
      ]}
    />
  );
}
