import * as React from 'react';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SingleReferenceEditor } from '../common/SingleReferenceEditor';

export function SingleMediaEditor(props: ReferenceEditorProps) {
  return (
    <SingleReferenceEditor {...props} entityType="Asset">
      {({ externalReset, entityId, isDisabled, onRemove }) => (
        <FetchingWrappedAssetCard
          key={`single-asset-${externalReset}`}
          {...props}
          viewType="big_card"
          assetId={entityId}
          isDisabled={isDisabled}
          onRemove={onRemove}
        />
      )}
    </SingleReferenceEditor>
  );
}

SingleMediaEditor.defaultProps = {
  isInitiallyDisabled: true
};
