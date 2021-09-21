import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { InlineEntryCard, DropdownListItem, DropdownList } from '@contentful/forma-36-react-components';
import { entityHelpers } from '@contentful/field-editor-shared';
import { useEntities, ScheduledIconWithTooltip } from '@contentful/field-editor-reference';

import { INLINES } from '@contentful/rich-text-types';

import { Icon } from "@contentful/f36-components";

import { ClockIcon } from "@contentful/f36-icons";

const { getEntryTitle, getEntryStatus } = entityHelpers;

const styles = {
  scheduledIcon: css({
    verticalAlign: 'text-bottom',
    marginRight: tokens.spacing2Xs,
  }),
};

export const FetchingWrappedInlineEntryCard = (props) => {
  const { getOrLoadEntry, loadEntityScheduledActions, entries } = useEntities();

  React.useEffect(() => {
    getOrLoadEntry(props.entryId);
  }, [props.entryId]);

  const entry = entries[props.entryId];

  React.useEffect(() => {
    if (entry) {
      props.onEntityFetchComplete && props.onEntityFetchComplete();
    }
  }, [entry]);

  if (entry === 'failed') {
    return (
      <InlineEntryCard testId={INLINES.EMBEDDED_ENTRY} selected={props.isSelected}>
        Entry missing or inaccessible
      </InlineEntryCard>
    );
  }

  if (entry === undefined) {
    return <InlineEntryCard loading />;
  }

  const allContentTypes = props.sdk.space.getCachedContentTypes();

  const contentType = allContentTypes.find(
    (contentType) => contentType.sys.id === entry.sys.contentType.sys.id
  );
  const contentTypeName = contentType ? contentType.name : '';

  const status = getEntryStatus(entry.sys);

  if (status === 'deleted') {
    return (
      <InlineEntryCard
        testId={INLINES.EMBEDDED_ENTRY}
        onRemove={props.onRemove}
        selected={props.isSelected}>
        Entry missing or inaccessible
      </InlineEntryCard>
    );
  }

  const title = getEntryTitle({
    entry: entry,
    contentType,
    localeCode: props.sdk.field.locale,
    defaultLocaleCode: props.sdk.locales.default,
    defaultTitle: 'Untitled',
  });

  return (
    <InlineEntryCard
      testId={INLINES.EMBEDDED_ENTRY}
      selected={props.isSelected}
      title={`${contentTypeName}: ${title}`}
      status={status}
      dropdownListElements={
        !props.isReadOnly ? (
          <DropdownList>
            <DropdownListItem onClick={props.onEdit}>Edit</DropdownListItem>
            <DropdownListItem onClick={props.onRemove} isDisabled={props.isDisabled}>
              Remove
            </DropdownListItem>
          </DropdownList>
        ) : null
      }>
      <ScheduledIconWithTooltip
        getEntityScheduledActions={loadEntityScheduledActions}
        entityType="Entry"
        entityId={entry.sys.id}>
        <Icon
          className={styles.scheduledIcon}
          icon={<ClockIcon />}
          variant="muted"
          testId="scheduled-icon" />
      </ScheduledIconWithTooltip>
      {title}
    </InlineEntryCard>
  );
};

FetchingWrappedInlineEntryCard.propTypes = {
  sdk: PropTypes.object.isRequired,
  entryId: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onEntityFetchComplete: PropTypes.func,
};
