/** @jsx jsx */
import { ExitBreakRule, KEY_EXIT_BREAK } from '@udecode/plate-break';
import { isFirstChild } from '@udecode/plate-core';

import { isRootLevel } from '../../helpers/editor';
import { jsx, createTestEditor, mockPlugin } from '../../test-utils';
import { createExitBreakPlugin } from './createExitBreakPlugin';

describe('Exit Break', () => {
  it('drives its config from other plugins', () => {
    const input = (
      <editor>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    const rules: ExitBreakRule[] = [
      {
        hotkey: 'enter',
        before: true,
        query: {
          filter: ([node, path]) => isRootLevel(path) && isFirstChild(path) && !!node.isVoid,
        },
      },
      // Can insert after a void block
      {
        hotkey: 'enter',
        query: {
          filter: ([node, path]) => !isFirstChild(path) && !!node.isVoid,
        },
        before: true,
      },
      {
        hotkey: 'enter',
        query: {
          allow: 'h1',
          end: true,
          start: true,
        },
      },
    ];

    const { editor } = createTestEditor({
      input,
      plugins: [
        mockPlugin({}),

        mockPlugin({
          exitBreak: [rules[2]],
        }),
        createExitBreakPlugin(),
      ],
    });

    const outPlugin = editor.pluginsByKey[KEY_EXIT_BREAK];
    expect(JSON.stringify(outPlugin.options)).toEqual(JSON.stringify({ rules }));
  });
});
