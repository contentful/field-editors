/** @jsx jsx */
import { SoftBreakRule } from '@udecode/plate-break';
import { mockPlugin } from '@udecode/plate-core';
import { KEY_SOFT_BREAK } from '@udecode/plate-break';

import { RichTextPlugin } from '../../types';
import { jsx, createTestEditor } from '../../test-utils';
import { createSoftBreakPlugin } from './createSoftBreakPlugin';

describe('Soft Break', () => {
  it('drives its config from other plugins', () => {
    const input = (
      <editor>
        <hp>
          <htext />
        </hp>
      </editor>
    );

    const rules: SoftBreakRule[] = [
      {
        hotkey: 'ctrl+enter',
        query: {
          allow: 'p',
        },
      },
      {
        hotkey: 'ctrl+enter',
        query: {
          allow: 'h1',
        },
      },
    ];

    const { editor } = createTestEditor({
      input,
      plugins: [
        mockPlugin({
          key: 'mock1',
          softBreak: [rules[0]],
        } as RichTextPlugin),

        mockPlugin({
          key: 'mock2',
        }),

        mockPlugin({
          key: 'mock3',
          softBreak: [rules[1]],
        } as RichTextPlugin),
        createSoftBreakPlugin(),
      ],
    });

    const outPlugin = editor.pluginsByKey[KEY_SOFT_BREAK];

    expect(outPlugin.options).toEqual({ rules });
  });
});
