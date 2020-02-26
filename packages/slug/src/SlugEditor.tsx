import * as React from 'react';
import { BaseExtensionSDK, FieldAPI } from 'contentful-ui-extensions-sdk';
import { FieldConnector } from '@contentful/field-editor-shared';
import { TitleFieldConnector } from './TitleFieldConnector';
import { SlugEditorField, SlugEditorFieldStatic } from './SlugEditorField';

export interface SlugEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  baseSdk: BaseExtensionSDK;

  field: FieldAPI;
}

function isSupportedFieldTypes(val: string): val is 'Symbol' {
  return val === 'Symbol';
}

export function SlugEditor(props: SlugEditorProps) {
  const { field } = props;
  const { locales, entry, space } = props.baseSdk;

  if (!isSupportedFieldTypes(field.type)) {
    throw new Error(`"${field.type}" field type is not supported by SlugEditor`);
  }

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

  const performUniqueCheck = React.useCallback((value: string) => {
    const searchQuery = {
      content_type: entrySys.contentType.sys.id,
      [`fields.${field.id}.${field.locale}`]: value,
      'sys.id[ne]': entrySys.id,
      'sys.publishedAt[exists]': true,
      limit: 0
    };
    return space.getEntries(searchQuery).then(res => {
      return res.total === 0;
    });
  }, []);

  return (
    <TitleFieldConnector<string>
      sdk={props.baseSdk}
      field={field}
      defaultLocale={locales.default}
      isOptionalLocaleWithFallback={isOptionalLocaleWithFallback}>
      {({ titleValue, isPublished, isSame }) => (
        <FieldConnector<string>
          field={field}
          isInitiallyDisabled={props.isInitiallyDisabled}
          throttle={300}>
          {({ value, errors, disabled, setValue, externalReset }) => {
            const shouldTrackTitle = isPublished === false && isSame === false;

            const Component = shouldTrackTitle ? SlugEditorField : SlugEditorFieldStatic;

            return (
              <div data-test-id="slug-editor">
                <Component
                  key={`slug-editor-${externalReset}`}
                  locale={field.locale}
                  createdAt={entrySys.createdAt}
                  performUniqueCheck={performUniqueCheck}
                  hasError={errors.length > 0}
                  value={value}
                  isOptionalLocaleWithFallback={isOptionalLocaleWithFallback}
                  isDisabled={disabled}
                  titleValue={titleValue}
                  setValue={setValue}
                />
              </div>
            );
          }}
        </FieldConnector>
      )}
    </TitleFieldConnector>
  );
}

SlugEditor.defaultProps = {
  isInitiallyDisabled: true
};
