import React from 'react';
import { render, configure, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import { Field } from './Field';
import { SingleEntryReferenceEditor } from '@contentful/field-editor-reference';

configure({
  testIdAttribute: 'data-test-id',
});

jest.mock('@contentful/field-editor-reference', () => ({
  SingleEntryReferenceEditor: jest.fn(() => <div>mock</div>),
}));

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

  it('renders with specified options', () => {
    const options = {
      entryLinkEditor: {
        onAction: jest.fn(),
        renderCustomCard: jest.fn(),
      },
    };
    render(
      <Field
        sdk={sdk}
        isInitiallyDisabled={false}
        widgetId="entryLinkEditor"
        getOptions={() => options}
      />
    );
    expect(((SingleEntryReferenceEditor as unknown) as jest.Mock).mock.calls[0][0]).toMatchObject({
      onAction: options.entryLinkEditor.onAction,
      renderCustomCard: options.entryLinkEditor.renderCustomCard,
    } as Partial<Parameters<typeof SingleEntryReferenceEditor>[0]>);
  });
});
