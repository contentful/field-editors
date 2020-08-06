import * as React from 'react';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { MultipleReferenceEditor } from '../common/MultipleReferenceEditor';
import { SortableLinkList } from './SortableElements';

// TODO: Implement `renderCustomCard` prop for MultipleMediaEditor.
type EditorProps = Omit<ReferenceEditorProps, 'renderCustomCard' | 'hasCardEditActions'>;

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
