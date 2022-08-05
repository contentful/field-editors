import * as React from 'react';

import { TextInput } from '@contentful/f36-components';
import { ArrowUpTrimmedIcon, ArrowDownTrimmedIcon } from '@contentful/f36-icons';
import {
  FieldAPI,
  FieldConnector,
  FieldConnectorChildProps,
} from '@contentful/field-editor-shared';

import { styles } from './NumberEditor.styles';
import { isNumberInputValueValid, parseNumber } from './parseNumber';
import { getRangeFromField, valueToString, countDecimals } from './utils';

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

type InnerNumberEditorProps = Pick<
  FieldConnectorChildProps<number>,
  'disabled' | 'errors' | 'setValue' | 'value'
> & {
  field: NumberEditorProps['field'];
};

enum StepChangeType {
  Increment = 'increment',
  Decrement = 'decrement',
}

const NUMBER_STEP = 1;

function InnerNumberEditor({
  disabled,
  errors,
  field,
  setValue,
  value: sdkValue,
}: InnerNumberEditorProps) {
  const [inputValue, setInputValue] = React.useState(valueToString(sdkValue));
  const range = getRangeFromField(field);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const stringSdkValue = valueToString(sdkValue);
    // Update the input value if the SDK value (numeric) changes
    if (stringSdkValue !== inputValue) {
      setInputValue(stringSdkValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we want to trigger it only when sdkValue has changed
  }, [sdkValue]);

  const updateExternalValue = (value: number | undefined) => {
    if (sdkValue !== value) {
      setValue(value);
    }
  };

  const changeValueByStep = (type: StepChangeType) => {
    const currentValue = Number.isNaN(+inputValue) ? 0 : +inputValue;
    let nextValue =
      type === StepChangeType.Increment ? currentValue + NUMBER_STEP : currentValue - NUMBER_STEP;
    // Floating point numbers cannot represent all decimals precisely in binary.
    // This can lead to unexpected results, such as 0.1 + 0.2 = 0.30000000000000004.
    // See more details: https://floating-point-gui.de/
    nextValue = +nextValue.toFixed(countDecimals(currentValue));

    setInputValue(valueToString(nextValue));
    setValue(nextValue);
  };

  // Keeps focus on the input
  const handleControlPointerDown: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<any>) => {
    const keyToFnMap: {
      [key: string]: () => void;
    } = {
      ArrowUp: () => changeValueByStep(StepChangeType.Increment),
      ArrowDown: () => changeValueByStep(StepChangeType.Decrement),
    };

    const fn = keyToFnMap[event.key];
    if (fn) {
      event.preventDefault();
      fn();
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
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
  };

  return (
    <div data-test-id="number-editor" className={styles.container}>
      <TextInput
        // With type="number" react doesn't call onChange for certain inputs, for example if you type `e`
        // so we use "text" instead and fully rely on our own validation.
        // See more details: https://github.com/facebook/react/issues/6556
        type="text"
        testId="number-editor-input"
        className={styles.input}
        min={range.min}
        max={range.max}
        step={NUMBER_STEP}
        isRequired={field.required}
        isInvalid={errors.length > 0}
        isDisabled={disabled}
        value={inputValue}
        ref={inputRef}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        // The same role that input type="number" has
        // See more details: https://www.digitala11y.com/spinbutton-role/
        role="spinbutton"
        aria-valuenow={sdkValue ?? 0}
        aria-valuetext={inputValue}
        aria-valuemin={range.min}
        aria-valuemax={range.max}
      />
      {/**
       * We hide this controls from screen readers and keyboard focus.
       * For those purposes we have a keyboard handler. The same way native input number works.
       */}
      {!disabled && (
        <div className={styles.controlsWrapper} aria-hidden="true">
          <button
            tabIndex={-1}
            className={styles.control}
            onClick={() => changeValueByStep(StepChangeType.Increment)}
            onPointerDown={handleControlPointerDown}>
            <ArrowUpTrimmedIcon size="medium" />
          </button>
          <button
            tabIndex={-1}
            className={styles.control}
            onClick={() => changeValueByStep(StepChangeType.Decrement)}
            onPointerDown={handleControlPointerDown}>
            <ArrowDownTrimmedIcon size="medium" />
          </button>
        </div>
      )}
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
