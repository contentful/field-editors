import React from 'react';
import throttle from 'lodash/throttle';
import { FieldAPI } from 'contentful-ui-extensions-sdk';

interface FieldConnectorState {
  value: any;
  disabled: boolean;
  errors: string[];
}

interface FieldConnectorProps {
  field: FieldAPI;
  initialDisabled: boolean;
  children: (
    state: FieldConnectorState & {
      setValue: (value: any) => void;
    }
  ) => React.ReactNode;
  throttle: number;
}

export class FieldConnector extends React.Component<FieldConnectorProps, FieldConnectorState> {
  static defaultProps: Pick<FieldConnectorProps, 'children' | 'throttle'> = {
    children: () => {
      return null;
    },
    throttle: 300
  };

  constructor(props: FieldConnectorProps) {
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

  setValue = throttle((value: any) => {
    if (value === null || value === undefined || value === '') {
      this.props.field.removeValue();
    } else {
      this.props.field.setValue(value);
    }
  }, this.props.throttle);

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
    this.unsubscribeValue = field.onValueChanged(value => {
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
