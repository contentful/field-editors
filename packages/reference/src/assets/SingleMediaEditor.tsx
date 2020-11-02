import * as React from 'react';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SingleReferenceEditor } from '../common/SingleReferenceEditor';

type EditorProps = Omit<ReferenceEditorProps, 'hasCardEditActions'>;

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
