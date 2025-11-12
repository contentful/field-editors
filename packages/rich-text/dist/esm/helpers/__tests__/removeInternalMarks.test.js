import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { COMMAND_PROMPT } from '../../plugins/CommandPalette/constants';
import { jsx } from '../../test-utils';
import { removeInternalMarks } from '../removeInternalMarks';
describe('internal mark', ()=>{
    describe('First level nodes', ()=>{
        const data = [
            {
                title: 'Paragraph mark is removed',
                input: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
                        [COMMAND_PROMPT]: true
                    }))).children
                }),
                expected: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null))).children
                })
            },
            {
                title: 'Heading mark is removed',
                input: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("htext", {
                        [COMMAND_PROMPT]: true
                    }))).children
                }),
                expected: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hh1", null, /*#__PURE__*/ jsx("htext", null))).children
                })
            },
            {
                title: 'Block quote mark is removed',
                input: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
                        [COMMAND_PROMPT]: true
                    })))).children
                }),
                expected: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null)))).children
                })
            },
            {
                title: 'Other marks are not removed',
                input: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
                        bold: true,
                        underline: true,
                        [COMMAND_PROMPT]: true
                    })))).children
                }),
                expected: toContentfulDocument({
                    document: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", {
                        bold: true,
                        underline: true
                    })))).children
                })
            }
        ];
        for (const { input, expected, title } of data){
            it(`${title}`, ()=>{
                expect(removeInternalMarks(input)).toEqual(expected);
            });
        }
    });
});
