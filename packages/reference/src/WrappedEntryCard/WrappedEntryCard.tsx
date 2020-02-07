import * as React from 'react';
import { EntryCard, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { ViewType, Entry } from '../types';
import { getEntryTitle } from '../utils/entryHelpers';
import { ContentType } from 'contentful-ui-extensions-sdk';

interface WrappedEntryCardProps {
  viewType: ViewType;
  disabled: boolean;
  onRemove: () => void;
  onEdit: () => void;
  localeCode: string;
  defaultLocaleCode: string;
  allContentTypes: ContentType[];
  entry?: Entry;
}

const EntryActions = (props: { disabled: boolean; onEdit: Function; onRemove: Function }) => {
  const { disabled, onEdit, onRemove } = props;
  return (
    <DropdownList>
      {onEdit && (
        <DropdownListItem
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
  const size = props.viewType === 'link' ? 'small' : 'default';

  if (!props.entry) {
    return <EntryCard size={size} loading />;
  }

  const contentType = props.allContentTypes.find(
    contentType => contentType.sys.id === props.entry?.sys.contentType.sys.id
  );

  const title = getEntryTitle({
    entry: props.entry,
    contentType,
    localeCode: props.localeCode,
    defaultLocaleCode: props.defaultLocaleCode,
    defaultTitle: 'Untitled'
  });

  return (
    <EntryCard
      title={title}
      contentType={contentType?.name}
      description="asdas"
      size={size}
      status="published"
      // thumbnailElement={entityFile && <Thumbnail thumbnail={entityFile} />}
      dropdownListElements={
        <EntryActions disabled={props.disabled} onEdit={props.onEdit} onRemove={props.onRemove} />
      }
      onClick={e => {
        e.preventDefault();
        props.onEdit();
      }}
      // cardDragHandleComponent={cardDragHandleComponent}
      // withDragHandle={!!cardDragHandleComponent}
    />
  );
}
