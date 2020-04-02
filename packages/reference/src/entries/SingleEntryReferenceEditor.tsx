import * as React from 'react';
import { EntryReferenceValue } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { LinkEntryActions } from './LinkEntryActions';
import { ReferenceEditor, ReferenceEditorProps } from '../ReferenceEditor';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';

export function SingleEntryReferenceEditor(props: ReferenceEditorProps) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
  }, []);

  return (
    <ReferenceEditor<EntryReferenceValue> {...props}>
      {({ value, setValue, disabled, externalReset }) => {
        if (!value) {
          const validations = fromFieldValidations(props.sdk.field.validations);
          return (
            <LinkEntryActions
              allContentTypes={allContentTypes}
              validations={validations}
              sdk={props.sdk}
              disabled={disabled}
              multiple={false}
              canCreateEntry={props.parameters.instance.canCreateEntity}
              onCreate={entry => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Entry',
                    id: entry.sys.id
                  }
                });
              }}
              onLink={([entry]) => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Entry',
                    id: entry.sys.id
                  }
                });
              }}
            />
          );
        }
        return (
          <FetchingWrappedEntryCard
            key={`reference-${externalReset}`}
            {...props}
            allContentTypes={allContentTypes}
            disabled={disabled}
            entryId={value.sys.id}
            onRemove={() => {
              setValue(null);
            }}
          />
        );
      }}
    </ReferenceEditor>
  );
}
