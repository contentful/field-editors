import * as React from 'react';

import { FieldAPI, ValidationError } from '@contentful/app-sdk';
import deepEqual from 'fast-deep-equal';
import debounce from 'lodash/debounce';

type Nullable = null | undefined;

export interface FieldConnectorChildProps<ValueType> {
  isLocalValueChange: boolean;
  externalReset: number;
  lastRemoteValue: ValueType | Nullable;
  value: ValueType | Nullable;
  disabled: boolean;
  errors: ValidationError[];
  setValue: (value: ValueType | Nullable) => Promise<unknown>;
}

interface FieldConnectorState<ValueType> {
  isLocalValueChange: boolean;
  externalReset: number;
  lastRemoteValue: ValueType | Nullable;
  value: ValueType | Nullable;
  disabled: boolean;
  errors: ValidationError[];
}

type FieldConnectorProps<ValueType> = {
  field: FieldAPI;
  isInitiallyDisabled: boolean;
  isDisabled?: boolean;
  children?: (state: FieldConnectorChildProps<ValueType>) => React.ReactNode;
  isEmptyValue?: (value: ValueType | null) => boolean;
  isEqualValues?: (value1: ValueType | Nullable, value2: ValueType | Nullable) => boolean;
} & (
  | { debounce?: number }
  | {
      /** @deprecated: Please use `debounce` instead */
      throttle: number;
    }
);

const defaultIsEmptyValue = (value: unknown) => value === null || value === '';
const defaultIsEqualValues = (value1: unknown, value2: unknown) => deepEqual(value1, value2);

export function FieldConnector<ValueType>(props: FieldConnectorProps<ValueType>) {
  const [state, setState] = React.useState<FieldConnectorState<ValueType>>(() => {
    const initialValue = props.field.getValue();
    return {
      isLocalValueChange: false,
      externalReset: 0,
      value: initialValue,
      lastRemoteValue: initialValue,
      disabled: props.isInitiallyDisabled || props.field.getIsDisabled(),
      errors: [],
    };
  });
  const propsRef = React.useRef(props);
  propsRef.current = props;
  const field = props.field;

  const getDebounceDuration = () =>
    'throttle' in propsRef.current ? propsRef.current.throttle : (propsRef.current.debounce ?? 300);

  const triggerSetValueCallbacks = React.useCallback((value: ValueType | Nullable) => {
    return new Promise((resolve, reject) => {
      if ((propsRef.current.isEmptyValue ?? defaultIsEmptyValue)(value ?? null)) {
        propsRef.current.field.removeValue().then(resolve).catch(reject);
      } else {
        propsRef.current.field.setValue(value).then(resolve).catch(reject);
      }
    });
  }, []);

  const debouncedTriggerSetValueCallbacks = React.useMemo(
    () => debounce(triggerSetValueCallbacks, getDebounceDuration()),
    [triggerSetValueCallbacks],
  );

  const setValue = async (value: ValueType | Nullable) => {
    if ((propsRef.current.isEmptyValue ?? defaultIsEmptyValue)(value ?? null)) {
      setState((currentState) => ({ ...currentState, value: undefined }));
    } else {
      setState((currentState) => ({ ...currentState, value }));
    }

    if (getDebounceDuration() === 0) {
      await triggerSetValueCallbacks(value);
    } else {
      await debouncedTriggerSetValueCallbacks(value);
    }
  };

  React.useEffect(() => {
    const unsubscribeErrors = field.onSchemaErrorsChanged((errors: ValidationError[]) => {
      setState((currentState) => ({
        ...currentState,
        errors: errors || [],
      }));
    });
    const unsubscribeDisabled = field.onIsDisabledChanged((disabled: boolean) => {
      setState((currentState) => ({
        ...currentState,
        disabled,
      }));
    });
    const unsubscribeValue = field.onValueChanged((value: ValueType | Nullable) => {
      setState((currentState) => {
        const isLocalValueChange = (propsRef.current.isEqualValues ?? defaultIsEqualValues)(
          value,
          currentState.value,
        );
        const lastRemoteValue = isLocalValueChange ? currentState.lastRemoteValue : value;
        const externalReset = currentState.externalReset + (isLocalValueChange ? 0 : 1);
        return {
          ...currentState,
          value,
          lastRemoteValue,
          isLocalValueChange,
          externalReset,
        };
      });
    });

    return () => {
      unsubscribeErrors();
      unsubscribeDisabled();
      unsubscribeValue();
      debouncedTriggerSetValueCallbacks.cancel();
    };
  }, [debouncedTriggerSetValueCallbacks, field]);

  return (
    props.children?.({
      ...state,
      setValue,
      disabled: props.isDisabled || state.disabled,
    }) ?? null
  );
}
