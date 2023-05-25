import React from 'react';

import { Text } from '@contentful/f36-components';
import { EditIcon, HelpCircleIcon } from '@contentful/f36-icons';
import { BooleanEditor } from '@contentful/field-editor-boolean';
import {
  ActionsPlayground,
  createFakeFieldAPI,
  createFakeLocalesAPI,
  createFakeSpaceAPI,
} from '@contentful/field-editor-test-utils';
import type { Meta, StoryObj } from '@storybook/react';

import { Field } from '../src/Field';
import { FieldWrapper } from '../src/FieldWrapper';

const meta: Meta<typeof Field> = {
  title: 'shared/Default Field Editors',
  component: Field,
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => {
    const [field, mitt] = createFakeFieldAPI(
      // @ts-expect-error
      (mock) => ({
        ...mock,
        items: {
          validations: [{ in: ['test1', 'test2'] }],
        },
      }),
      []
    );
    const space = createFakeSpaceAPI();
    const locales = createFakeLocalesAPI();
    const sdk = {
      field,
      space,
      locales,
      contentType: { displayField: 'name' },
      parameters: {
        instance: {
          helpText: 'Field help text',
        },
      },
    };

    return (
      <div data-test-id="default-field-editors-test">
        <FieldWrapper sdk={sdk as any} name="field">
          <Field sdk={sdk as any} widgetId="singleLine" />
        </FieldWrapper>

        <FieldWrapper sdk={sdk as any} name="anotherField">
          <Field sdk={sdk as any} widgetId="rating" />
        </FieldWrapper>

        <FieldWrapper
          sdk={sdk as any}
          name="customField"
          renderHeading={(name) => (
            <div>
              <EditIcon size="tiny" /> Custom {name} heading
            </div>
          )}
          renderHelpText={(helpText) => (
            <Text as="p" fontColor="gray500" marginTop="spacingXs">
              <HelpCircleIcon size="tiny" /> Custom help text: {helpText}
            </Text>
          )}
        >
          <Field sdk={sdk as any} widgetId="datePicker" />
        </FieldWrapper>

        <FieldWrapper sdk={sdk as any} name="customEditor">
          <Field
            sdk={sdk as any}
            renderFieldEditor={(widgetId, sdk, isInitiallyDisabled) => {
              return (
                <div>
                  Custom editor with custom options.
                  <BooleanEditor
                    isInitiallyDisabled={isInitiallyDisabled}
                    field={sdk.field}
                    // @ts-expect-error
                    parameters={{ instance: { trueLabel: 'Yay', falseLabel: 'Nope' } }}
                  />
                </div>
              );
            }}
          />
        </FieldWrapper>

        <ActionsPlayground mitt={mitt} />
      </div>
    );
  },
};
