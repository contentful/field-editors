import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { InlineEntryCard, MenuItem, Text } from '@contentful/f36-components';
import { entityHelpers } from '@contentful/field-editor-shared';
import { useEntities, ScheduledIconWithTooltip } from '@contentful/field-editor-reference';

import { INLINES } from '@contentful/rich-text-types';

import { ClockIcon } from '@contentful/f36-icons';

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
      <InlineEntryCard testId={INLINES.EMBEDDED_ENTRY} isSelected={props.isSelected}>
        <Text>Entry missing or inaccessible</Text>
      </InlineEntryCard>
    );
  }

  if (entry === undefined) {
    return <InlineEntryCard isLoading />;
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
        isSelected={props.isSelected}
        actions={[
          <MenuItem key="remove" onClick={props.onRemove}>
            Remove
          </MenuItem>,
        ]}>
        <Text>Entry missing or inaccessible</Text>
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
      isSelected={props.isSelected}
      title={`${contentTypeName}: ${title}`}
      status={status}
      actions={
        !props.isReadOnly
          ? [
              <MenuItem key="edit" onClick={props.onEdit}>
                Edit
              </MenuItem>,
              <MenuItem key="edit" onClick={props.onRemove} isDisabled={props.isDisabled}>
                Remove
              </MenuItem>,
            ]
          : undefined
      }>
      <ScheduledIconWithTooltip
        getEntityScheduledActions={loadEntityScheduledActions}
        entityType="Entry"
        entityId={entry.sys.id}>
        <ClockIcon className={styles.scheduledIcon} variant="muted" testId="scheduled-icon" />
      </ScheduledIconWithTooltip>
      <Text>{title}</Text>
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
