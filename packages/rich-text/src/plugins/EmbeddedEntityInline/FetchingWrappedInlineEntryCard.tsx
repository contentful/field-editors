import * as React from 'react';

import { InlineEntryCard, MenuItem, Text } from '@contentful/f36-components';
import { ClockIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import {
  ScheduledIconWithTooltip,
  useEntity,
  useEntityLoader,
} from '@contentful/field-editor-reference';
import { Entry, FieldAppSDK, entityHelpers } from '@contentful/field-editor-shared';
import { INLINES } from '@contentful/rich-text-types';
import { css } from 'emotion';

const { getEntryTitle, getEntityStatus } = entityHelpers;

const styles = {
  scheduledIcon: css({
    verticalAlign: 'text-bottom',
    marginRight: tokens.spacing2Xs,
  }),
};

type InternalFetchingWrappedInlineEntryCardProps = Pick<
  FetchingWrappedInlineEntryCardProps,
  'onEdit' | 'onRemove' | 'isDisabled' | 'isSelected'
> & {
  locale: string;
  defaultLocale: string;
  entry: Entry;
  allContentTypes: ReturnType<FieldAppSDK['space']['getCachedContentTypes']>;
  getEntityScheduledActions: React.ComponentProps<
    typeof ScheduledIconWithTooltip
  >['getEntityScheduledActions'];
  entryStatus: ReturnType<typeof getEntityStatus>;
};

function InternalFetchingWrappedInlineEntryCard({
  entry,
  allContentTypes,
  locale,
  defaultLocale,
  isSelected,
  entryStatus,
  getEntityScheduledActions,
  onEdit,
  onRemove,
  isDisabled,
}: InternalFetchingWrappedInlineEntryCardProps) {
  const contentType = React.useMemo(() => {
    if (!allContentTypes) {
      return undefined;
    }

    return allContentTypes.find(
      (contentType) => contentType.sys.id === entry.sys.contentType.sys.id
    );
  }, [allContentTypes, entry]);

  const title = React.useMemo(
    () =>
      getEntryTitle({
        entry,
        contentType,
        localeCode: locale,
        defaultLocaleCode: defaultLocale,
        defaultTitle: 'Untitled',
      }),
    [entry, contentType, locale, defaultLocale]
  );

  return (
    <InlineEntryCard
      testId={INLINES.EMBEDDED_ENTRY}
      isSelected={isSelected}
      title={contentType ? `${contentType.name}: ${title}` : title}
      status={entryStatus}
      actions={[
        <MenuItem key="edit" onClick={onEdit}>
          Edit
        </MenuItem>,
        <MenuItem key="remove" onClick={onRemove} disabled={isDisabled} testId="delete">
          Remove
        </MenuItem>,
      ]}
    >
      <ScheduledIconWithTooltip
        getEntityScheduledActions={getEntityScheduledActions}
        entityType="Entry"
        entityId={entry.sys.id}
      >
        <ClockIcon className={styles.scheduledIcon} variant="muted" testId="scheduled-icon" />
      </ScheduledIconWithTooltip>
      <Text>{title}</Text>
    </InlineEntryCard>
  );
}

interface FetchingWrappedInlineEntryCardProps {
  entryId: string;
  sdk: FieldAppSDK;
  isSelected: boolean;
  isDisabled: boolean;
  onEdit: (event: React.MouseEvent<Element, MouseEvent>) => void;
  onRemove: (event: React.MouseEvent<Element, MouseEvent>) => void;
  onEntityFetchComplete?: VoidFunction;
}

export function FetchingWrappedInlineEntryCard(props: FetchingWrappedInlineEntryCardProps) {
  const { data: entry, status: requestStatus } = useEntity<Entry>('Entry', props.entryId);
  const { getEntityScheduledActions } = useEntityLoader();

  const { onEntityFetchComplete } = props;

  React.useEffect(() => {
    if (requestStatus !== 'success') {
      return;
    }
    onEntityFetchComplete?.();
  }, [requestStatus, onEntityFetchComplete]);

  if (requestStatus === 'loading' || requestStatus === 'idle') {
    return <InlineEntryCard isLoading />;
  }

  if (requestStatus === 'error') {
    return (
      <InlineEntryCard
        title="Content missing or inaccessible"
        testId={INLINES.EMBEDDED_ENTRY}
        isSelected={props.isSelected}
      />
    );
  }

  const entryStatus = getEntityStatus(
    entry.sys,
    props.sdk.parameters.instance.useLocalizedEntityStatus ? props.sdk.field.locale : undefined
  );

  if (entryStatus === 'deleted') {
    return (
      <InlineEntryCard
        title="Content missing or inaccessible"
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
    <InternalFetchingWrappedInlineEntryCard
      allContentTypes={props.sdk.space.getCachedContentTypes()}
      getEntityScheduledActions={() => getEntityScheduledActions('Entry', props.entryId)}
      locale={props.sdk.field.locale}
      defaultLocale={props.sdk.locales.default}
      entry={entry}
      entryStatus={entryStatus}
      isDisabled={props.isDisabled}
      isSelected={props.isSelected}
      onEdit={props.onEdit}
      onRemove={props.onRemove}
    />
  );
}
