import * as React from 'react';
import { TextInput } from '@contentful/forma-36-react-components';
import {
  FieldAPI,
  EntryFieldAPI,
  FieldConnector,
  ConstraintsUtils,
  CharCounter,
  CharValidation,
  LocalesAPI
} from '@contentful/field-editor-shared';
import * as styles from './styles';

export interface SingleLineEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI | EntryFieldAPI;

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

  // eslint-disable-next-line
  const constraints = ConstraintsUtils.fromFieldValidations(field.validations, field.type);
  const checkConstraint = ConstraintsUtils.makeChecker(constraints);

  let direction: string;
  if ('locale' in field) {
    direction = locales.direction[field.locale] || 'ltr';
  } else {
    direction = 'ltr';
  }

  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="single-line-editor">
            <TextInput
              className={direction === 'rtl' ? styles.rightToLeft : ''}
              required={field.required}
              error={errors.length > 0}
              disabled={disabled}
              value={value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(e.target.value);
              }}
            />
            <div className={styles.validationRow}>
              <CharCounter value={value || ''} checkConstraint={checkConstraint} />
              <CharValidation constraints={constraints} />
            </div>
          </div>
        );
      }}
    </FieldConnector>
  );
}

SingleLineEditor.defaultProps = {
  isInitiallyDisabled: true
};
