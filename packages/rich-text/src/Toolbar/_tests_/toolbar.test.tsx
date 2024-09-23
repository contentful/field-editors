import * as React from 'react';

import { MARKS } from '@contentful/rich-text-types';
import { configure, render, waitFor } from '@testing-library/react';
import { Plate } from '@udecode/plate-common';

import '@testing-library/jest-dom/extend-expect';
import { ContentfulEditorIdProvider, getContentfulEditorId } from '../../ContentfulEditorProvider';
import { SdkProvider } from '../../SdkProvider';
import Toolbar from '../index';

configure({
  testIdAttribute: 'data-test-id',
});

const mockSdk = (marks?: MARKS[]): any => {
  return {
    locales: {
      default: 'en-US',
    },
    entry: {
      getSys: jest.fn().mockReturnValue({ id: 'entry-id' }),
    },
    field: {
      id: 'field-id',
      locale: 'en-US',
      validations: [
        {
          enabledMarks: marks || Object.values(MARKS),
        },
      ],
    },
    access: {
      can: jest.fn().mockResolvedValue(true),
    },
  };
};

describe('Toolbar', () => {
  test('everything on the toolbar should be disabled', async () => {
    const sdk = mockSdk();
    const id = getContentfulEditorId(sdk);

    const { getByTestId } = render(
      <Plate id={id}>
        <SdkProvider sdk={sdk}>
          <ContentfulEditorIdProvider value={id}>
            <Toolbar isDisabled />
          </ContentfulEditorIdProvider>
        </SdkProvider>
      </Plate>,
    );
    await waitFor(() => {
      expect(getByTestId('toolbar-heading-toggle')).toBeDisabled();
      [
        MARKS.BOLD,
        MARKS.ITALIC,
        MARKS.UNDERLINE,
        'dropdown',
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

  describe('Dropdown', () => {
    it('always shows whenever at least bold, italic and underline are available', () => {
      const sdk = mockSdk([MARKS.BOLD, MARKS.ITALIC, MARKS.SUPERSCRIPT]);
      const id = getContentfulEditorId(sdk);
      const { queryByTestId } = render(
        <Plate id={id}>
          <SdkProvider sdk={sdk}>
            <ContentfulEditorIdProvider value={id}>
              <Toolbar isDisabled />
            </ContentfulEditorIdProvider>
          </SdkProvider>
        </Plate>,
      );
      expect(queryByTestId('dropdown-toolbar-button')).toBeVisible();
    });

    it('does not show if bold, italic and underline are not available', () => {
      const sdk = mockSdk([MARKS.SUPERSCRIPT, MARKS.SUBSCRIPT, MARKS.CODE]);
      const id = getContentfulEditorId(sdk);
      const { queryByTestId } = render(
        <Plate id={id}>
          <SdkProvider sdk={sdk}>
            <ContentfulEditorIdProvider value={id}>
              <Toolbar isDisabled />
            </ContentfulEditorIdProvider>
          </SdkProvider>
        </Plate>,
      );
      expect(queryByTestId('dropdown-toolbar-button')).not.toBeInTheDocument();
    });
  });
});
