import * as React from 'react';

import { TextInput } from '@contentful/f36-components';
import {
  type FieldAPI,
  FieldConnector,
  ConstraintsUtils,
  CharCounter,
  CharValidation,
  type LocalesAPI,
} from '@contentful/field-editor-shared';

import * as styles from './styles';

export interface SingleLineEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled?: boolean;

  /**
   * is the field manually disabled
   */
  isDisabled?: boolean;

  /**
   * whether validations should be rendered or not.
   */
  withCharInformation?: boolean;

  /**
   * whether char validation should be shown or not
   */
  withCharValidation?: boolean;
  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.locales
   */
  locales: LocalesAPI;

  /**
   * blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * id used for associating the input field with its label
   */
  id?: string;
}

function isSupportedFieldTypes(val: string): val is 'Symbol' | 'Text' {
  return val === 'Symbol' || val === 'Text';
}

export function SingleLineEditor(props: SingleLineEditorProps) {
  const {
    field,
    isDisabled,
    isInitiallyDisabled = true,
    locales,
    onBlur,
    onFocus,
    withCharInformation = true,
    withCharValidation = true,
    id,
  } = props;

  if (!isSupportedFieldTypes(field.type)) {
    throw new Error(`"${field.type}" field type is not supported by SingleLineEditor`);
  }

  const constraints = ConstraintsUtils.fromFieldValidations(field.validations, field.type);
  const checkConstraint = ConstraintsUtils.makeChecker(constraints);
  const direction = locales.direction[field.locale] || 'ltr';
  const handleCheckConstraint = withCharValidation ? checkConstraint : () => true;

  return (
    <FieldConnector<string>
      field={field}
      isInitiallyDisabled={isInitiallyDisabled}
      isDisabled={isDisabled}
    >
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="single-line-editor">
            <TextInput
              id={id}
              className={direction === 'rtl' ? styles.rightToLeft : ''}
              isRequired={field.required}
              isInvalid={errors.length > 0}
              isDisabled={disabled}
              value={value || ''}
              onFocus={onFocus}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(e.target.value);
              }}
            />
            {withCharInformation && (
              <div className={styles.validationRow}>
                <CharCounter value={value || ''} checkConstraint={handleCheckConstraint} />
                {withCharValidation && <CharValidation constraints={constraints} />}
              </div>
            )}
          </div>
        );
      }}
    </FieldConnector>
  );
}
