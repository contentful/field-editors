import React from 'react';

import { render, configure, waitFor } from '@testing-library/react';
import { Plate } from '@udecode/plate-core';

import '@testing-library/jest-dom/extend-expect';
import { ContentfulEditorIdProvider, getContentfulEditorId } from '../../ContentfulEditorProvider';
import { SdkProvider } from '../../SdkProvider';
import Toolbar from '../index';

configure({
  testIdAttribute: 'data-test-id',
});

let sdk: any;

beforeEach(() => {
  sdk = {
    locales: {
      default: 'en-US',
    },
    entry: {
      getSys: jest.fn().mockReturnValue({ id: 'entry-id' }),
    },
    field: {
      id: 'field-id',
      locale: 'en-US',
    },
    access: {
      can: jest.fn().mockResolvedValue(true),
    },
  };
});

test('everything on the toolbar should be disabled', async () => {
  const id = getContentfulEditorId(sdk);

  const { getByTestId } = render(
    <Plate id={id}>
      <SdkProvider sdk={sdk}>
        <ContentfulEditorIdProvider value={id}>
          <Toolbar isDisabled />
        </ContentfulEditorIdProvider>
      </SdkProvider>
    </Plate>
  );
  await waitFor(() => {
    expect(getByTestId('toolbar-heading-toggle')).toBeDisabled();
    [
      'bold',
      'italic',
      'underline',
      'code',
      'hyperlink',
      'quote',
      'ul',
      'ol',
      'hr',
      'table',
    ].forEach((s) => expect(getByTestId(`${s}-toolbar-button`)).toBeDisabled());
    expect(getByTestId('toolbar-entity-dropdown-toggle')).toBeDisabled();
  });
});
