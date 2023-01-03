import React from 'react';

import { FieldAPI, ValidationError } from '@contentful/app-sdk';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';

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

interface FieldConnectorProps<ValueType> {
  field: FieldAPI;
  isInitiallyDisabled: boolean;
  children: (state: FieldConnectorChildProps<ValueType>) => React.ReactNode;
  isEmptyValue: (value: ValueType | null) => boolean;
  isEqualValues: (value1: ValueType | Nullable, value2: ValueType | Nullable) => boolean;
  throttle: number;
}

export class FieldConnector<ValueType> extends React.Component<
  FieldConnectorProps<ValueType>,
  FieldConnectorState<ValueType>
> {
  static defaultProps = {
    children: () => {
      return null;
    },
    // eslint-disable-next-line -- TODO: describe this disable
    isEmptyValue: (value: any | Nullable) => {
      return value === null || value === '';
    },
    // eslint-disable-next-line -- TODO: describe this disable
    isEqualValues: (value1: any | Nullable, value2: any | Nullable) => {
      return isEqual(value1, value2);
    },
    throttle: 300,
  };

  constructor(props: FieldConnectorProps<ValueType>) {
    super(props);
    const initialValue = props.field.getValue();
    this.state = {
      isLocalValueChange: false,
      externalReset: 0,
      value: initialValue,
      lastRemoteValue: initialValue,
      disabled: props.isInitiallyDisabled,
      errors: [],
    };
  }

  unsubscribeErrors: Function | null = null;
  unsubscribeDisabled: Function | null = null;
  unsubscribeValue: Function | null = null;

  setValue = async (value: ValueType | Nullable) => {
    if (this.props.isEmptyValue(value ?? null)) {
      this.setState({ value: undefined });
    } else {
      this.setState({ value });
    }

    await this.triggerSetValueCallbacks(value);
  };

  triggerSetValueCallbacks = throttle(
    (value: ValueType | Nullable) => {
      return new Promise((resolve, reject) => {
        if (this.props.isEmptyValue(value ?? null)) {
          this.props.field.removeValue().then(resolve).catch(reject);
        } else {
          this.props.field.setValue(value).then(resolve).catch(reject);
        }
      });
    },
    this.props.throttle,
    {
      leading: this.props.throttle === 0,
    }
  );

  componentDidMount() {
    const { field } = this.props;
    this.unsubscribeErrors = field.onSchemaErrorsChanged((errors: ValidationError[]) => {
      this.setState({
        errors: errors || [],
      });
    });
    this.unsubscribeDisabled = field.onIsDisabledChanged((disabled: boolean) => {
      this.setState({
        disabled,
      });
    });
    this.unsubscribeValue = field.onValueChanged((value: ValueType | Nullable) => {
      this.setState((currentState) => {
        const isLocalValueChange = this.props.isEqualValues(value, currentState.value);
        const lastRemoteValue = isLocalValueChange ? currentState.lastRemoteValue : value;
        const externalReset = currentState.externalReset + (isLocalValueChange ? 0 : 1);
        return {
          value,
          lastRemoteValue,
          isLocalValueChange,
          externalReset,
        };
      });
    });
  }

  componentWillUnmount() {
    if (typeof this.unsubscribeErrors === 'function') {
      this.unsubscribeErrors();
    }
    if (typeof this.unsubscribeDisabled === 'function') {
      this.unsubscribeDisabled();
    }
    if (typeof this.unsubscribeValue === 'function') {
      this.unsubscribeValue();
    }
  }

  render() {
    return this.props.children({
      ...this.state,
      setValue: this.setValue,
    });
  }
}
