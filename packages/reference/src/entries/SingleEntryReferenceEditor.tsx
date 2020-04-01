import * as React from 'react';
import { EntryReferenceValue } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { LinkEntryActions } from './LinkEntryActions';
import { EntryReferenceEditor, EntryReferenceEditorProps } from './EntryReferenceEditor';
import { FetchingWrappedEntryCard } from './WrappedEntryCard/FetchingWrappedEntryCard';

export function SingleEntryReferenceEditor(props: EntryReferenceEditorProps) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  React.useEffect(() => {
    props.onAction && props.onAction({ type: 'rendered', entity: 'Entry' });
  }, []);

  return (
    <EntryReferenceEditor<EntryReferenceValue> {...props}>
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
              canCreateEntry={props.parameters.instance.canCreateEntry}
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
    </EntryReferenceEditor>
  );
}
