import * as React from 'react';
import {
  EntryCard,
  DropdownList,
  DropdownListItem,
  Icon,
} from '@contentful/forma-36-react-components';
import {
  useEntities,
  MissingEntityCard,
  ScheduledIconWithTooltip,
  AssetThumbnail,
} from '@contentful/field-editor-reference';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { entityHelpers, File, Entry, isValidImage } from '@contentful/field-editor-shared';
import { css } from 'emotion';

const styles = {
  entryCard: css({ cursor: 'pointer' }),
  scheduleIcon: css({
    marginRight: tokens.spacing2Xs,
  }),
};

interface FetchingWrappedEntryCardProps {
  entryId: string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  onEdit: () => void;
  onRemove: () => void;
  sdk: FieldExtensionSDK;
}

interface EntryThumbnailProps {
  file: File;
}

interface EntryStatusIconProps {
  entry: Entry;
}

interface EntryDropdownMenuProps {
  onEdit: () => void;
  onRemove: () => void;
  isDisabled: boolean;
}

function EntryThumbnail({ file }: EntryThumbnailProps) {
  if (!isValidImage(file)) return null;

  return <AssetThumbnail file={file as File} />;
}

function EntryStatusIcon({ entry }: EntryStatusIconProps) {
  const { loadEntityScheduledActions } = useEntities();

  return (
    <ScheduledIconWithTooltip
      getEntityScheduledActions={loadEntityScheduledActions}
      entityType="Entry"
      entityId={entry.sys.id}>
      <Icon
        className={styles.scheduleIcon}
        icon="Clock"
        size="small"
        color="muted"
        testId="schedule-icon"
      />
    </ScheduledIconWithTooltip>
  );
}

function EntryDropdownMenu({ onEdit, onRemove, isDisabled }: EntryDropdownMenuProps) {
  return (
    <DropdownList>
      <DropdownListItem onClick={onEdit} testId="edit">
        Edit
      </DropdownListItem>
      <DropdownListItem onClick={onRemove} isDisabled={isDisabled} testId="delete">
        Remove
      </DropdownListItem>
    </DropdownList>
  );
}

export function FetchingWrappedEntryCard(props: FetchingWrappedEntryCardProps) {
  const { getOrLoadEntry, entries } = useEntities();
  const [file, setFile] = React.useState<null | File>(null);
  const entry = React.useMemo(() => entries[props.entryId], [entries, props.entryId]);
  const contentType = React.useMemo(
    () =>
      props.sdk.space
        .getCachedContentTypes()
        .find((contentType) => contentType.sys.id === entry?.sys.contentType.sys.id),
    [props.sdk, entry]
  );
  const entryStatus = React.useMemo(
    () => (entry ? entityHelpers.getEntryStatus(entry.sys) : undefined),
    [entry]
  );

  const defaultLocaleCode = props.sdk.locales.default;

  React.useEffect(() => {
    if (!entry) return;

    entityHelpers
      .getEntryImage(
        {
          entry,
          contentType,
          localeCode: props.locale,
          defaultLocaleCode,
        },
        props.sdk.space.getAsset
      )
      .then(setFile)
      .catch(() => setFile(null));
  }, [entry, contentType, props.locale, defaultLocaleCode, props.sdk, file]);

  React.useEffect(() => {
    getOrLoadEntry(props.entryId);
  }, [props.entryId]); // eslint-disable-line

  if (entry === undefined) {
    return <EntryCard size="default" loading={true} />;
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

  if (entryStatus === 'deleted') {
    return (
      <MissingEntityCard
        entityType="Entry"
        isDisabled={props.isDisabled}
        onRemove={props.onRemove}
      />
    );
  }

  const title = entityHelpers.getEntryTitle({
    entry,
    contentType,
    localeCode: props.locale,
    defaultLocaleCode,
    defaultTitle: 'Untitled',
  });

  const description = entityHelpers.getEntityDescription({
    entity: entry,
    contentType,
    localeCode: props.locale,
    defaultLocaleCode,
  });

  return (
    <EntryCard
      contentType={contentType?.name}
      title={title}
      description={description}
      size="default"
      selected={props.isSelected}
      status={entryStatus}
      className={styles.entryCard}
      thumbnailElement={file ? <EntryThumbnail file={file} /> : null}
      statusIcon={<EntryStatusIcon entry={entry} />}
      dropdownListElements={
        <EntryDropdownMenu
          isDisabled={props.isDisabled}
          onEdit={props.onEdit}
          onRemove={props.onRemove}
        />
      }
    />
  );
}
