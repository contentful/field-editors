import * as React from 'react';
import { TextInput } from '@contentful/forma-36-react-components';
import { FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import tokens from '@contentful/forma-36-tokens';
import { css } from 'emotion';
import { FieldConnector, ConstraintsUtils, CharValidation } from '@contentful/field-editor-shared';

export interface SlugEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  sdk: FieldExtensionSDK;
}

function isSupportedFieldTypes(val: string): val is 'Symbol' {
  return val === 'Symbol';
}

export function SlugEditor(props: SlugEditorProps) {
  const { field } = props.sdk;

  if (!isSupportedFieldTypes(field.type)) {
    throw new Error(`"${field.type}" field type is not supported by SlugEditor`);
  }

  const constraints = ConstraintsUtils.fromFieldValidations(field.validations, 'Symbol');

  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="slug-editor">
            <TextInput
              className="x--directed"
              required={field.required}
              error={errors.length > 0}
              disabled={disabled}
              value={value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(e.target.value);
              }}
            />
            <div
              className={css({
                display: 'flex',
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                fontSize: tokens.fontSizeM,
                marginTop: tokens.spacingXs,
                color: tokens.colorTextMid
              })}>
              <CharValidation constraints={constraints} />
            </div>
          </div>
        );
      }}
    </FieldConnector>
  );
}

SlugEditor.defaultProps = {
  isInitiallyDisabled: true
};
