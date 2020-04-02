import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';
import { ContentType, EntryReferenceValue } from '../types';
import { EntryReferenceEditorProps } from './EntryReferenceEditor';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { CardDragHandle } from '@contentful/forma-36-react-components';

const styles = {
  containter: css({
    position: 'relative'
  }),
  item: css({
    marginBottom: tokens.spacingM
  })
};

type SortableLinkListProps = EntryReferenceEditorProps & {
  items: EntryReferenceValue[];
  setValue: (value: EntryReferenceValue[]) => void;
  disabled: boolean;
  allContentTypes: ContentType[];
};

const DragHandle = SortableHandle(() => <CardDragHandle>Reorder item</CardDragHandle>);

const SortableLink = SortableElement((props: { children: React.ReactElement }) => (
  <div className={styles.item}>{props.children}</div>
));

export const SortableLinkList = SortableContainer((props: SortableLinkListProps) => (
  <div className={styles.containter}>
    {props.items.map((item, index) => (
      <SortableLink key={item.sys.id} index={index}>
        <FetchingWrappedEntryCard
          {...props}
          key={`${item.sys.id}-${index}`}
          allContentTypes={props.allContentTypes}
          disabled={props.disabled}
          entryId={item.sys.id}
          onRemove={() => {
            props.setValue(
              props.items.filter(filteringItem => filteringItem.sys.id !== item.sys.id)
            );
          }}
          cardDragHandle={<DragHandle />}
        />
      </SortableLink>
    ))}
  </div>
));
