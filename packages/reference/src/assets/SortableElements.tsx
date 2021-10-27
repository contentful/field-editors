import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/f36-tokens';
import { DragHandle } from '@contentful/f36-components';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';
import { ReferenceValue } from '../types';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const styles = {
  gridContainter: css({
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
  }),
  container: css({
    position: 'relative',
  }),
  item: css({
    marginBottom: tokens.spacingM,
    marginRight: tokens.spacingM,
  }),
};

type SortableLinkListProps = ReferenceEditorProps & {
  items: ReferenceValue[];
  setValue: (value: ReferenceValue[]) => void;
  isDisabled: boolean;
};

const SortableDragHandle = SortableHandle(() => (
  <DragHandle label="reorder">Reorder item</DragHandle>
));

const SortableLink = SortableElement((props: { children: React.ReactElement }) => (
  <div className={styles.item}>{props.children}</div>
));

export const SortableLinkList = SortableContainer((props: SortableLinkListProps) => (
  <div className={props.viewType === 'card' ? styles.gridContainter : styles.container}>
    {props.items.map((item, index) => (
      <SortableLink disabled={props.isDisabled} key={`${item.sys.id}-${index}`} index={index}>
        <FetchingWrappedAssetCard
          {...props}
          sdk={props.sdk}
          key={`${item.sys.id}-${index}`}
          assetId={item.sys.id}
          onRemove={() => {
            props.setValue(
              props.items.filter((_value, i) => {
                return i !== index;
              })
            );
          }}
          cardDragHandle={props.isDisabled ? undefined : <SortableDragHandle />}
        />
      </SortableLink>
    ))}
  </div>
));
