import * as React from 'react';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { SortableLinkList } from './SortableElements';

type EditorProps = Omit<ReferenceEditorProps, 'hasCardEditActions'>;

export function MultipleMediaEditor(props: EditorProps) {
  return (
    <MultipleReferenceEditor {...props} entityType="Asset">
      {(childrenProps) => (
        <SortableLinkList
          {...props}
          {...childrenProps}
          axis={props.viewType === 'card' ? 'xy' : 'y'}
          useDragHandle={true}
        />
      )}
    </MultipleReferenceEditor>
  );
}

MultipleMediaEditor.defaultProps = {
  isInitiallyDisabled: true,
};
