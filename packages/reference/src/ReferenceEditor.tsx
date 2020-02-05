import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface ReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

export function ReferenceEditor(props: ReferenceEditorProps) {
  const { field } = props;

  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {() => {
        return <div />;
      }}
    </FieldConnector>
  );
}

ReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
