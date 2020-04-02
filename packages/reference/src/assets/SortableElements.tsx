import React from 'react';
import { css } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';
import { AssetReferenceValue } from '../types';
import { ReferenceEditorProps } from '../ReferenceEditor';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { CardDragHandle } from '@contentful/forma-36-react-components';

const styles = {
  containter: css({
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap'
  }),
  item: css({
    marginBottom: tokens.spacingM,
    marginRight: tokens.spacingM
  })
};

type SortableLinkListProps = ReferenceEditorProps & {
  items: AssetReferenceValue[];
  setValue: (value: AssetReferenceValue[]) => void;
  disabled: boolean;
};

const DragHandle = SortableHandle(() => <CardDragHandle>Reorder item</CardDragHandle>);

const SortableLink = SortableElement((props: { children: React.ReactElement }) => (
  <div className={styles.item}>{props.children}</div>
));

export const SortableLinkList = SortableContainer((props: SortableLinkListProps) => (
  <div className={styles.containter}>
    {props.items.map((item, index) => (
      <SortableLink key={item.sys.id} index={index}>
        <FetchingWrappedAssetCard
          {...props}
          key={`${item.sys.id}-${index}`}
          disabled={props.disabled}
          assetId={item.sys.id}
          viewType="small_item"
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
