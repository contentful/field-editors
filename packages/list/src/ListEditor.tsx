import * as React from 'react';

import { TextInput } from '@contentful/f36-components';
import { FieldAPI, FieldConnector, LocalesAPI } from '@contentful/field-editor-shared';
import { FieldConnectorChildProps } from '@contentful/field-editor-shared';
import isEqual from 'lodash/isEqual';

import * as styles from './styles';

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

  /**
   * id used for associating the input field with its label
   */
  id?: string;
}

type ListValue = string[];

function isEmptyListValue(value: ListValue | null) {
  return value === null || value.length === 0;
}

const useExternalChanges = (cb: (newValue: string) => void, externalValue?: ListValue | null) => {
  const lastExternalValue = React.useRef(externalValue);

  React.useEffect(() => {
    if (isEqual(lastExternalValue.current, externalValue)) {
      return;
    }

    lastExternalValue.current = externalValue;

    cb((externalValue ?? []).join(', '));
  }, [cb, externalValue]);
};

export function ListEditor(props: ListEditorProps) {
  const { field, locales, id } = props;

  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<ListValue>
      debounce={0}
      isEmptyValue={isEmptyListValue}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
    >
      {(childProps) => (
        <ListEditorInternal
          {...childProps}
          direction={direction}
          isRequired={field.required}
          id={id}
        />
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
  id,
}: FieldConnectorChildProps<ListValue> & {
  direction: 'rtl' | 'ltr';
  isRequired: boolean;
  id?: string;
}) {
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

  // Ensure changes done via sdk.field.setValue are reflected
  useExternalChanges(setValueState, value);

  return (
    <TextInput
      id={id}
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
