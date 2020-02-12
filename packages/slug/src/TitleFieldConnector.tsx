import React from 'react';
import { BaseExtensionSDK, FieldAPI } from 'contentful-ui-extensions-sdk';

type Nullable = null | undefined;

interface TitleFieldConnectorState<ValueType> {
  titleValue: ValueType | Nullable;
  titleDisabled: boolean;
  isPublished: boolean;
  isSame: boolean;
}

interface TitleFieldConnectorProps<ValueType> {
  sdk: BaseExtensionSDK;
  field: FieldAPI;
  defaultLocale: string;
  isOptionalLocaleWithFallback: boolean;
  isInitiallyDisabled: boolean;
  children: (state: TitleFieldConnectorState<ValueType>) => React.ReactNode;
}

function getTitleField(sdk: BaseExtensionSDK) {
  const { entry, contentType } = sdk;
  return entry.fields[contentType.displayField];
}

export class TitleFieldConnector<ValueType> extends React.Component<
  TitleFieldConnectorProps<ValueType>,
  TitleFieldConnectorState<ValueType>
> {
  static defaultProps = {
    children: () => {
      return null;
    }
  };

  constructor(props: TitleFieldConnectorProps<ValueType>) {
    super(props);
    const titleField = getTitleField(props.sdk);
    const entrySys = props.sdk.entry.getSys();
    const isSame = titleField ? props.field.id === titleField.id : false;
    this.state = {
      titleValue: titleField ? titleField.getValue() : '',
      titleDisabled: props.isInitiallyDisabled,
      isPublished: Boolean(entrySys.publishedVersion),
      isSame
    };
  }

  unsubscribeDisabled: Function | null = null;
  unsubscribeValue: Function | null = null;
  unsubscribeSysChanges: Function | null = null;

  componentDidMount() {
    const titleField = getTitleField(this.props.sdk);

    if (!titleField || this.state.isSame) {
      return;
    }

    let trackingLocale = this.props.field.locale;

    if (this.props.field.locale !== this.props.defaultLocale) {
      if (!this.props.isOptionalLocaleWithFallback) {
        trackingLocale = this.props.defaultLocale;
      }
    }

    this.unsubscribeDisabled = titleField.onIsDisabledChanged(
      trackingLocale,
      (disabled: boolean) => {
        this.setState({
          titleDisabled: disabled
        });
      }
    );
    this.unsubscribeValue = titleField.onValueChanged(
      trackingLocale,
      (value: ValueType | Nullable) => {
        this.setState({ titleValue: value });
      }
    );

    this.unsubscribeSysChanges = this.props.sdk.entry.onSysChanged(sys => {
      this.setState({
        isPublished: Boolean(sys.publishedVersion)
      });
    });
  }

  componentWillUnmount() {
    if (typeof this.unsubscribeDisabled === 'function') {
      this.unsubscribeDisabled();
    }
    if (typeof this.unsubscribeValue === 'function') {
      this.unsubscribeValue();
    }
    if (typeof this.unsubscribeSysChanges === 'function') {
      this.unsubscribeSysChanges();
    }
  }

  render() {
    return this.props.children({
      ...this.state
    });
  }
}
