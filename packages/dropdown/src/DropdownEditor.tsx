import * as React from 'react';
import { Select, Option } from '@contentful/forma-36-react-components';
import { FieldAPI, FieldConnector, PredefinedValuesError } from '@contentful/field-editor-shared';
import { getOptions, parseValue } from './dropdownUtils';

export interface DropdownEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

export function DropdownEditor(props: DropdownEditorProps) {
  const { field } = props;

  const options = getOptions(field);
  const misconfigured = options.length === 0;
  const isDirected = ['Text', 'Symbol'].includes(field.type);

  if (misconfigured) {
    return <PredefinedValuesError />;
  }

  return (
    <FieldConnector<string | number>
      throttle={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, errors, disabled, setValue }) => (
        <Select
          testId="dropdown-editor"
          hasError={errors.length > 0}
          isDisabled={disabled}
          className={isDirected ? 'x--directed' : ''}
          required={field.required}
          value={value === undefined ? '' : String(value)}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setValue(parseValue(value, field.type));
          }}>
          <Option value="">Choose a value</Option>
          {options.map(option => (
            <Option key={option.value} value={String(option.value)}>
              {option.label}
            </Option>
          ))}
        </Select>
      )}
    </FieldConnector>
  );
}

DropdownEditor.defaultProps = {
  isInitiallyDisabled: true
};
