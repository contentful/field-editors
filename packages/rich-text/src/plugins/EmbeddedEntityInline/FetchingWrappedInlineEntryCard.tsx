import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import {
  InlineEntryCard,
  DropdownListItem,
  DropdownList,
  Icon,
} from '@contentful/forma-36-react-components';
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
    if (!entry || !allContentTypes) return undefined;

    return allContentTypes.find(
      (contentType) => contentType.sys.id === entry.sys.contentType.sys.id
    );
  }, [allContentTypes, entry]);

  const title = React.useMemo(
    () =>
      getEntryTitle({
        entry,
        contentType,
        localeCode: props.sdk.field.locale,
        defaultLocaleCode: props.sdk.locales.default,
        defaultTitle: 'Untitled',
      }),
    [entry, contentType, props.sdk]
  );

  React.useEffect(() => {
    if (!props.entryId) return;
    getOrLoadEntry(props.entryId);
  }, [props.entryId]); // eslint-disable-line

  if (entry === 'failed') {
    return (
      <InlineEntryCard testId={INLINES.EMBEDDED_ENTRY} isSelected={props.isSelected}>
        Entry missing or inaccessible
      </InlineEntryCard>
    );
  }

  if (entry === undefined) {
    return <InlineEntryCard isLoading={true}>Loading...</InlineEntryCard>;
  }

  const status = getEntryStatus(entry.sys);
  if (status === 'deleted') {
    return (
      <InlineEntryCard testId={INLINES.EMBEDDED_ENTRY} isSelected={props.isSelected}>
        Entry missing or inaccessible
      </InlineEntryCard>
    );
  }

  return (
    <InlineEntryCard
      testId={INLINES.EMBEDDED_ENTRY}
      isSelected={props.isSelected}
      status={status}
      dropdownListElements={
        <DropdownList>
          <DropdownListItem onClick={props.onEdit} isDisabled={props.isDisabled}>
            Edit
          </DropdownListItem>
          <DropdownListItem onClick={props.onRemove} isDisabled={props.isDisabled}>
            Remove
          </DropdownListItem>
        </DropdownList>
      }>
      <ScheduledIconWithTooltip
        getEntityScheduledActions={loadEntityScheduledActions}
        entityType="Entry"
        entityId={entry.sys.id}>
        <Icon className={styles.scheduledIcon} icon="Clock" color="muted" testId="scheduled-icon" />
      </ScheduledIconWithTooltip>
      {title}
    </InlineEntryCard>
  );
}
