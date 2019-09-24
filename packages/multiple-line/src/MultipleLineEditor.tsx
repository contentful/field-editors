import * as React from 'react';
import { Textarea } from '@contentful/forma-36-react-components';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface MultipleLineEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

export function MultipleLineEditor(props: MultipleLineEditorProps) {
  const { field } = props;
  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ errors, disabled, value, setValue }) => {
        return (
          <div data-test-id="multiple-line-editor">
            <Textarea
              className="x--directed"
              rows={3}
              required={field.required}
              error={errors.length > 0}
              disabled={disabled}
              value={value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(e.target.value);
              }}
            />
          </div>
        );
      }}
    </FieldConnector>
  );
}

MultipleLineEditor.defaultProps = {
  isInitiallyDisabled: true
};
