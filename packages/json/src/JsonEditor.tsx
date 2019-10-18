import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface JsonEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

export function JsonEditor(props: JsonEditorProps) {
  const { field } = props;
  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {() => {
        return <div data-test-id="json-editor" />;
      }}
    </FieldConnector>
  );
}

JsonEditor.defaultProps = {
  isInitiallyDisabled: true
};
