import * as React from 'react';
import { Textarea } from '@contentful/forma-36-react-components';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface MultipleLineEditorProps {
  /**
   * Is a field is disabled initially
   */
  initialDisabled: boolean;

  field: FieldAPI;
}

export function MultipleLineEditor(props: MultipleLineEditorProps) {
  const { field } = props;
  return (
    <FieldConnector field={field} initialDisabled={props.initialDisabled}>
      {({ errors, disabled, value, setValue }) => (
        <div data-test-id="multiple-line-editor">
          <Textarea
            aria-label={field.id}
            rows={3}
            required={field.required}
            error={errors.length > 0}
            disabled={disabled}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setValue(e.target.value);
            }}
          />
        </div>
      )}
    </FieldConnector>
  );
}

MultipleLineEditor.defaultProps = {
  initialDisabled: true
};
