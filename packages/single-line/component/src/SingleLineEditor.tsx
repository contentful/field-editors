import * as React from 'react';
import { TextInput } from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { fromFieldValidations, makeChecker } from './utils/constraints';
import { FieldAPI, FieldConnector } from '@contentful/field-editor-shared';
import { CharCounter } from './CharCounter';
import { css } from 'emotion';
import { CharValidation } from './CharValidation';

export interface SingleLineEditorProps {
  /**
   * Is a field is disabled initially
   */
  initialDisabled: boolean;

  field: FieldAPI;
}

type PossibleValue = string | undefined;

export function SingleLineEditor(props: SingleLineEditorProps) {
  const { field } = props;

  // eslint-disable-next-line
  const constraints = fromFieldValidations(field.validations);
  const checkConstraint = makeChecker(constraints);

  return (
    <FieldConnector<PossibleValue> field={field} initialDisabled={props.initialDisabled}>
      {({ value, errors, disabled, setValue }) => {
        return (
          <div data-test-id="single-line-editor">
            <TextInput
              className="x--directed"
              aria-label={field.id}
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
                justifyContent: 'space-between',
                fontSize: tokens.fontSizeM,
                marginTop: tokens.spacingXs,
                color: tokens.colorTextMid
              })}>
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
  initialDisabled: true
};
