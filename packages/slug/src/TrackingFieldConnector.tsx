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
      isSame: titleField ? props.field.id === titleField.id : false,
    };
  });

  React.useEffect(() => {
    const unsubscribeSysChanges = props.sdk.entry.onSysChanged((sys) => {
      setState((currentState) => ({
        ...currentState,
        isPublished: Boolean(sys.publishedVersion),
      }));
    });

    const titleField = getTitleField(props.sdk, props.trackingFieldId);

    // the content type's display field might not exist
    if (!titleField) {
      return typeof unsubscribeSysChanges === 'function' ? unsubscribeSysChanges : undefined;
    }

    const unsubscribeLocalizedValue = state.isSame
      ? undefined
      : titleField.onValueChanged(props.field.locale, (value: ValueType | Nullable) => {
          setState((currentState) => ({ ...currentState, titleValue: value }));
        });

    let unsubscribeValue: Function | undefined;
    if (props.field.locale !== props.defaultLocale) {
      if (!props.isOptionalLocaleWithFallback) {
        unsubscribeValue = titleField.onValueChanged(
          props.defaultLocale,
          (value: ValueType | Nullable) => {
            if (!titleField.getValue(props.field.locale)) {
              setState((currentState) => ({ ...currentState, titleValue: value }));
            }
          },
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
  }, [
    props.defaultLocale,
    props.field,
    props.isOptionalLocaleWithFallback,
    props.sdk,
    props.trackingFieldId,
    state.isSame,
  ]);

  return <>{props.children?.(state) ?? null}</>;
}
