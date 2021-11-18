import * as React from 'react';
import { FieldAPI, FieldConnector, LocalesAPI } from '@contentful/field-editor-shared';
import * as styles from './styles';
import isEqual from 'lodash/isEqual';

import { TextInput } from '@contentful/f36-components';
import { FieldConnectorChildProps } from '@contentful/field-editor-shared/dist/FieldConnector';

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
      {(childProps) => (
        <ListEditorInternal {...childProps} direction={direction} isRequired={field.required} />
      )}
    </FieldConnector>
  );
}

function ListEditorInternal({
  setValue,
  value,
  errors,
  disabled,
  direction,
  isRequired,
}: FieldConnectorChildProps<ListValue> & { direction: 'rtl' | 'ltr'; isRequired: boolean }) {
  const [valueState, setValueState] = React.useState(() => (value || []).join(', '));

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueAsArray = e.target.value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);
    const changed = !isEqual(valueAsArray, value);
    setValue(valueAsArray);

    const valueAsString = valueAsArray.join(', ');
    setValueState(changed ? valueAsString : e.target.value);
  };

  return (
    <TextInput
      testId="list-editor-input"
      className={direction === 'rtl' ? styles.rightToLeft : ''}
      isRequired={isRequired}
      isInvalid={errors.length > 0}
      isDisabled={disabled}
      value={valueState}
      onChange={onChange}
    />
  );
}

ListEditor.defaultProps = {
  isInitiallyDisabled: true,
};
