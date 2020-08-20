import React from 'react';
import { render, configure, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import { Field } from './Field';

configure({
  testIdAttribute: 'data-test-id',
});

const [field] = createFakeFieldAPI();
const sdk: FieldExtensionSDK = {
  field,
  locales: createFakeLocalesAPI(),
} as any;

describe('Field', () => {
  afterEach(cleanup);

  it('renders custom field editor specified by renderFieldEditor', () => {
    const { queryByTestId } = render(
      <Field
        sdk={sdk}
        isInitiallyDisabled={false}
        widgetId="customEditor"
        renderFieldEditor={() => {
          return <div data-test-id="customEditor">custom editor</div>;
        }}
      />
    );

    expect(queryByTestId('customEditor')).toBeInTheDocument();
  });
});
