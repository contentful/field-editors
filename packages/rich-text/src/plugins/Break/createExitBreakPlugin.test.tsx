/** @jsx jsx */
import { describe, expect, it } from 'vitest';

import { ExitBreakRule } from '../../internal/breaks';
import { KEY_EXIT_BREAK } from '../../internal/breaks';
import { jsx, createTestEditor, mockPlugin } from '../../test-utils';
import { createExitBreakPlugin } from './createExitBreakPlugin';

describe('Exit Break', () => {
  // https://slate-js.slack.com/archives/C013QHXSCG1/p1640853996467300
  it('derives its config from other plugins', () => {
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
          exitBreak: rules,
        }),
        createExitBreakPlugin(),
      ],
    });

    const outPlugin = editor.contentfulPlugins.find((p) => p.key === KEY_EXIT_BREAK)!;
    expect(outPlugin.options).toEqual({ rules: expect.arrayContaining(rules) });
  });
});
