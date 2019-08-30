import * as React from 'react';
import { Select, Option } from '@contentful/forma-36-react-components';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface DropdownEditorProps {
  /**
   * Is a field is disabled initially
   */
  initialDisabled: boolean;

  field: FieldAPI;
}

export function DropdownEditor(props: DropdownEditorProps) {
  const { field } = props;

  return (
    <FieldConnector field={field} initialDisabled={props.initialDisabled}>
      {() => (
        <div data-test-id="dropdown-editor">
          <Select>
            <Option value="one">1</Option>
          </Select>
        </div>
      )}
    </FieldConnector>
  );
}

DropdownEditor.defaultProps = {
  initialDisabled: true
};
