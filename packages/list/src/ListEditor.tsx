import * as React from 'react';
import { FieldAPI, LocalesAPI, FieldConnector } from '@contentful/field-editor-shared';
import * as styles from './styles';

import { TextInput } from '@contentful/f36-components';

export interface ListEditorProps {
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

function isEmptyListValue(value: ListValue | null) {
  return value === null || value.length === 0;
}

export function ListEditor(props: ListEditorProps) {
  const { field, locales } = props;

  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<ListValue>
      throttle={0}
      isEmptyValue={isEmptyListValue}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ setValue, value, errors, disabled }) => {
        const valueAsString = (value || []).join(', ');

        const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const valueAsArray = e.target.value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item);
          setValue(valueAsArray);
        };

        return (
          <TextInput
            testId="list-editor-input"
            className={direction === 'rtl' ? styles.rightToLeft : ''}
            isRequired={field.required}
            isInvalid={errors.length > 0}
            isDisabled={disabled}
            value={valueAsString}
            onChange={onChange}
          />
        );
      }}
    </FieldConnector>
  );
}

ListEditor.defaultProps = {
  isInitiallyDisabled: true,
};
