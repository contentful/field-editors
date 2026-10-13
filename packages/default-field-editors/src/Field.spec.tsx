import * as React from 'react';

import {
  MultipleResourceReferenceEditor,
  SingleEntryReferenceEditor,
  SingleResourceReferenceEditor,
} from '@contentful/field-editor-reference';
import type { FieldAppSDK } from '@contentful/field-editor-shared';
import { createFakeFieldAPI, createFakeLocalesAPI } from '@contentful/field-editor-test-utils';
import { cleanup, configure, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';

import { Field } from './Field';

configure({
  testIdAttribute: 'data-test-id',
});

vi.mock('@contentful/field-editor-reference', async () => {
  const actual = await vi.importActual<typeof import('@contentful/field-editor-reference')>(
    '@contentful/field-editor-reference',
  );
  return {
    ...actual,
    SingleEntryReferenceEditor: vi.fn(() => <div>mock</div>),
    SingleResourceReferenceEditor: vi.fn(() => <div>mock</div>),
    MultipleResourceReferenceEditor: vi.fn(() => <div>mock</div>),
  };
});

const getSdk = (customize?: (field: any) => any, initialValue?: any) => {
  const [field] = createFakeFieldAPI(customize, initialValue);
  const sdk: FieldAppSDK = {
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
      />,
    );

    expect(queryByTestId('customEditor')).toBeInTheDocument();
  });

  it('renders with specified options', () => {
    const sdk = getSdk();

    const options = {
      entryLinkEditor: {
        onAction: vi.fn(),
        renderCustomCard: vi.fn(),
      },
    };
    render(
      <Field
        sdk={sdk}
        isInitiallyDisabled={false}
        widgetId="entryLinkEditor"
        getOptions={() => options}
      />,
    );
    expect((SingleEntryReferenceEditor as unknown as Mock).mock.calls[0][0]).toMatchObject({
      onAction: options.entryLinkEditor.onAction,
      renderCustomCard: options.entryLinkEditor.renderCustomCard,
    } as Partial<Parameters<typeof SingleEntryReferenceEditor>[0]>);
  });

  it.each([
    ['resourceLinkEditor', SingleResourceReferenceEditor],
    ['resourceLinksEditor', MultipleResourceReferenceEditor],
  ])('renders %s with a web app entry link', (widgetId, Editor) => {
    const sdk = { ...getSdk(), hostnames: { webapp: 'app.contentful.com' } } as any;

    render(<Field sdk={sdk} isInitiallyDisabled={false} widgetId={widgetId} />);

    const { getEntryRouteHref } = (Editor as unknown as Mock).mock.calls[0][0];
    expect(getEntryRouteHref({ spaceId: 's', environmentId: 'e', entryId: 'x' })).toBe(
      'https://app.contentful.com/spaces/s/environments/e/entries/x',
    );
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
      />,
    );

    expect(container.querySelector('input')?.value).toBe('english value');

    rerender(
      <Field
        {...props}
        sdk={getSdk((field: any) => {
          field.locale = 'de';
          return field;
        }, 'german value')}
      />,
    );

    expect(container.querySelector('input')?.value).toBe('german value');
  });
});
