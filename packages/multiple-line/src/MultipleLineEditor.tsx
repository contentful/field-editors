import * as React from 'react';
import {
  FieldAPI,
  LocalesAPI,
  FieldConnector,
  CharCounter,
  CharValidation,
  ConstraintsUtils,
} from '@contentful/field-editor-shared';
import * as styles from './styles';

import { Textarea } from '@contentful/f36-components';

export interface MultipleLineEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * is the field disabled
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

export function MultipleLineEditor(props: MultipleLineEditorProps) {
  const { field, locales, isInitiallyDisabled, withCharValidation } = props;

  const constraints = ConstraintsUtils.fromFieldValidations(
    field.validations,
    field.type as 'Text'
  );
  const checkConstraint = ConstraintsUtils.makeChecker(constraints);
  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<string>
      isDisabled={props.isDisabled}
      field={field}
      isInitiallyDisabled={isInitiallyDisabled}>
      {({ errors, disabled, value, setValue }) => {
        return (
          <div data-test-id="multiple-line-editor">
            <Textarea
              className={direction === 'rtl' ? styles.rightToLeft : ''}
              rows={3}
              isRequired={field.required}
              isInvalid={errors.length > 0}
              isDisabled={disabled}
              value={value || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setValue(e.target.value);
              }}
            />
            {withCharValidation && (
              <div className={styles.validationRow}>
                <CharCounter value={value || ''} checkConstraint={checkConstraint} />
                <CharValidation constraints={constraints} />
              </div>
            )}
            {!withCharValidation && (
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

MultipleLineEditor.defaultProps = {
  isInitiallyDisabled: true,
  withCharValidation: true,
};
