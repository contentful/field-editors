import * as React from 'react';
import { TextInput } from '@contentful/forma-36-react-components';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { parseNumber } from './parseNumber';

export interface NumberEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

type RangeValidation = { min?: number; max?: number };

function getRangeFromField(field: FieldAPI): RangeValidation {
  const validations = field.validations || [];
  const result = validations.find(validation => (validation as any).range) as
    | { range: RangeValidation }
    | undefined;
  return result ? result.range : {};
}

export function NumberEditor(props: NumberEditorProps) {
  const { field } = props;

  const range = getRangeFromField(field);

  return (
    <FieldConnector<number> field={field} isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="number-editor">
            <TextInput
              testId="number-editor-input"
              min={range.min !== undefined ? String(range.min) : ''}
              max={range.max !== undefined ? String(range.max) : ''}
              step={field.type === 'Integer' ? '1' : ''}
              type="number"
              required={field.required}
              error={errors.length > 0}
              disabled={disabled}
              value={value === undefined ? '' : String(value)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const parseResult = parseNumber(e.target.value, field.type);
                field.setInvalid(!parseResult.isValid);
                if (parseResult.isValid) {
                  setValue(parseResult.value);
                }
              }}
            />
          </div>
        );
      }}
    </FieldConnector>
  );
}

NumberEditor.defaultProps = {
  isInitiallyDisabled: true
};
