import * as React from 'react';

import { TextInput } from '@contentful/f36-components';
import {
  FieldAPI,
  FieldConnector,
  ConstraintsUtils,
  CharCounter,
  CharValidation,
  LocalesAPI,
} from '@contentful/field-editor-shared';

import * as styles from './styles';


export interface SingleLineEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * is the field manually disabled
   */
  isDisabled?: boolean;

  /**
   * whether char validation should be shown or not
   */
  withCharValidation: boolean;
  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.locales
   */
  locales: LocalesAPI;
}

function isSupportedFieldTypes(val: string): val is 'Symbol' | 'Text' {
  return val === 'Symbol' || val === 'Text';
}

export function SingleLineEditor(props: SingleLineEditorProps) {
  const { field, locales } = props;

  if (!isSupportedFieldTypes(field.type)) {
    throw new Error(`"${field.type}" field type is not supported by SingleLineEditor`);
  }

  const constraints = ConstraintsUtils.fromFieldValidations(field.validations, field.type);
  const checkConstraint = ConstraintsUtils.makeChecker(constraints);
  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<string>
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
      isDisabled={props.isDisabled}>
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="single-line-editor">
            <TextInput
              className={direction === 'rtl' ? styles.rightToLeft : ''}
              isRequired={field.required}
              isInvalid={errors.length > 0}
              isDisabled={disabled}
              value={value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(e.target.value);
              }}
            />
            {props.withCharValidation && (
              <div className={styles.validationRow}>
                <CharCounter value={value || ''} checkConstraint={checkConstraint} />
                <CharValidation constraints={constraints} />
              </div>
            )}
            {props.withCharValidation === false && (
              <div className={styles.validationRow}>
                <CharCounter value={value || ''} checkConstraint={() => true} />
              </div>
            )}
          </div>
        );
      }}
    </FieldConnector>
  );
}

SingleLineEditor.defaultProps = {
  isInitiallyDisabled: true,
  withCharValidation: true,
};
