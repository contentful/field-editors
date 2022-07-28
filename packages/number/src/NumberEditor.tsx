import * as React from 'react';

import { TextInput } from '@contentful/f36-components';
import {
  FieldAPI,
  FieldConnector,
  FieldConnectorChildProps,
} from '@contentful/field-editor-shared';

import { isNumberInputValueValid, parseNumber } from './parseNumber';

export interface NumberEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;
}

type RangeValidation = { min?: number; max?: number };

function getRangeFromField(field: FieldAPI): RangeValidation {
  const validations = field.validations || [];
  const result = validations.find((validation) => (validation as any).range) as
    | { range: RangeValidation }
    | undefined;
  return result ? result.range : {};
}

function valueToString(value: InnerNumberEditorProps['value']) {
  return value === undefined ? '' : String(value);
}

type InnerNumberEditorProps = Pick<
  FieldConnectorChildProps<number>,
  'disabled' | 'errors' | 'setValue' | 'value'
> & {
  field: NumberEditorProps['field'];
};

function InnerNumberEditor({
  disabled,
  errors,
  field,
  setValue,
  value: sdkValue,
}: InnerNumberEditorProps) {
  const [inputValue, setInputValue] = React.useState(valueToString(sdkValue));
  const range = getRangeFromField(field);

  React.useEffect(() => {
    const stringSdkValue = valueToString(sdkValue);
    // Update the input value if the SDK value (numeric) changes
    if (stringSdkValue !== inputValue) {
      setInputValue(stringSdkValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we want to trigger it only when sdkValue had been changed
  }, [sdkValue]);

  const updateExternalValue = (value: number | undefined) => {
    if (sdkValue !== value) {
      setValue(value);
    }
  };

  return (
    <div data-test-id="number-editor">
      <TextInput
        testId="number-editor-input"
        min={range.min}
        max={range.max}
        step={1}
        isRequired={field.required}
        isInvalid={errors.length > 0}
        isDisabled={disabled}
        value={inputValue}
        // With type="number" react doesn't call onChange for certain inputs, for example if you type `e`
        // so we use "text" instead and fully rely on our own validation.
        // See more details: https://github.com/facebook/react/issues/6556
        type="text"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (!value) {
            setInputValue(value);
            updateExternalValue(undefined);
            return;
          }

          if (!isNumberInputValueValid(value, field.type)) {
            return;
          }

          setInputValue(value);

          const parsedNumber = parseNumber(value, field.type);
          field.setInvalid(!parsedNumber);
          if (parsedNumber) {
            updateExternalValue(parsedNumber);
          }
        }}
      />
    </div>
  );
}

export function NumberEditor(props: NumberEditorProps) {
  const { field } = props;

  return (
    <FieldConnector<number> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({
        value,
        errors,
        disabled,
        setValue,
      }: Pick<FieldConnectorChildProps<number>, 'disabled' | 'errors' | 'setValue' | 'value'>) => (
        <InnerNumberEditor
          disabled={disabled}
          errors={errors}
          field={field}
          setValue={setValue}
          value={value}
        />
      )}
    </FieldConnector>
  );
}

NumberEditor.defaultProps = {
  isInitiallyDisabled: true,
};
