/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { SoftBreakRule, KEY_SOFT_BREAK } from '../../internal/breaks';
import { jsx, createTestEditor, mockPlugin } from '../../test-utils';
import { createSoftBreakPlugin } from './createSoftBreakPlugin';

describe('Soft Break', () => {
  it('derives its config from other plugins', () => {
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
          softBreak: [rules[0]],
        }),

        mockPlugin({}),

        mockPlugin({
          softBreak: [rules[1]],
        }),
        createSoftBreakPlugin(),
      ],
    });

    const outPlugin = editor.contentfulPlugins.find((p) => p.key === KEY_SOFT_BREAK)!;

    expect(outPlugin.options).toEqual({ rules });
  });
});
