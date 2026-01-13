import * as React from 'react';

import { Text } from '@contentful/f36-components';
import { PencilSimpleIcon, InfoIcon } from '@contentful/f36-icons';
import { BooleanEditor } from '@contentful/field-editor-boolean';
import { FieldAppSDK } from '@contentful/field-editor-shared';
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
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
  render: () => {
    // Create separate field APIs for different field types
    const [textField, mitt] = createFakeFieldAPI(
      (mock) => ({
        ...mock,
        id: 'text-field-id',
        name: 'field',
        type: 'Symbol', // Text field type
      }),
      '',
    );

    const [ratingField] = createFakeFieldAPI(
      (mock) => ({
        ...mock,
        id: 'rating-field-id',
        name: 'anotherField',
        type: 'Integer', // Rating is a number
      }),
      undefined,
    );

    const [dateField] = createFakeFieldAPI(
      (mock) => ({
        ...mock,
        id: 'date-field-id',
        name: 'customField',
        type: 'Date', // Date picker field type
      }),
      undefined,
    );

    const [booleanField] = createFakeFieldAPI(
      (mock) => ({
        ...mock,
        id: 'boolean-field-id',
        name: 'customEditor',
        type: 'Boolean',
      }),
      false,
    );

    const space = createFakeSpaceAPI();
    const locales = createFakeLocalesAPI();

    // Create SDK for text field
    const textSdk: FieldAppSDK = {
      field: textField,
      space,
      locales,
      contentType: { displayField: 'name' },
      parameters: {
        instance: {
          helpText: 'This is a text field',
        },
      },
    } as unknown as FieldAppSDK;

    // Create SDK for rating field
    const ratingSdk: FieldAppSDK = {
      field: ratingField,
      space,
      locales,
      contentType: { displayField: 'name' },
      parameters: {
        instance: {
          helpText: 'This is a rating field',
        },
      },
    } as unknown as FieldAppSDK;

    // Create SDK for date field
    const dateSdk: FieldAppSDK = {
      field: dateField,
      space,
      locales,
      contentType: { displayField: 'name' },
      parameters: {
        instance: {
          helpText: 'This is a date field',
        },
      },
    } as unknown as FieldAppSDK;

    // Create SDK for boolean field
    const booleanSdk: FieldAppSDK = {
      field: booleanField,
      space,
      locales,
      contentType: { displayField: 'name' },
      parameters: {
        instance: {
          helpText: 'This is a boolean field',
        },
      },
    } as unknown as FieldAppSDK;

    return (
      <div data-test-id="default-field-editors-test">
        <FieldWrapper sdk={textSdk} name="field">
          <Field sdk={textSdk} widgetId="singleLine" />
        </FieldWrapper>
        <FieldWrapper sdk={ratingSdk} name="anotherField">
          <Field sdk={ratingSdk} widgetId="rating" />
        </FieldWrapper>
        <FieldWrapper
          sdk={dateSdk}
          name="customField"
          renderHeading={(name) => (
            <div>
              <PencilSimpleIcon size="tiny" /> Custom {name} heading
            </div>
          )}
          renderHelpText={(helpText) => (
            <Text as="p" fontColor="gray500" marginTop="spacingXs">
              <InfoIcon size="tiny" /> Custom help text: {helpText}
            </Text>
          )}
        >
          <Field sdk={dateSdk} widgetId="datePicker" />
        </FieldWrapper>
        <FieldWrapper sdk={booleanSdk} name="customEditor">
          <Field
            sdk={booleanSdk}
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
