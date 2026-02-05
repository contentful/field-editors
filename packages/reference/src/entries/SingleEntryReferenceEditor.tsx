import * as React from 'react';

import { useActiveLocales } from '@contentful/field-editor-shared';

import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SingleReferenceEditor } from '../common/SingleReferenceEditor';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';

export function SingleEntryReferenceEditor(props: ReferenceEditorProps) {
  const activeLocales = useActiveLocales(props.sdk);

  return (
    <SingleReferenceEditor {...props} entityType="Entry">
      {({
        allContentTypes,
        isDisabled,
        entityId,
        setValue,
        renderCustomCard,
        hasCardRemoveActions,
        hasCardEditActions,
      }) => {
        return (
          <FetchingWrappedEntryCard
            {...props}
            allContentTypes={allContentTypes}
            isDisabled={isDisabled}
            entryId={entityId}
            renderCustomCard={renderCustomCard}
            hasCardEditActions={hasCardEditActions}
            hasCardRemoveActions={hasCardRemoveActions}
            activeLocales={activeLocales}
            addReferenceToRelease={props.addReferenceToRelease}
            onRemove={() => {
              setValue(null);
            }}
          />
        );
      }}
    </SingleReferenceEditor>
  );
}

SingleEntryReferenceEditor.defaultProps = {
  isInitiallyDisabled: true,
};
