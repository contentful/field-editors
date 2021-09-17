import * as React from 'react';
import { EntryCard, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { useEntities, MissingEntityCard, AssetThumbnail } from '@contentful/field-editor-reference';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { entityHelpers, File, isValidImage } from '@contentful/field-editor-shared';
import { css } from 'emotion';
import { EntityStatusIcon } from './EntityStatusIcon';

const styles = {
  entryCard: css({ cursor: 'pointer' }),
};

interface FetchingWrappedEntryCardProps {
  entryId: string;
  isDisabled: boolean;
  isSelected: boolean;
  locale: string;
  sdk: FieldExtensionSDK;
  onEdit?: () => void;
  onRemove?: () => void;
}

interface EntryThumbnailProps {
  file: File;
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

function EntryDropdownMenu({ onEdit, onRemove, isDisabled }: EntryDropdownMenuProps) {
  return (
    <DropdownList>
      <DropdownListItem isTitle={true}>Actions</DropdownListItem>
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
  const [file, setFile] = React.useState<File | null>(null);
  const entry = entries[props.entryId];
  const contentType = React.useMemo(
    () =>
      props.sdk.space
        .getCachedContentTypes()
        .find((contentType) => contentType.sys.id === entry?.sys.contentType.sys.id),
    [props.sdk, entry]
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

  function renderDropdown() {
    if (!props.onEdit || !props.onRemove) return undefined;

    return (
      <EntryDropdownMenu
        isDisabled={props.isDisabled}
        onEdit={props.onEdit}
        onRemove={props.onRemove}
      />
    );
  }

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

  const entryStatus = entry ? entityHelpers.getEntryStatus(entry.sys) : undefined;
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
      statusIcon={<EntityStatusIcon entityType="Entry" entity={entry} />}
      dropdownListElements={renderDropdown()}
    />
  );
}
