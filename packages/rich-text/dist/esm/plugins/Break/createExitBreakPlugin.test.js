import { KEY_EXIT_BREAK } from '@udecode/plate-break';
import { jsx, createTestEditor, mockPlugin } from '../../test-utils';
import { createExitBreakPlugin } from './createExitBreakPlugin';
describe('Exit Break', ()=>{
    it('derives its config from other plugins', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const rules = [
            {
                hotkey: 'enter',
                query: {
                    allow: 'h1',
                    end: true,
                    start: true
                }
            }
        ];
        const { editor } = createTestEditor({
            input,
            plugins: [
                mockPlugin({}),
                mockPlugin({
                    exitBreak: rules
                }),
                createExitBreakPlugin()
            ]
        });
        const outPlugin = editor.pluginsByKey[KEY_EXIT_BREAK];
        expect(outPlugin.options).toEqual({
            rules: expect.arrayContaining(rules)
        });
    });
});
