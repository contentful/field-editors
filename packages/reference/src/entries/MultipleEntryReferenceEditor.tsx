import * as React from 'react';

import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SortableLinkList } from '../common/SortableLinkList';
import { ReferenceValue } from '../types';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';

export function MultipleEntryReferenceEditor(props: ReferenceEditorProps) {
  return (
    <MultipleReferenceEditor {...props} entityType="Entry">
      {(childrenProps) => (
        <SortableLinkList<ReferenceValue> {...childrenProps}>
          {(props) => {
            const lastIndex = props.items.length - 1;

            return (
              <FetchingWrappedEntryCard
                {...props}
                key={`${props.item.sys.id}-${props.index}`}
                index={props.index}
                allContentTypes={childrenProps.allContentTypes}
                isDisabled={props.isDisabled}
                entryId={props.item.sys.id}
                onRemove={() => {
                  childrenProps.setValue(
                    props.items.filter((_value, i) => {
                      return i !== props.index;
                    })
                  );
                }}
                onMoveTop={
                  props.index !== 0 ? () => childrenProps.onMove(props.index, 0) : undefined
                }
                onMoveBottom={
                  props.index !== lastIndex
                    ? () => childrenProps.onMove(props.index, lastIndex)
                    : undefined
                }
                renderDragHandle={props.DragHandle}
              />
            );
          }}
        </SortableLinkList>
      )}
    </MultipleReferenceEditor>
  );
}
