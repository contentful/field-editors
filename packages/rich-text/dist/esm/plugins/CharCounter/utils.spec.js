import { jsx } from '../../test-utils';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';
import { getTextContent } from './utils';
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
describe('getTextContent', ()=>{
    const cases = [
        {
            title: 'empty document',
            input: /*#__PURE__*/ jsx("editor", null)
        },
        {
            title: 'list of paragraphs',
            input: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 1")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 2")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 3")))
        },
        {
            title: 'void blocks',
            input: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 1")), /*#__PURE__*/ jsx("hhr", null), /*#__PURE__*/ jsx("hhr", null), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 2")), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 3")))
        },
        {
            title: 'blockquote inside list item',
            input: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hul", null, /*#__PURE__*/ jsx("hli", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 1")), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 2"))))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "trailing paragraph")))
        },
        {
            title: 'empty blockquote between paragraphs',
            input: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 1")), /*#__PURE__*/ jsx("hquote", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null))), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "paragraph 3")))
        },
        {
            title: 'paragraphs with inline nodes',
            input: /*#__PURE__*/ jsx("editor", null, /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "text 1"), /*#__PURE__*/ jsx("hinline", {
                id: "first-entry",
                type: "Entry"
            }), /*#__PURE__*/ jsx("htext", null, "text 2"), /*#__PURE__*/ jsx("hinline", {
                id: "another-entry",
                type: "Entry"
            })), /*#__PURE__*/ jsx("hp", null, /*#__PURE__*/ jsx("htext", null, "text 3")))
        }
    ];
    cases.forEach(({ title, input })=>{
        it(title, ()=>{
            expect(getTextContent(input)).toBe(documentToPlainTextString(toContentfulDocument({
                document: input.children
            })));
        });
    });
});
