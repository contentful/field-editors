import * as React from 'react';
import { FetchingWrappedAssetCard } from './WrappedAssetCard/FetchingWrappedAssetCard';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SingleReferenceEditor } from '../common/SingleReferenceEditor';

export function SingleAssetReferenceEditor(props: ReferenceEditorProps) {
  return (
    <SingleReferenceEditor {...props} entityType="Asset">
      {({ externalReset, entityId, disabled, onRemove }) => (
        <FetchingWrappedAssetCard
          key={`single-asset-${externalReset}`}
          {...props}
          viewType="item"
          assetId={entityId}
          disabled={disabled}
          onRemove={onRemove}
        />
      )}
    </SingleReferenceEditor>
  );
}

SingleAssetReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
