import React from 'react';
import throttle from 'lodash/throttle';
import { FieldAPI } from 'contentful-ui-extensions-sdk';

interface FieldConnectorState<ValueType> {
  value: ValueType;
  disabled: boolean;
  errors: string[];
}

interface FieldConnectorProps<ValueType> {
  field: FieldAPI;
  initialDisabled: boolean;
  children: (
    state: FieldConnectorState<ValueType> & {
      setValue: (value: ValueType) => void;
    }
  ) => React.ReactNode;
  isEmptyValue?: (value: ValueType) => boolean;
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
    throttle: 300
  };

  constructor(props: FieldConnectorProps<ValueType>) {
    super(props);
    this.state = {
      value: props.field.getValue(),
      disabled: props.initialDisabled,
      errors: []
    };
  }

  unsubscribeErrors: Function | null = null;
  unsubscribeDisabled: Function | null = null;
  unsubscribeValue: Function | null = null;

  isEmptyValueDefault = (value: ValueType) => {
    // @ts-ignore
    return value === null || value === undefined || value === '';
  };

  setValue = throttle(
    (value: ValueType) => {
      const isEmptyValueFn = this.props.isEmptyValue || this.isEmptyValueDefault;
      if (isEmptyValueFn(value)) {
        this.props.field.removeValue();
      } else {
        this.props.field.setValue(value);
      }
    },
    this.props.throttle,
    { leading: false }
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
    this.unsubscribeValue = field.onValueChanged((value: ValueType) => {
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
