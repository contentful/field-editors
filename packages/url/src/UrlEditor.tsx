import * as React from 'react';

import { TextInput } from '@contentful/f36-components';
import { type FieldAPI, FieldConnector } from '@contentful/field-editor-shared';

export interface UrlEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * id used for associating the input field with its label
   */
  id?: string;

  children?: (props: { value: string | null | undefined }) => React.ReactNode;
}

export function UrlEditor(props: UrlEditorProps) {
  const { field, id } = props;

  return (
    <FieldConnector<string> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="url-editor">
            <TextInput
              id={id}
              isRequired={field.required}
              isInvalid={errors.length > 0}
              isDisabled={disabled}
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
