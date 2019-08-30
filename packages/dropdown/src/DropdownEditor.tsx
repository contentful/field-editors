import * as React from 'react';
import { Select, Option, Note } from '@contentful/forma-36-react-components';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface DropdownEditorProps {
  /**
   * Is a field is disabled initially
   */
  initialDisabled: boolean;

  field: FieldAPI;
}

const formatValue = (value: string, fieldType: string) => {
  if (fieldType === 'Integer') {
    return parseInt(value, 10);
  }
  if (fieldType === 'Number') {
    return parseFloat(value);
  }
  return value;
};

function parseValue(value: string, type: string): string | number | undefined {
  switch (type) {
    case 'Integer': {
      const num = parseInt(value, 10);
      return isNaN(num) ? undefined : value;
    }
    case 'Number': {
      const num = parseFloat(value);
      return isNaN(num) ? undefined : value;
    }
    default:
      return value;
  }
}

export function getOptions(field: FieldAPI) {
  // Get first object that has a 'in' property
  const validations = field.validations || [];
  const predefinedValues = (validations.filter(validation =>
    Object.prototype.hasOwnProperty.call(validation, 'in')
  )[0] || []) as string[];

  return predefinedValues.map(value => ({
    value: parseValue(value, field.type),
    label: String(value)
  }));
}

export function DropdownEditor(props: DropdownEditorProps) {
  const field = props.field;

  const options = getOptions(field);
  const misconfigured = options.length === 0;
  const isDirected = ['Text', 'Symbol'].includes(field.type);

  if (misconfigured) {
    return (
      <Note noteType="warning">
        The widget failed to initialize. You can fix the problem by providing predefined values
        under the validations tab in the field settings.
      </Note>
    );
  }

  return (
    <FieldConnector field={field} initialDisabled={props.initialDisabled}>
      {({ value, errors, disabled, setValue }) => (
        <Select
          testId="dropdown-editor"
          hasError={errors.length > 0}
          isDisabled={disabled}
          className={isDirected ? 'x--directed' : ''}
          required={field.required}
          value={(value || '').toString()}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            if (value === '') {
              setValue('');
            } else {
              setValue(formatValue(value, field.type));
            }
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
  initialDisabled: true
};
