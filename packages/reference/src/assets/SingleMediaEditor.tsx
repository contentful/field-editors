import * as React from 'react';

import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SingleReferenceEditor } from '../common/SingleReferenceEditor';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';

// Omit<ReferenceEditorProps, 'hasCardEditActions'>;
// does not work nice with <Props of={SingleMediaEditor} /> from docz
// so the docs won't be generated for the props
type EditorProps = Pick<
  ReferenceEditorProps,
  Exclude<keyof ReferenceEditorProps, 'hasCardEditActions'>
>;

export function SingleMediaEditor(props: EditorProps) {
  return (
    <SingleReferenceEditor {...props} entityType="Asset">
      {({ entityId, isDisabled, setValue }) => (
        <FetchingWrappedAssetCard
          {...props}
          viewType="big_card"
          assetId={entityId}
          isDisabled={isDisabled}
          onRemove={() => {
            setValue(null);
          }}
        />
      )}
    </SingleReferenceEditor>
  );
}

SingleMediaEditor.defaultProps = {
  isInitiallyDisabled: true,
};
