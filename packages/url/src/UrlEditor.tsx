import * as React from 'react';
import { TextInput } from '@contentful/forma-36-react-components';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface UrlEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;

  children?: (props: { value: string | null | undefined }) => React.ReactNode;
}

export function UrlEditor(props: UrlEditorProps) {
  const { field } = props;

  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="url-editor">
            <TextInput
              required={field.required}
              error={errors.length > 0}
              disabled={disabled}
              value={value || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(e.target.value);
              }}
            />
            {typeof props.children === 'function' ? props.children({ value }) : null}
          </div>
        );
      }}
    </FieldConnector>
  );
}

UrlEditor.defaultProps = {
  isInitiallyDisabled: true,
};
