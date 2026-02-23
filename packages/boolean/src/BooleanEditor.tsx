import * as React from 'react';

import { TextLink, Flex, Radio } from '@contentful/f36-components';
import { FieldAPI, ParametersAPI, FieldConnector } from '@contentful/field-editor-shared';
import { t } from '@lingui/core/macro';
import get from 'lodash/get';
import { nanoid } from 'nanoid';

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
  parameters?: ParametersAPI<
    Record<string, any>,
    {
      trueLabel?: string;
      falseLabel?: string;
    },
    Record<string, any>
  >;
}

export function BooleanEditor(props: BooleanEditorProps) {
  const { field } = props;

  const options = [
    {
      value: true,
      label: get(
        props.parameters,
        ['instance', 'trueLabel'],
        t({ id: 'FieldEditors.Boolean.BooleanEditor.TrueDefaultLabel', message: 'Yes' }),
      ),
      id: nanoid(6),
    },
    {
      value: false,
      label: get(
        props.parameters,
        ['instance', 'falseLabel'],
        t({ id: 'FieldEditors.Boolean.BooleanEditor.FalseDefaultLabel', message: 'No' }),
      ),
      id: nanoid(6),
    },
  ];

  return (
    <FieldConnector<boolean>
      debounce={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
    >
      {({ disabled, value, setValue }) => {
        const setOption = (value: string) => {
          setValue(value === 'true' ? true : false);
        };

        const clearOption = () => {
          setValue(null);
        };

        return (
          <Flex testId="boolean-editor" alignItems="center" marginTop="spacingS">
            {options.map((option) => {
              const id = ['entity', field.id, field.locale, option.value, option.id].join('.');
              const checked = value === option.value;
              return (
                <Flex marginRight="spacingM" key={id}>
                  <Radio
                    id={id}
                    isDisabled={disabled}
                    value={option.value === undefined ? '' : String(option.value)}
                    isChecked={checked}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        setOption(e.target.value);
                      }
                    }}
                  >
                    {option.label}
                  </Radio>
                </Flex>
              );
            })}
            {value !== undefined && (
              <TextLink
                as="button"
                testId="boolean-editor-clear"
                isDisabled={disabled}
                onClick={clearOption}
              >
                Clear
              </TextLink>
            )}
          </Flex>
        );
      }}
    </FieldConnector>
  );
}

BooleanEditor.defaultProps = {
  isInitiallyDisabled: true,
};
