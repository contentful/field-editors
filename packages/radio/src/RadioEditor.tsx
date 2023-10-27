import * as React from 'react';

import { Flex } from '@contentful/f36-core';
import { Radio, Form } from '@contentful/f36-forms';
import { TextLink } from '@contentful/f36-text-link';
import { getOptions, parseValue } from '@contentful/field-editor-dropdown';
import {
  FieldAPI,
  FieldConnector,
  PredefinedValuesError,
  LocalesAPI,
} from '@contentful/field-editor-shared';
import { cx } from 'emotion';

import * as styles from './styles.js';

export interface RadioEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  /**
   * sdk.field
   */
  field: FieldAPI;

  /**
   * sdk.locales
   */
  locales: LocalesAPI;
}

export function RadioEditor(props: RadioEditorProps) {
  const { field, locales } = props;

  const options = getOptions(field);
  const misconfigured = options.length === 0;

  if (misconfigured) {
    return <PredefinedValuesError />;
  }

  const direction = locales.direction[field.locale] || 'ltr';

  return (
    <FieldConnector<string | number>
      debounce={0}
      field={field}
      isInitiallyDisabled={props.isInitiallyDisabled}
    >
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
            className={cx(styles.form, direction === 'rtl' ? styles.rightToLeft : '')}
          >
            {options.map((item, index) => {
              const id = ['entity', field.id, field.locale, index, item.id].join('.');
              const checked = value === item.value;
              return (
                <Flex key={id} alignItems="center" marginBottom="spacingS">
                  <Radio
                    id={id}
                    isDisabled={disabled}
                    value={item.value === undefined ? '' : String(item.value)}
                    isChecked={checked}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        setOption(e.target.value);
                      }
                    }}
                  >
                    {item.label}
                  </Radio>
                  {checked && !disabled && (
                    <TextLink as="button" className={styles.clearBtn} onClick={clearOption}>
                      Clear
                    </TextLink>
                  )}
                </Flex>
              );
            })}
          </Form>
        );
      }}
    </FieldConnector>
  );
}

RadioEditor.defaultProps = {
  isInitiallyDisabled: true,
};
