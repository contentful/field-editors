import * as React from 'react';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SingleReferenceEditor } from '../common/SingleReferenceEditor';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';

export function SingleEntryReferenceEditor(props: ReferenceEditorProps) {
  return (
    <SingleReferenceEditor {...props} entityType="Entry">
      {({ allContentTypes, disabled, entityId, externalReset, onRemove }) => {
        return (
          <FetchingWrappedEntryCard
            key={`reference-${externalReset}`}
            {...props}
            allContentTypes={allContentTypes}
            disabled={disabled}
            entryId={entityId}
            onRemove={onRemove}
          />
        );
      }}
    </SingleReferenceEditor>
  );
}
