import * as React from 'react';
import { EntryCard, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { Entry, File, ContentType } from '../types';
import { entityHelpers } from '@contentful/field-editor-shared';
import { AssetThumbnail, isValidImage } from '../AssetThumbnail/AssetThumbnail';
import { MissingEntityCard } from '../MissingEntityCard/MissingEntityCard';

const { getEntryTitle, getEntityDescription, getEntryStatus, getEntryImage } = entityHelpers;

interface WrappedEntryCardProps {
  getAsset: (assetId: string) => Promise<unknown>;
  getEntryUrl?: (entryId: string) => string;
  size: 'small' | 'default';
  disabled: boolean;
  onRemove: () => void;
  onEdit: () => void;
  localeCode: string;
  defaultLocaleCode: string;
  allContentTypes: ContentType[];
  entry: Entry;
}

const EntryActions = (props: { disabled: boolean; onEdit: Function; onRemove: Function }) => {
  const { disabled, onEdit, onRemove } = props;
  return (
    <DropdownList>
      {onEdit && (
        <DropdownListItem
          isDisabled={disabled}
          onClick={e => {
            e.stopPropagation();
            onEdit();
          }}
          testId="edit">
          Edit
        </DropdownListItem>
      )}
      {onRemove && (
        <DropdownListItem
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          isDisabled={disabled}
          testId="delete">
          Remove
        </DropdownListItem>
      )}
    </DropdownList>
  );
};

export function WrappedEntryCard(props: WrappedEntryCardProps) {
  const [file, setFile] = React.useState<null | File>(null);

  const contentType = props.allContentTypes.find(
    contentType => contentType.sys.id === props.entry?.sys.contentType.sys.id
  );

  React.useEffect(() => {
    if (props.entry) {
      getEntryImage(
        {
          entry: props.entry,
          contentType,
          localeCode: props.localeCode,
          defaultLocaleCode: props.defaultLocaleCode
        },
        props.getAsset
      )
        .then(file => {
          setFile(file);
        })
        .catch(() => {
          setFile(null);
        });
    }
  }, [props.entry, contentType, props.localeCode, props.defaultLocaleCode]);

  const status = getEntryStatus(props.entry?.sys);

  if (status === 'deleted') {
    return (
      <MissingEntityCard entityType="entry" disabled={props.disabled} onRemove={props.onRemove} />
    );
  }

  const title = getEntryTitle({
    entry: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled'
  });

  const description = getEntityDescription({
    entity: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode
  });

  return (
    <EntryCard
      href={props.getEntryUrl ? props.getEntryUrl(props.entry.sys.id) : undefined}
      title={title}
      description={description}
      contentType={contentType?.name}
      size={props.size}
      status={status}
      thumbnailElement={file && isValidImage(file) ? <AssetThumbnail file={file} /> : null}
      dropdownListElements={
        <EntryActions disabled={props.disabled} onEdit={props.onEdit} onRemove={props.onRemove} />
      }
      onClick={() => {
        props.onEdit();
      }}
    />
  );
}
