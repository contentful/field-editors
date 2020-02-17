import React from 'react';
import { BaseExtensionSDK, FieldAPI } from 'contentful-ui-extensions-sdk';

type Nullable = null | undefined;

interface TitleFieldConnectorState<ValueType> {
  titleValue: ValueType | Nullable;
  isPublished: boolean;
  isSame: boolean;
}

interface TitleFieldConnectorProps<ValueType> {
  sdk: BaseExtensionSDK;
  field: FieldAPI;
  defaultLocale: string;
  isOptionalLocaleWithFallback: boolean;
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
      isPublished: Boolean(entrySys.publishedVersion),
      isSame
    };
  }

  unsubscribeValue: Function | null = null;
  unsubscribeLocalizedValue: Function | null = null;
  unsubscribeSysChanges: Function | null = null;

  componentDidMount() {
    this.unsubscribeSysChanges = this.props.sdk.entry.onSysChanged(sys => {
      this.setState({
        isPublished: Boolean(sys.publishedVersion)
      });
    });

    const titleField = getTitleField(this.props.sdk);

    // the content type's display field might not exist
    if (!titleField) {
      return;
    }

    if (!this.state.isSame) {
      this.unsubscribeLocalizedValue = titleField.onValueChanged(
        this.props.field.locale,
        (value: ValueType | Nullable) => {
          this.setState({ titleValue: value });
        }
      );
    }

    if (this.props.field.locale !== this.props.defaultLocale) {
      if (!this.props.isOptionalLocaleWithFallback) {
        this.unsubscribeValue = titleField.onValueChanged(
          this.props.defaultLocale,
          (value: ValueType | Nullable) => {
            if (!titleField.getValue(this.props.field.locale)) {
              this.setState({ titleValue: value });
            }
          }
        );
      }
    }
  }

  componentWillUnmount() {
    if (typeof this.unsubscribeValue === 'function') {
      this.unsubscribeValue();
    }
    if (typeof this.unsubscribeLocalizedValue === 'function') {
      this.unsubscribeLocalizedValue();
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
