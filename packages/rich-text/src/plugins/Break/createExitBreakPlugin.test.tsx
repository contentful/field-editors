/** @jsx jsx */
import { ExitBreakRule } from '@udecode/plate-break';
import { KEY_EXIT_BREAK } from '@udecode/plate-break';

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

    const outPlugin = editor.pluginsByKey[KEY_EXIT_BREAK];
    expect(outPlugin.options).toEqual({ rules: expect.arrayContaining(rules) });
  });
});
