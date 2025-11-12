import { KEY_SOFT_BREAK } from '@udecode/plate-break';
import { jsx, createTestEditor, mockPlugin } from '../../test-utils';
import { createSoftBreakPlugin } from './createSoftBreakPlugin';
describe('Soft Break', ()=>{
    it('derives its config from other plugins', ()=>{
        const input = /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)));
        const rules = [
            {
                hotkey: 'ctrl+enter',
                query: {
                    allow: 'p'
                }
            },
            {
                hotkey: 'ctrl+enter',
                query: {
                    allow: 'h1'
                }
            }
        ];
        const { editor } = createTestEditor({
            input,
            plugins: [
                mockPlugin({
                    softBreak: [
                        rules[0]
                    ]
                }),
                mockPlugin({}),
                mockPlugin({
                    softBreak: [
                        rules[1]
                    ]
                }),
                createSoftBreakPlugin()
            ]
        });
        const outPlugin = editor.pluginsByKey[KEY_SOFT_BREAK];
        expect(outPlugin.options).toEqual({
            rules
        });
    });
});
