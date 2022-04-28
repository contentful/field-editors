import * as React from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { EntryCard, MenuItem } from '@contentful/f36-components';
import { useEntities, MissingEntityCard, AssetThumbnail } from '@contentful/field-editor-reference';
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
  onEntityFetchComplete?: VoidFunction;
  onEdit?: VoidFunction;
  onRemove?: VoidFunction;
}

interface EntryThumbnailProps {
  file: File;
}

function EntryThumbnail({ file }: EntryThumbnailProps) {
  if (!isValidImage(file)) return null;

  return <AssetThumbnail file={file as File} />;
}

export function FetchingWrappedEntryCard(props: FetchingWrappedEntryCardProps) {
  const { getOrLoadEntry, entries, getOrLoadAsset } = useEntities();
  const [file, setFile] = React.useState<File | null>(null);
  const entry = entries[props.entryId];
  const contentType = React.useMemo(() => {
    if (!entry || entry === 'failed') {
      return undefined;
    }
    return props.sdk.space
      .getCachedContentTypes()
      .find((contentType) => contentType.sys.id === entry.sys.contentType.sys.id);
  }, [props.sdk, entry]);
  const defaultLocaleCode = props.sdk.locales.default;
  const { onEntityFetchComplete } = props;

  React.useEffect(() => {
    if (!entry || entry === 'failed') return;
    let subscribed = true;
    entityHelpers
      .getEntryImage(
        {
          entry,
          contentType,
          localeCode: props.locale,
          defaultLocaleCode,
        },
        getOrLoadAsset
      )
      .catch(() => null)
      .then((file) => {
        if (subscribed) {
          setFile(file);
        }
      });

    return () => {
      subscribed = false;
    };
  }, [entry, contentType, props.locale, defaultLocaleCode, props.sdk, file, getOrLoadAsset]);

  React.useEffect(() => {
    getOrLoadEntry(props.entryId);
  }, [props.entryId]); // eslint-disable-line

  React.useEffect(() => {
    if (!entry) {
      return;
    }
    onEntityFetchComplete?.();
  }, [entry, onEntityFetchComplete]);

  function renderDropdown() {
    if (!props.onEdit || !props.onRemove) return undefined;

    return [
      props.onEdit ? (
        <MenuItem
          key="edit"
          testId="card-action-edit"
          onClick={() => {
            props.onEdit && props.onEdit();
          }}>
          Edit
        </MenuItem>
      ) : null,
      props.onRemove ? (
        <MenuItem
          key="delete"
          disabled={props.isDisabled}
          testId="card-action-remove"
          onClick={() => {
            props.onRemove && props.onRemove();
          }}>
          Remove
        </MenuItem>
      ) : null,
    ].filter((item) => item);
  }

  if (entry === undefined) {
    return <EntryCard size="default" isLoading={true} />;
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
      isSelected={props.isSelected}
      status={entryStatus}
      className={styles.entryCard}
      thumbnailElement={file ? <EntryThumbnail file={file} /> : undefined}
      icon={<EntityStatusIcon entityType="Entry" entity={entry} />}
      withDragHandle={false}
      actions={renderDropdown()}
    />
  );
}
