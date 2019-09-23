import * as React from 'react';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface CheckboxEditorProps {
  /**
   * Is a field is disabled initially
   */
  initialDisabled: boolean;

  field: FieldAPI;
}

type ListValue = string[];

function isEmptyListValue(value: ListValue | null) {
  return value === null || value.length === 0;
}

export function CheckboxEditor(props: CheckboxEditorProps) {
  const { field } = props;

  return (
    <FieldConnector<ListValue>
      throttle={0}
      isEmptyValue={isEmptyListValue}
      field={field}
      initialDisabled={props.initialDisabled}>
      {() => {
        return <div />;
      }}
    </FieldConnector>
  );
}

CheckboxEditor.defaultProps = {
  initialDisabled: true
};
