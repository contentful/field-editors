import * as React from 'react';
import {
  FieldAPI,
  FieldConnector,
  FieldConnectorChildProps,
} from '@contentful/field-editor-shared';
import { parseNumber } from './parseNumber';

import { TextInput } from '@contentful/f36-components';

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
  const previousValue = React.useRef(valueToString(sdkValue));
  const [inputValue, setInputValue] = React.useState(valueToString(sdkValue));
  const range = getRangeFromField(field);

  React.useEffect(() => {
    previousValue.current = valueToString(sdkValue);
  }, [sdkValue]);

  React.useEffect(() => {
    const stringifiedSdkValue = valueToString(sdkValue);
    // Update the input value (string) if the SDK value (numeric) changes
    if (stringifiedSdkValue !== previousValue.current && stringifiedSdkValue !== inputValue) {
      setInputValue(stringifiedSdkValue);
    }
  }, [inputValue, sdkValue]);

  return (
    <div data-test-id="number-editor">
      <TextInput
        testId="number-editor-input"
        min={range.min !== undefined ? String(range.min) : ''}
        max={range.max !== undefined ? String(range.max) : ''}
        step={field.type === 'Integer' ? '1' : ''}
        isRequired={field.required}
        isInvalid={errors.length > 0}
        isDisabled={disabled}
        value={inputValue}
        // React cannot call onChange for certain changes to type="number"
        // so we use "text" instead. See https://github.com/facebook/react/issues/6556
        type="text"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const parseResult = parseNumber(e.target.value, field.type);
          field.setInvalid(!parseResult.isValid);

          if (parseResult.isValid) {
            setValue(parseResult.value);
          }

          setInputValue(e.target.value);
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
