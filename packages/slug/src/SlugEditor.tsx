import * as React from 'react';

import { FieldExtensionSDK, FieldAPI, ValidationError } from '@contentful/app-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';

import { SlugEditorField, SlugEditorFieldStatic } from './SlugEditorField';
import { TrackingFieldConnector } from './TrackingFieldConnector';

export interface SlugEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  baseSdk: FieldExtensionSDK;

  /**
   * sdk.field
   */
  field: FieldAPI;

  parameters?: {
    instance: {
      trackingFieldId?: string;
    };
  };
}

function isSupportedFieldTypes(val: string): val is 'Symbol' {
  return val === 'Symbol';
}

function FieldConnectorCallback({
  Component,
  value,
  disabled,
  setValue,
  errors,
  titleValue,
  isOptionalLocaleWithFallback,
  locale,
  createdAt,
  performUniqueCheck,
}: {
  Component: typeof SlugEditorFieldStatic | typeof SlugEditorField;
  value: string | null | undefined;
  disabled: boolean;
  titleValue: string | null | undefined;
  setValue: (value: string | null | undefined) => Promise<unknown>;
  errors: ValidationError[];
  isOptionalLocaleWithFallback: boolean;
  locale: FieldAPI['locale'];
  createdAt: string;
  performUniqueCheck: (value: string) => Promise<boolean>;
}) {
  // it is needed to silent permission errors
  // this happens when setValue is called on a field which is disabled for permission reasons
  const safeSetValue = React.useCallback(
    async (...args: Parameters<typeof setValue>) => {
      try {
        await setValue(...args);
      } catch (e) {
        // do nothing
      }
    },
    [setValue]
  );

  return (
    <div data-test-id="slug-editor">
      <Component
        locale={locale}
        createdAt={createdAt}
        performUniqueCheck={performUniqueCheck}
        hasError={errors.length > 0}
        value={value}
        isOptionalLocaleWithFallback={isOptionalLocaleWithFallback}
        isDisabled={disabled}
        titleValue={titleValue}
        setValue={safeSetValue}
      />
    </div>
  );
}

export function SlugEditor(props: SlugEditorProps) {
  const { field, parameters } = props;
  const { locales, entry, space } = props.baseSdk;

  if (!isSupportedFieldTypes(field.type)) {
    throw new Error(`"${field.type}" field type is not supported by SlugEditor`);
  }

  const trackingFieldId = parameters?.instance?.trackingFieldId ?? undefined;
  const entrySys = entry.getSys();

  const isLocaleOptional = locales.optional[field.locale];
  const localeFallbackCode = locales.fallbacks[field.locale];

  // If the field or the locale are not required (there's a locale setting that
  // allows publishing even if the field is required) and if the locale has a
  // fallback than there's no need for a slug unless the user manually enters
  // one or the title field is also localized with a custom value.
  const isOptionalFieldLocale = Boolean(!field.required || isLocaleOptional);
  const isOptionalLocaleWithFallback = Boolean(
    isOptionalFieldLocale && localeFallbackCode && locales.available.includes(localeFallbackCode)
  );

  const performUniqueCheck = React.useCallback(
    (value: string) => {
      const searchQuery = {
        content_type: entrySys?.contentType?.sys?.id,
        [`fields.${field.id}.${field.locale}`]: value,
        'sys.id[ne]': entrySys.id,
        'sys.publishedAt[exists]': true,
        limit: 0,
      };
      return space.getEntries(searchQuery).then((res) => {
        return res.total === 0;
      });
    },
    [entrySys?.contentType?.sys?.id, field.id, field.locale, entrySys.id, space]
  );

  return (
    <TrackingFieldConnector<string>
      sdk={props.baseSdk}
      field={field}
      defaultLocale={locales.default}
      isOptionalLocaleWithFallback={isOptionalLocaleWithFallback}
      trackingFieldId={trackingFieldId}>
      {({ titleValue, isPublished, isSame }) => (
        <FieldConnector<string>
          field={field}
          isInitiallyDisabled={props.isInitiallyDisabled}
          throttle={0}>
          {({ value, errors, disabled, setValue, externalReset }) => {
            const shouldTrackTitle = isPublished === false && isSame === false;

            const Component = shouldTrackTitle ? SlugEditorField : SlugEditorFieldStatic;

            return (
              <FieldConnectorCallback
                Component={Component}
                titleValue={titleValue}
                value={value}
                errors={errors}
                disabled={disabled}
                setValue={setValue}
                isOptionalLocaleWithFallback={isOptionalLocaleWithFallback}
                createdAt={entrySys.createdAt}
                locale={field.locale}
                performUniqueCheck={performUniqueCheck}
                key={`slug-editor-${externalReset}`}
              />
            );
          }}
        </FieldConnector>
      )}
    </TrackingFieldConnector>
  );
}

SlugEditor.defaultProps = {
  isInitiallyDisabled: true,
};
