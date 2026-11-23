import * as React from 'react';

import { BLOCKS, MARKS } from '@contentful/rich-text-types';
import { configure, render, waitFor } from '@testing-library/react';
import { describe, expect, it, test, vi } from 'vitest';

import { ContentfulEditorIdProvider, getContentfulEditorId } from '../../ContentfulEditorProvider';
import { Plate, createPlateEditor } from '../../internal/plate';
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
      getSys: vi.fn().mockReturnValue({ id: 'entry-id' }),
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
      can: vi.fn().mockResolvedValue(true),
    },
    parameters: {
      instance: {
        activeLocales: [],
      },
    },
  };
};

describe('Toolbar', () => {
  test('everything on the toolbar should be disabled', async () => {
    const sdk = mockSdk();
    const id = getContentfulEditorId(sdk);

    const { getByTestId } = render(
      <Plate editor={createPlateEditor({ id })}>
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
        <Plate editor={createPlateEditor({ id })}>
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
        <Plate editor={createPlateEditor({ id })}>
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

  describe('lists in tables', () => {
    const renderWithCursorIn = (cellType: BLOCKS.TABLE_CELL | BLOCKS.TABLE_HEADER_CELL) => {
      const sdk = mockSdk();
      const id = getContentfulEditorId(sdk);
      const editor = createPlateEditor({
        id,
        value: [
          {
            type: BLOCKS.TABLE,
            data: {},
            children: [
              {
                type: BLOCKS.TABLE_ROW,
                data: {},
                children: [
                  {
                    type: cellType,
                    data: {},
                    children: [{ type: BLOCKS.PARAGRAPH, data: {}, children: [{ text: 'cell' }] }],
                  },
                ],
              },
            ],
          },
        ],
      });
      editor.selection = {
        anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0, 0], offset: 0 },
      };

      return render(
        <Plate editor={editor}>
          <SdkProvider sdk={sdk}>
            <ContentfulEditorIdProvider value={id}>
              <Toolbar />
            </ContentfulEditorIdProvider>
          </SdkProvider>
        </Plate>,
      );
    };

    it('enables the list buttons inside a table cell', async () => {
      const { getByTestId } = renderWithCursorIn(BLOCKS.TABLE_CELL);

      await waitFor(() => {
        expect(getByTestId('ul-toolbar-button')).toBeEnabled();
        expect(getByTestId('ol-toolbar-button')).toBeEnabled();
        // other block-level formatting stays unavailable in tables
        expect(getByTestId('quote-toolbar-button')).toBeDisabled();
        expect(getByTestId('table-toolbar-button')).toBeDisabled();
      });
    });

    it('disables the list buttons inside a table header cell', async () => {
      const { getByTestId } = renderWithCursorIn(BLOCKS.TABLE_HEADER_CELL);

      await waitFor(() => {
        expect(getByTestId('ul-toolbar-button')).toBeDisabled();
        expect(getByTestId('ol-toolbar-button')).toBeDisabled();
      });
    });
  });
});
