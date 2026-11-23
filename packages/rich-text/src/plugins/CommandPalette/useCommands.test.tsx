import * as React from 'react';

import { BLOCKS } from '@contentful/rich-text-types';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlateEditor } from '../../internal/types';
import { createTestEditor } from '../../test-utils';
import { CommandList, useCommands } from './useCommands';

vi.mock('@contentful/field-editor-shared/react-query', () => ({
  useContentTypes: () => ({ contentTypes: [] }),
}));

const sdk: any = {
  field: { id: 'field-id', locale: 'en-US', validations: [] },
};

const paragraph = (text: string) => ({ type: BLOCKS.PARAGRAPH, data: {}, children: [{ text }] });
const cell = (type: BLOCKS, text: string) => ({ type, data: {}, children: [paragraph(text)] });

const renderCommands = (editor: PlateEditor, fieldSdk = sdk): CommandList => {
  let commands: CommandList = [];
  const Probe = () => {
    commands = useCommands(fieldSdk, '', editor);
    return null;
  };
  render(<Probe />);
  return commands;
};

const getAssetsCommandGroup = (value: any[], anchor: number[], focus = anchor) => {
  const { editor } = createTestEditor({});
  editor.children = value;
  editor.selection = {
    anchor: { path: anchor, offset: 0 },
    focus: { path: focus, offset: 0 },
  };

  return renderCommands(editor).find((command) => 'group' in command && command.group === 'Assets');
};

const tableWith = (...cells: any[]) => [
  {
    type: BLOCKS.TABLE,
    data: {},
    children: [{ type: BLOCKS.TABLE_ROW, data: {}, children: cells }],
  },
  paragraph(''),
];

describe('useCommands embed asset command', () => {
  it('is available outside of tables', () => {
    expect(getAssetsCommandGroup([paragraph('text')], [0, 0])).toBeDefined();
  });

  it('is available in a table body cell', () => {
    const value = tableWith(cell(BLOCKS.TABLE_CELL, 'body'));

    expect(getAssetsCommandGroup(value, [0, 0, 0, 0, 0])).toBeDefined();
  });

  it('is not available in a table header cell', () => {
    const value = tableWith(cell(BLOCKS.TABLE_HEADER_CELL, 'header'));

    expect(getAssetsCommandGroup(value, [0, 0, 0, 0, 0])).toBeUndefined();
  });

  it('is not available when the selection spans several cells', () => {
    const value = tableWith(cell(BLOCKS.TABLE_CELL, 'one'), cell(BLOCKS.TABLE_CELL, 'two'));

    expect(getAssetsCommandGroup(value, [0, 0, 0, 0, 0], [0, 0, 1, 0, 0])).toBeUndefined();
  });

  it('is not available when the field does not allow embedded assets', () => {
    const { editor } = createTestEditor({});
    editor.children = [paragraph('text')];
    editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    const restrictedSdk: any = {
      field: {
        ...sdk.field,
        validations: [{ enabledNodeTypes: [BLOCKS.EMBEDDED_ENTRY] }],
      },
    };

    expect(
      renderCommands(editor, restrictedSdk).some(
        (command) => 'group' in command && command.group === 'Assets',
      ),
    ).toBe(false);
  });
});
