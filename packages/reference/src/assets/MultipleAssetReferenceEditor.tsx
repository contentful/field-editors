import * as React from 'react';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { SortableLinkList } from './SortableElements';

export function MultipleAssetReferenceEditor(props: ReferenceEditorProps) {
  return (
    <MultipleReferenceEditor {...props} entityType="Asset">
      {childrenProps => <SortableLinkList {...childrenProps} axis="xy" useDragHandle={true} />}
    </MultipleReferenceEditor>
  );
}
