import * as React from 'react';

import { rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { css, cx } from 'emotion';

import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor.js';
import { ReferenceEditorProps } from '../common/ReferenceEditor.js';
import { SortableLinkList } from '../common/SortableLinkList.js';
import { ReferenceValue } from '../types.js';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard.js';

// Omit<ReferenceEditorProps, 'hasCardEditActions'>;
// does not work nice with <Props of={SingleMediaEditor} /> from docz
// so the docs won't be generated for the props
type EditorProps = Pick<
  ReferenceEditorProps,
  Exclude<keyof ReferenceEditorProps, 'hasCardEditActions'>
>;

const styles = {
  gridContainer: css({
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
  }),
};

export function MultipleMediaEditor(props: EditorProps) {
  return (
    <MultipleReferenceEditor {...props} entityType="Asset">
      {(childrenProps) => (
        <SortableLinkList<ReferenceValue>
          {...childrenProps}
          sortingStrategy={
            childrenProps.viewType === 'card' ? rectSortingStrategy : verticalListSortingStrategy
          }
          className={cx({ [styles.gridContainer]: childrenProps.viewType === 'card' })}>
          {({ items, item, index, isDisabled, DragHandle }) => (
            <FetchingWrappedAssetCard
              {...childrenProps}
              isDisabled={isDisabled}
              key={`${item.sys.id}-${index}`}
              assetId={item.sys.id}
              onRemove={() => {
                childrenProps.setValue(items.filter((_value, i) => i !== index));
              }}
              renderDragHandle={DragHandle}
            />
          )}
        </SortableLinkList>
      )}
    </MultipleReferenceEditor>
  );
}

MultipleMediaEditor.defaultProps = {
  isInitiallyDisabled: true,
};
