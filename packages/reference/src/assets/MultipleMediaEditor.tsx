import * as React from 'react';

import { css, cx } from 'emotion';

import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SortableLinkList } from '../common/SortableLinkList';
import { ReferenceValue } from '../types';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';

type EditorProps = Omit<ReferenceEditorProps, 'hasCardEditActions'>;

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
          className={cx({ [styles.gridContainer]: childrenProps.viewType === 'card' })}
          axis={childrenProps.viewType === 'card' ? 'xy' : 'y'}>
          {(props) => (
            <FetchingWrappedAssetCard
              {...props}
              key={`${props.item.sys.id}-${props.index}`}
              assetId={props.item.sys.id}
              onRemove={() => {
                childrenProps.setValue(
                  props.items.filter((_value, i) => {
                    return i !== props.index;
                  })
                );
              }}
              renderDragHandle={props.DragHandle}
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
