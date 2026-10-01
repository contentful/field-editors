import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { expect, it } from 'vitest';

import { wrapLink } from '../../helpers/editor';
import { createTestEditor } from '../../test-utils/createTestEditor';

it('converts selected text into a hyperlink', () => {
  const { editor } = createTestEditor({});
  editor.children = [{ type: BLOCKS.PARAGRAPH, children: [{ text: 'My cool website' }] }];
  editor.tf.select({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 15 } });
  editor.tf.withoutNormalizing(() => {
    wrapLink(editor, {
      text: 'My cool website',
      url: 'https://example.com',
      type: INLINES.HYPERLINK
    });
  });
  expect(editor.children[0].children).toEqual([
    { text: '' },
    {
      type: INLINES.HYPERLINK,
      data: { uri: 'https://example.com' },
      children: [{ text: 'My cool website' }]
    },
    { text: '' }
  ]);
});
