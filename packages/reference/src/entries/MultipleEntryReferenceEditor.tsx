import * as React from 'react';

import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
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
