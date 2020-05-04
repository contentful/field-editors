import * as React from 'react';
import get from 'lodash/get';
import { nanoid } from 'nanoid';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FieldAPI, ParametersAPI, FieldConnector } from '@contentful/field-editor-shared';
import { RadioButtonField, TextLink } from '@contentful/forma-36-react-components';

export interface BooleanEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.parameters
   */
  parameters?: ParametersAPI & {
    instance: {
      trueLabel?: string;
      falseLabel?: string;
    };
  };
}

export function BooleanEditor(props: BooleanEditorProps) {
  const { field } = props;

  const options = [
    { value: true, label: get(props.parameters, ['instance', 'trueLabel'], 'Yes'), id: nanoid(6) },
    { value: false, label: get(props.parameters, ['instance', 'falseLabel'], 'No'), id: nanoid(6) }
  ];

  return (
    <FieldConnector<boolean>
      throttle={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ disabled, value, setValue }) => {
        const setOption = (value: string) => {
          setValue(value === 'true' ? true : false);
        };

        const clearOption = () => {
          setValue(null);
        };

        return (
          <div data-test-id="boolean-editor" className={cx(css({ marginTop: tokens.spacingS }))}>
            {options.map(item => {
              const id = ['entity', field.id, field.locale, item.value, item.id].join('.');
              const checked = value === item.value;
              return (
                <React.Fragment key={id}>
                  <RadioButtonField
                    labelIsLight
                    className={css({ marginRight: tokens.spacingM })}
                    id={id}
                    checked={checked}
                    labelText={item.label}
                    disabled={disabled}
                    value={item.value === undefined ? '' : String(item.value)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        setOption(e.target.value);
                      }
                    }}
                  />
                </React.Fragment>
              );
            })}
            {value !== undefined && <TextLink onClick={clearOption}>Clear</TextLink>}
          </div>
        );
      }}
    </FieldConnector>
  );
}

BooleanEditor.defaultProps = {
  isInitiallyDisabled: true
};
