import * as React from 'react';
import { css, cx } from 'emotion';
import tokens from '@contentful/forma-36-tokens';
import { FieldAPI, FieldConnector, PredefinedValuesError } from '@contentful/field-editor-shared';
import { getOptions, parseValue } from '@contentful/field-editor-dropdown';
import { Form, RadioButtonField, TextLink } from '@contentful/forma-36-react-components';

export interface RadioEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  field: FieldAPI;
}

export function RadioEditor(props: RadioEditorProps) {
  const { field } = props;

  const options = getOptions(field);
  const misconfigured = options.length === 0;
  const isDirected = ['Text', 'Symbol'].includes(field.type);

  if (misconfigured) {
    return <PredefinedValuesError />;
  }

  return (
    <FieldConnector<string | number>
      throttle={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}>
      {({ disabled, value, setValue }) => {
        const setOption = (value: string) => {
          setValue(parseValue(value, field.type));
        };
        const clearOption = () => {
          setValue(undefined);
        };

        return (
          <Form
            testId="radio-editor"
            spacing="condensed"
            className={cx(css({ marginTop: tokens.spacingS }), isDirected ? 'x--directed' : '')}>
            {options.map((item, index) => {
              const id = ['entity', field.id, field.locale, index].join('.');
              const checked = value === item.value;
              return (
                <React.Fragment key={id}>
                  <RadioButtonField
                    labelIsLight
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
                  {checked && (
                    <TextLink
                      className={css({ marginLeft: tokens.spacingL })}
                      onClick={clearOption}>
                      Clear
                    </TextLink>
                  )}
                </React.Fragment>
              );
            })}
          </Form>
        );
      }}
    </FieldConnector>
  );
}

RadioEditor.defaultProps = {
  isInitiallyDisabled: true
};
