import * as React from 'react';

import { Select } from '@contentful/f36-components';
import {
  FieldAPI,
  FieldConnector,
  PredefinedValuesError,
  LocalesAPI,
} from '@contentful/field-editor-shared';

import { getOptions, parseValue } from './dropdownUtils';
import * as styles from './styles';

export interface DropdownEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;
  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.locales
   */
  locales: LocalesAPI;
}

export function DropdownEditor(props: DropdownEditorProps) {
  const { field, locales } = props;

  const options = getOptions(field);
  const misconfigured = options.length === 0;

  if (misconfigured) {
    return <PredefinedValuesError />;
  }

  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<string | number>
      debounce={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
    >
      {({ value, errors, disabled, setValue }) => (
        <Select
          testId="dropdown-editor"
          isInvalid={errors.length > 0}
          isDisabled={disabled}
          className={direction === 'rtl' ? styles.rightToLeft : ''}
          isRequired={field.required}
          value={value === undefined ? '' : String(value)}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            setValue(parseValue(value, field.type));
          }}
        >
          <Select.Option value="">Choose a value</Select.Option>
          {options.map((option) => (
            <Select.Option key={option.value} value={String(option.value)}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      )}
    </FieldConnector>
  );
}

DropdownEditor.defaultProps = {
  isInitiallyDisabled: true,
};
