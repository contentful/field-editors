import { BLOCKS } from '@contentful/rich-text-types';
import { expect, it } from 'vitest';

import { sanitizeHTML } from '../../plugins/PasteHTML/utils/sanitizeHTML';
import { createTestEditor } from '../../test-utils/createTestEditor';

it('preserves superscript and subscript styles copied from Google Docs', () => {
  const { editor } = createTestEditor({});
  const html =
    '<span style="vertical-align:super">Hello</span><span style="vertical-align:sub">World</span>';
  expect(editor.api.html.deserialize({ element: sanitizeHTML(html) })).toEqual([
    {
      type: BLOCKS.PARAGRAPH,
      children: [
        { text: 'Hello', superscript: true },
        { text: 'World', subscript: true },
      ],
    },
  ]);
});

it('preserves strikethrough styles and the trailing pasted newline', () => {
  const { editor } = createTestEditor({});
  const html =
    '<p><span style="text-decoration:line-through">Hello world</span></p><br class="Apple-interchange-newline">';
  expect(editor.api.html.deserialize({ element: sanitizeHTML(html) })).toEqual([
    { type: BLOCKS.PARAGRAPH, children: [{ text: 'Hello world', strikethrough: true }] },
    { type: BLOCKS.PARAGRAPH, children: [{ text: '\n' }] },
  ]);
});
