import * as React from 'react';

import { Textarea } from '@contentful/f36-components';
import {
  type FieldAPI,
  type LocalesAPI,
  FieldConnector,
  CharCounter,
  CharValidation,
  ConstraintsUtils,
} from '@contentful/field-editor-shared';

import * as styles from './styles';

export interface MultipleLineEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

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

  /**
   * alias for disabled native property
   */
  isDisabled?: boolean;

  /**
   * id used for associating the input field with its label
   */
  id?: string;
}

export function MultipleLineEditor(props: MultipleLineEditorProps) {
  const { field, locales, isInitiallyDisabled, withCharValidation, isDisabled, id } = props;

  const constraints = ConstraintsUtils.fromFieldValidations(
    field.validations,
    field.type as 'Text'
  );
  const checkConstraint = ConstraintsUtils.makeChecker(constraints);
  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<string>
      field={field}
      isInitiallyDisabled={isInitiallyDisabled}
      isDisabled={isDisabled}
    >
      {({ errors, disabled, value, setValue }) => {
        return (
          <div data-test-id="multiple-line-editor">
            <Textarea
              id={id}
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
