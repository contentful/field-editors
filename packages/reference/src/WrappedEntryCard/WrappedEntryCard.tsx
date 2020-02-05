import * as React from 'react';
import { EntryCard, DropdownList, DropdownListItem } from '@contentful/forma-36-react-components';
import { ViewType } from '../types';

interface WrappedEntryCardProps {
  viewType: ViewType;
  disabled: boolean;
  onRemove: () => void;
  onEdit: () => void;
  entry?: {
    title: string;
    description?: string;
  };
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

  return (
    <EntryCard
      title="Untitled"
      contentType="asdasd"
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
