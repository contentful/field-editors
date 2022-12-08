import * as React from 'react';

import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SortableLinkList } from '../common/SortableLinkList';
import { ReferenceValue } from '../types';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';

export function MultipleEntryReferenceEditor(props: ReferenceEditorProps) {
  const [indexToUpdate, setIndexToUpdate] = React.useState<number | undefined>(undefined);

  const updateBeforeSortStart = ({ index }: { index: number }) => {
    setIndexToUpdate(index);
  };

  return (
    <MultipleReferenceEditor {...props} entityType="Entry" setIndexToUpdate={setIndexToUpdate}>
      {(childrenProps) => (
        <SortableLinkList<ReferenceValue>
          {...childrenProps}
          axis="y"
          useDragHandle={true}
          updateBeforeSortStart={updateBeforeSortStart}
        >
          {({ items, item, index, isDisabled, DragHandle }) => {
            const lastIndex = items.length - 1;
            return (
              <FetchingWrappedEntryCard
                {...childrenProps}
                key={`${item.sys.id}-${index}`}
                index={index}
                allContentTypes={childrenProps.allContentTypes}
                isDisabled={isDisabled}
                entryId={item.sys.id}
                onRemove={() => {
                  childrenProps.setValue(items.filter((_value, i) => i !== index));
                }}
                onMoveTop={index !== 0 ? () => childrenProps.onMove(index, 0) : undefined}
                onMoveBottom={
                  index !== lastIndex ? () => childrenProps.onMove(index, lastIndex) : undefined
                }
                renderDragHandle={DragHandle}
                isBeingDragged={index === indexToUpdate}
								scheduledActions={props.scheduledActions}
              />
            );
          }}
        </SortableLinkList>
      )}
    </MultipleReferenceEditor>
  );
}
