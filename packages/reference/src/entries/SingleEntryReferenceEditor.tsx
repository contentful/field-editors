import * as React from 'react';
import { EntryReferenceValue } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { LinkEntityActions } from '../components';
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
            <LinkEntityActions
              entityType="Entry"
              allContentTypes={allContentTypes}
              validations={validations}
              sdk={props.sdk}
              disabled={disabled}
              multiple={false}
              canCreateEntity={props.parameters.instance.canCreateEntity}
              onCreate={id => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Entry',
                    id
                  }
                });
              }}
              onLink={([id]) => {
                setValue({
                  sys: {
                    type: 'Link',
                    linkType: 'Entry',
                    id
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
