import * as React from 'react';
import { Textarea } from '@contentful/forma-36-react-components';
import { FieldAPI, LocalesAPI, FieldConnector } from '@contentful/field-editor-shared';
import * as styles from './styles';

export interface MultipleLineEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;

  locales: LocalesAPI;
}

export function MultipleLineEditor(props: MultipleLineEditorProps) {
  const { field, locales } = props;

  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ errors, disabled, value, setValue }) => {
        return (
          <div data-test-id="multiple-line-editor">
            <Textarea
              className={direction === 'rtl' ? styles.rightToLeft : ''}
              rows={3}
              required={field.required}
              error={errors.length > 0}
              disabled={disabled}
              value={value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(e.target.value);
              }}
            />
          </div>
        );
      }}
    </FieldConnector>
  );
}

MultipleLineEditor.defaultProps = {
  isInitiallyDisabled: true
};
