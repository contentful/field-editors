import React from 'react';

import { render, configure, waitFor } from '@testing-library/react';
import { Plate } from '@udecode/plate-core';

import '@testing-library/jest-dom/extend-expect';
import { ContentfulEditorProvider, getContentfulEditorId } from '../../ContentfulEditorProvider';
import { SdkProvider } from '../../SdkProvider';
import { TrackingProvider } from '../../TrackingProvider';
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
  const { getByTestId } = render(
    <Plate id={getContentfulEditorId(sdk)}>
      <SdkProvider sdk={sdk}>
        <ContentfulEditorProvider sdk={sdk}>
          <TrackingProvider onAction={jest.fn()}>
            <Toolbar isDisabled />
          </TrackingProvider>
        </ContentfulEditorProvider>
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
