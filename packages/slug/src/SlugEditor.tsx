import * as React from 'react';
import { BaseExtensionSDK, FieldAPI } from 'contentful-ui-extensions-sdk';
import { FieldConnector, ConstraintsUtils, CharValidation } from '@contentful/field-editor-shared';
import { TitleFieldConnector } from './TitleFieldConnector';
import { SlugEditorField } from './SlugEditorField';
import * as styles from './styles';

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
  const { locales } = props.baseSdk;

  if (!isSupportedFieldTypes(field.type)) {
    throw new Error(`"${field.type}" field type is not supported by SlugEditor`);
  }

  const constraints = ConstraintsUtils.fromFieldValidations(field.validations, 'Symbol');

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

  return (
    <TitleFieldConnector<string>
      sdk={props.baseSdk}
      locale={field.locale}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ titleValue, isPublished }) => (
        <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
          {({ value, errors, disabled, setValue, externalReset }) => {
            return (
              <div data-test-id="slug-editor">
                <SlugEditorField
                  hasError={errors.length > 0}
                  value={value}
                  isOptionalLocaleWithFallback={isOptionalLocaleWithFallback}
                  isDisabled={disabled}
                  isPublished={isPublished}
                  titleValue={titleValue}
                  setValue={setValue}
                  key={`slug-editor-${externalReset}`}
                />
                <div className={styles.validationRow}>
                  <CharValidation constraints={constraints} />
                </div>
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
