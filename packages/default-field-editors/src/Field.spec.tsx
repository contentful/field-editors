import React from 'react';

import { SingleEntryReferenceEditor } from '@contentful/field-editor-reference';
import type { FieldExtensionSDK } from '@contentful/field-editor-shared';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import '@testing-library/jest-dom/extend-expect';
import { cleanup, configure, render } from '@testing-library/react';

import { Field } from './Field';

configure({
  testIdAttribute: 'data-test-id',
});

jest.mock('@contentful/field-editor-reference', () => ({
  SingleEntryReferenceEditor: jest.fn(() => <div>mock</div>),
}));

const getSdk = (customize?: (field: any) => any, initialValue?: any) => {
  const [field] = createFakeFieldAPI(customize, initialValue);
  const sdk: FieldExtensionSDK = {
    field,
    locales: createFakeLocalesAPI((locales) => {
      locales.available.push('de');
      return locales;
    }),
  } as any;

  return sdk;
};

describe('Field', () => {
  afterEach(cleanup);

  it('renders custom field editor specified by renderFieldEditor', () => {
    const sdk = getSdk();

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
    const sdk = getSdk();

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
    expect((SingleEntryReferenceEditor as unknown as jest.Mock).mock.calls[0][0]).toMatchObject({
      onAction: options.entryLinkEditor.onAction,
      renderCustomCard: options.entryLinkEditor.renderCustomCard,
    } as Partial<Parameters<typeof SingleEntryReferenceEditor>[0]>);
  });

  it('re-renders single field editor when locale changes', () => {
    const props = { isInitiallyDisabled: false, widgetId: 'singleLine' };

    const { container, rerender } = render(
      <Field
        {...props}
        sdk={getSdk((field: any) => {
          field.locale = 'en-US';
          return field;
        }, 'english value')}
      />
    );

    expect(container.querySelector('input')?.value).toBe('english value');

    rerender(
      <Field
        {...props}
        sdk={getSdk((field: any) => {
          field.locale = 'de';
          return field;
        }, 'german value')}
      />
    );

    expect(container.querySelector('input')?.value).toBe('german value');
  });
});
