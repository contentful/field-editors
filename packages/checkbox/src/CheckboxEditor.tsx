import * as React from 'react';
import { cx } from 'emotion';
import get from 'lodash/get';
import {
  FieldAPI,
  LocalesAPI,
  FieldConnector,
  PredefinedValuesError,
} from '@contentful/field-editor-shared';
import { CheckboxField, Form } from '@contentful/forma-36-react-components';
import * as styles from './styles';

export interface CheckboxEditorProps {
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

type ListValue = string[];

type CheckboxOption = { id: string; value: string; label: string };

function isEmptyListValue(value: ListValue | null) {
  return value === null || value.length === 0;
}

export function getOptions(field: FieldAPI): CheckboxOption[] {
  // Get first object that has a 'in' property
  const validations = get(field, ['items', 'validations'], []) as Record<
    string,
    { in?: string[] }
  >[];

  const predefinedValues = validations
    .filter((validation) => validation.in)
    .map((validation) => validation.in);

  const firstPredefinedValues = (predefinedValues.length > 0
    ? predefinedValues[0]
    : []) as string[];

  return firstPredefinedValues.map((value: string, index) => ({
    id: ['entity', field.id, field.locale, index].join('.'),
    value,
    label: value,
  }));
}

export function CheckboxEditor(props: CheckboxEditorProps) {
  const { field, locales } = props;

  const options = getOptions(field);
  const misconfigured = options.length === 0;

  if (misconfigured) {
    return <PredefinedValuesError />;
  }

  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<ListValue>
      throttle={0}
      isEmptyValue={isEmptyListValue}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ disabled, value, setValue }) => {
        const values = value || [];

        const addValue = (value: string) => {
          const newValues = [...values.filter((item) => item !== value), value];
          setValue(newValues);
        };

        const removeValue = (value: string) => {
          const newValues = values.filter((item) => item !== value);
          setValue(newValues);
        };

        return (
          <Form
            testId="checkbox-editor"
            spacing="condensed"
            className={cx(styles.form, direction === 'rtl' ? styles.rightToLeft : '')}>
            {options.map((item) => (
              <CheckboxField
                key={item.id}
                labelIsLight
                id={item.id}
                checked={values.includes(item.value)}
                labelText={item.label}
                disabled={disabled}
                value={item.value}
                name={`${field.id}.${field.locale}`}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.checked) {
                    addValue(item.value);
                  } else {
                    removeValue(item.value);
                  }
                }}
              />
            ))}
          </Form>
        );
      }}
    </FieldConnector>
  );
}

CheckboxEditor.defaultProps = {
  isInitiallyDisabled: true,
};
