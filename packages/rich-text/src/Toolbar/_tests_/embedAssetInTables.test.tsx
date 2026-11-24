import * as React from 'react';

import { BLOCKS } from '@contentful/rich-text-types';
import { configure, fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ContentfulEditorIdProvider } from '../../ContentfulEditorProvider';
import { Plate } from '../../internal/plate';
import { SdkProvider } from '../../SdkProvider';
import { createTestEditor } from '../../test-utils';
import { EmbedEntityWidget } from '../components/EmbedEntityWidget';
import Toolbar from '../index';

configure({
  testIdAttribute: 'data-test-id',
});

const mockSdk = (enabledNodeTypes?: string[]): any => ({
  locales: { default: 'en-US' },
  entry: { getSys: vi.fn().mockReturnValue({ id: 'entry-id' }) },
  field: {
    id: 'field-id',
    locale: 'en-US',
    validations: enabledNodeTypes ? [{ enabledNodeTypes }] : [],
  },
  access: { can: vi.fn().mockResolvedValue(true) },
  parameters: { instance: { activeLocales: [] } },
});

const assetItem = 'toolbar-toggle-embedded-asset-block';
const entryItem = 'toolbar-toggle-embedded-entry-block';
const resourceItem = 'toolbar-toggle-embedded-resource-block';
const inlineEntryItem = 'toolbar-toggle-embedded-entry-inline';

const paragraph = (text: string) => ({
  type: BLOCKS.PARAGRAPH,
  data: {},
  children: [{ text }],
});

const tableValue = (cellType: BLOCKS) => [
  {
    type: BLOCKS.TABLE,
    data: {},
    children: [
      {
        type: BLOCKS.TABLE_ROW,
        data: {},
        children: [{ type: cellType, data: {}, children: [paragraph('text')] }],
      },
    ],
  },
  paragraph(''),
];

const renderToolbar = (value: any[], path: number[], sdk = mockSdk()) => {
  const { editor } = createTestEditor({ sdk });
  editor.children = value;
  editor.selection = { anchor: { path, offset: 1 }, focus: { path, offset: 1 } };
  const utils = render(
    <Plate editor={editor}>
      <SdkProvider sdk={sdk}>
        <ContentfulEditorIdProvider value={editor.id}>
          <Toolbar />
        </ContentfulEditorIdProvider>
      </SdkProvider>
    </Plate>,
  );
  fireEvent.click(utils.getByTestId('toolbar-entity-dropdown-toggle'));
  return utils;
};

describe('EmbedEntityWidget', () => {
  const renderWidget = (props: React.ComponentProps<typeof EmbedEntityWidget>, sdk = mockSdk()) => {
    const { editor } = createTestEditor({
      input: (
        <editor>
          <hp>text</hp>
        </editor>
      ),
      sdk,
    });
    const utils = render(
      <Plate editor={editor}>
        <SdkProvider sdk={sdk}>
          <ContentfulEditorIdProvider value={editor.id}>
            <EmbedEntityWidget {...props} />
          </ContentfulEditorIdProvider>
        </SdkProvider>
      </Plate>,
    );
    fireEvent.click(utils.getByTestId('toolbar-entity-dropdown-toggle'));
    return utils;
  };

  it('shows the asset embed but no entry or resource embed when only assets can be inserted', async () => {
    const { findByTestId, queryByTestId } = renderWidget({
      canInsertBlocks: false,
      canInsertAssetBlocks: true,
    });

    expect(await findByTestId(assetItem)).toBeVisible();
    expect(queryByTestId(entryItem)).not.toBeInTheDocument();
    expect(queryByTestId(resourceItem)).not.toBeInTheDocument();
  });

  it('hides the asset embed when assets cannot be inserted', async () => {
    const { queryByTestId, findByTestId } = renderWidget({
      canInsertBlocks: true,
      canInsertAssetBlocks: false,
    });

    expect(await findByTestId(entryItem)).toBeVisible();
    expect(queryByTestId(assetItem)).not.toBeInTheDocument();
  });

  it('shows the asset embed only if the field validations allow it', async () => {
    const { queryByTestId, findByTestId } = renderWidget(
      { canInsertBlocks: true, canInsertAssetBlocks: true },
      mockSdk([BLOCKS.EMBEDDED_ENTRY]),
    );

    expect(await findByTestId(entryItem)).toBeVisible();
    expect(queryByTestId(assetItem)).not.toBeInTheDocument();
  });

  it('follows canInsertBlocks when canInsertAssetBlocks is not provided', async () => {
    const { findByTestId, queryByTestId } = renderWidget({ canInsertBlocks: true });

    expect(await findByTestId(assetItem)).toBeVisible();
    expect(await findByTestId(entryItem)).toBeVisible();
    expect(queryByTestId(resourceItem)).toBeVisible();
  });
});

describe('Toolbar embed menu with the selection in a table', () => {
  it('offers only the asset embed in a table body cell', async () => {
    const { findByTestId, queryByTestId } = renderToolbar(
      tableValue(BLOCKS.TABLE_CELL),
      [0, 0, 0, 0, 0],
    );

    expect(await findByTestId(assetItem)).toBeVisible();
    expect(queryByTestId(entryItem)).not.toBeInTheDocument();
    expect(queryByTestId(resourceItem)).not.toBeInTheDocument();
  });

  it('offers no block embed in a table header cell', async () => {
    const { findByTestId, queryByTestId } = renderToolbar(
      tableValue(BLOCKS.TABLE_HEADER_CELL),
      [0, 0, 0, 0, 0],
    );

    // The menu is open, as inline embeds are still available
    expect(await findByTestId(inlineEntryItem)).toBeVisible();
    expect(queryByTestId(assetItem)).not.toBeInTheDocument();
    expect(queryByTestId(entryItem)).not.toBeInTheDocument();
  });

  it('offers all block embeds outside of tables', async () => {
    const { findByTestId } = renderToolbar([paragraph('text')], [0, 0]);

    expect(await findByTestId(assetItem)).toBeVisible();
    expect(await findByTestId(entryItem)).toBeVisible();
  });
});
