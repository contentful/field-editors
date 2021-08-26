import * as React from 'react';
import get from 'lodash/get';
import { nanoid } from 'nanoid';
import { FieldAPI, ParametersAPI, FieldConnector } from '@contentful/field-editor-shared';
import { RadioButtonField } from '@contentful/forma-36-react-components';

import { TextLink, Flex } from "@contentful/f36-components";

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
    { value: false, label: get(props.parameters, ['instance', 'falseLabel'], 'No'), id: nanoid(6) },
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
          <Flex testId="boolean-editor" alignItems="center" marginTop="spacingS">
            {options.map((item) => {
              const id = ['entity', field.id, field.locale, item.value, item.id].join('.');
              const checked = value === item.value;
              return (
                <Flex marginRight="spacingM" key={id}>
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
                </Flex>
              );
            })}
            {value !== undefined && (
              <TextLink
                as="button"
                testId="boolean-editor-clear"
                isDisabled={disabled}
                onClick={clearOption}>
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
