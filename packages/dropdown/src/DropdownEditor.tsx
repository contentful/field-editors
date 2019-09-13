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

type DropdownValue = string | number;

type DropdownOption = {
  value: DropdownValue | undefined;
  label: string;
};

function parseValue(value: string, fieldType: string): DropdownValue | undefined {
  if (value === '') {
    return undefined;
  }
  if (fieldType === 'Integer' || fieldType === 'Number') {
    const asNumber = Number(value);
    return isNaN(asNumber) ? undefined : asNumber;
  }
  return value;
}

export function getOptions(field: FieldAPI): DropdownOption[] {
  // Get first object that has a 'in' property
  const validations = field.validations || [];
  const predefinedValues = validations
    .filter(validation => (validation as any).in)
    .map(validation => (validation as any).in);

  const firstPredefinedValues = predefinedValues.length > 0 ? predefinedValues[0] : [];

  return firstPredefinedValues
    .map((value: string) => ({
      value: parseValue(value, field.type),
      label: String(value)
    }))
    .filter((item: { value: DropdownValue | undefined; label: string }) => {
      return item.value !== undefined;
    });
}

export function DropdownEditor(props: DropdownEditorProps) {
  const { field } = props;

  const options = getOptions(field);
  const misconfigured = options.length === 0;
  const isDirected = ['Text', 'Symbol'].includes(field.type);

  if (misconfigured) {
    return (
      <Note noteType="warning" testId="predefined-values-warning">
        The widget failed to initialize. You can fix the problem by providing predefined values
        under the validations tab in the field settings.
      </Note>
    );
  }

  return (
    <FieldConnector<DropdownValue>
      throttle={0}
      field={field}
      initialDisabled={props.initialDisabled}>
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
  initialDisabled: true
};
