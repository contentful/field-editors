import * as React from 'react';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { SortableLinkList } from './SortableElements';

export function MultipleEntryReferenceEditor(props: ReferenceEditorProps) {
  return (
    <MultipleReferenceEditor {...props} entityType="Entry">
      {(childrenProps) => (
        <SortableLinkList {...props} {...childrenProps} axis="y" useDragHandle={true} />
      )}
    </MultipleReferenceEditor>
  );
}
