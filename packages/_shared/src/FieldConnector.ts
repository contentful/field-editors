import React from 'react';
import throttle from 'lodash/throttle';
import { FieldAPI } from 'contentful-ui-extensions-sdk';

type Nullable = null | undefined;

interface FieldConnectorState<ValueType> {
  value: ValueType | Nullable;
  disabled: boolean;
  errors: string[];
}

interface FieldConnectorProps<ValueType> {
  field: FieldAPI;
  isInitiallyDisabled: boolean;
  children: (
    state: FieldConnectorState<ValueType> & {
      setValue: (value: ValueType | Nullable) => void;
    }
  ) => React.ReactNode;
  isEmptyValue: (value: ValueType | null) => boolean;
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
      // @ts-ignore
      return value === null || value === '';
    },
    throttle: 300
  };

  constructor(props: FieldConnectorProps<ValueType>) {
    super(props);
    this.state = {
      value: props.field.getValue(),
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
        this.props.field.removeValue();
      } else {
        this.props.field.setValue(value);
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
        disabled: disabled
      });
    });
    this.unsubscribeValue = field.onValueChanged((value: ValueType | Nullable) => {
      this.setState({
        value
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
      setValue: this.setValue
    });
  }
}
