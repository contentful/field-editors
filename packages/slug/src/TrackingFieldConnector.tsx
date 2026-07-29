import * as React from 'react';

import { FieldAPI, FieldAppSDK } from '@contentful/app-sdk';

type Nullable = null | undefined;

interface TrackingFieldConnectorState<ValueType> {
  titleValue: ValueType | Nullable;
  isPublished: boolean;
  isSame: boolean;
}

interface TrackingFieldConnectorProps<ValueType> {
  sdk: FieldAppSDK;
  field: FieldAPI;
  defaultLocale: string;
  trackingFieldId?: string;
  isOptionalLocaleWithFallback: boolean;
  children?: (state: TrackingFieldConnectorState<ValueType>) => React.ReactNode;
}

function getTitleField(sdk: FieldAppSDK, trackingFieldId?: string) {
  const { entry, contentType } = sdk;
  if (trackingFieldId && entry.fields[trackingFieldId]) {
    return entry.fields[trackingFieldId];
  }
  return entry.fields[contentType.displayField];
}

export function TrackingFieldConnector<ValueType>(props: TrackingFieldConnectorProps<ValueType>) {
  const [state, setState] = React.useState<TrackingFieldConnectorState<ValueType>>(() => {
    const titleField = getTitleField(props.sdk, props.trackingFieldId);
    const entrySys = props.sdk.entry.getSys();
    return {
      titleValue: titleField ? titleField.getValue() : '',
      isPublished: Boolean(entrySys.publishedVersion),
      isSame: titleField ? props.field.id === titleField.id : false
    };
  });
  const propsRef = React.useRef(props);
  propsRef.current = props;
  const initialIsSameRef = React.useRef(state.isSame);

  React.useLayoutEffect(() => {
    const initialProps = propsRef.current;
    const unsubscribeSysChanges = initialProps.sdk.entry.onSysChanged((sys) => {
      setState((currentState) => ({
        ...currentState,
        isPublished: Boolean(sys.publishedVersion)
      }));
    });

    const titleField = getTitleField(initialProps.sdk, initialProps.trackingFieldId);

    // the content type's display field might not exist
    if (!titleField) {
      return typeof unsubscribeSysChanges === 'function' ? unsubscribeSysChanges : undefined;
    }

    const unsubscribeLocalizedValue = initialIsSameRef.current
      ? undefined
      : titleField.onValueChanged(initialProps.field.locale, (value: ValueType | Nullable) => {
          setState((currentState) => ({ ...currentState, titleValue: value }));
        });

    let unsubscribeValue: Function | undefined;
    if (initialProps.field.locale !== initialProps.defaultLocale) {
      if (!initialProps.isOptionalLocaleWithFallback) {
        unsubscribeValue = titleField.onValueChanged(
          initialProps.defaultLocale,
          (value: ValueType | Nullable) => {
            if (!titleField.getValue(propsRef.current.field.locale)) {
              setState((currentState) => ({ ...currentState, titleValue: value }));
            }
          }
        );
      }
    }

    return () => {
      if (typeof unsubscribeValue === 'function') {
        unsubscribeValue();
      }
      if (typeof unsubscribeLocalizedValue === 'function') {
        unsubscribeLocalizedValue();
      }
      if (typeof unsubscribeSysChanges === 'function') {
        unsubscribeSysChanges();
      }
    };
  }, []);

  return props.children ? props.children(state) : null;
}
