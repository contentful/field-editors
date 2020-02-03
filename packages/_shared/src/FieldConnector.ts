import React from 'react';
import throttle from 'lodash/throttle';
import { isEqual, omit } from 'lodash-es';
import { FieldAPI } from 'contentful-ui-extensions-sdk';

type Nullable = null | undefined;

export interface FieldConnectorChildProps<ValueType> {
  isLocalValueChange: boolean;
  externalReset: number;
  lastRemoteValue: ValueType | Nullable;
  value: ValueType | Nullable;
  disabled: boolean;
  errors: string[];
  setValue: (value: ValueType | Nullable) => void;
}

interface FieldConnectorState<ValueType> {
  isLocalValueChange: boolean;
  externalReset: number;
  lastSetValue: ValueType | Nullable;
  lastRemoteValue: ValueType | Nullable;
  value: ValueType | Nullable;
  disabled: boolean;
  errors: string[];
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
    // eslint-disable-next-line
    isEmptyValue: (value: any | Nullable) => {
      return value === null || value === '';
    },
    // eslint-disable-next-line
    isEqualValues: (value1: any | Nullable, value2: any | Nullable) => {
      return isEqual(value1, value2);
    },
    throttle: 300
  };

  constructor(props: FieldConnectorProps<ValueType>) {
    super(props);
    const initialValue = props.field.getValue();
    this.state = {
      isLocalValueChange: false,
      externalReset: 0,
      value: initialValue,
      lastSetValue: initialValue,
      lastRemoteValue: initialValue,
      disabled: props.isInitiallyDisabled,
      errors: []
    };
  }

  unsubscribeErrors: Function | null = null;
  unsubscribeDisabled: Function | null = null;
  unsubscribeValue: Function | null = null;

  setValue = throttle(
    (value: ValueType | Nullable) => {
      if (this.props.isEmptyValue(value === undefined ? null : value)) {
        this.setState(
          {
            lastSetValue: undefined
          },
          () => {
            this.props.field.removeValue();
          }
        );
      } else {
        this.setState(
          {
            lastSetValue: value
          },
          () => {
            this.props.field.setValue(value);
          }
        );
      }
    },
    this.props.throttle,
    { leading: this.props.throttle === 0 }
  );

  componentDidMount() {
    const { field } = this.props;
    this.unsubscribeErrors = field.onSchemaErrorsChanged((errors: string[]) => {
      this.setState({
        errors: errors || []
      });
    });
    this.unsubscribeDisabled = field.onIsDisabledChanged((disabled: boolean) => {
      this.setState({
        disabled
      });
    });
    this.unsubscribeValue = field.onValueChanged((value: ValueType | Nullable) => {
      this.setState(currentState => {
        const isLocalValueChange = this.props.isEqualValues(value, currentState.lastSetValue);
        const lastRemoteValue = isLocalValueChange ? currentState.lastRemoteValue : value;
        const externalReset = currentState.externalReset + (isLocalValueChange ? 0 : 1);
        return {
          value,
          lastSetValue: value,
          lastRemoteValue,
          isLocalValueChange,
          externalReset
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
    // `lastSetValue` can be either the `setValue()` value right after it got called
    // or the current remote value. No use-case for passing this to child.
    const childProps = omit(this.state, 'lastSetValue');
    return this.props.children({
      ...childProps,
      setValue: this.setValue
    });
  }
}
