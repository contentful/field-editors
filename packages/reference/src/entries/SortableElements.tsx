import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';
import { ContentType, ReferenceValue } from '../types';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
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

type SortableLinkListProps = ReferenceEditorProps & {
  items: ReferenceValue[];
  setValue: (value: ReferenceValue[]) => void;
  isDisabled: boolean;
  allContentTypes: ContentType[];
};

const DragHandle = SortableHandle(() => <CardDragHandle>Reorder item</CardDragHandle>);

const SortableLink = SortableElement((props: { children: React.ReactElement }) => (
  <div className={styles.item}>{props.children}</div>
));

export const SortableLinkList = SortableContainer((props: SortableLinkListProps) => (
  <div className={styles.containter}>
    {props.items.map((item, index) => (
      <SortableLink disabled={props.isDisabled} key={`${item.sys.id}-${index}`} index={index}>
        <FetchingWrappedEntryCard
          {...props}
          key={`${item.sys.id}-${index}`}
          index={index}
          allContentTypes={props.allContentTypes}
          isDisabled={props.isDisabled}
          entryId={item.sys.id}
          onRemove={() => {
            props.setValue(
              props.items.filter((_value, i) => {
                return i !== index;
              })
            );
          }}
          cardDragHandle={props.isDisabled ? undefined : <DragHandle />}
        />
      </SortableLink>
    ))}
  </div>
));
