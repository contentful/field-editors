import { PasteTextPlugin } from '.';
import { Value, Document, Block, Text, Editor } from 'slate';
import {
  document,
  block,
  text,
  leaf,
  createPasteHtmlEvent,
  createPasteEvent,
} from './../shared/PasteTestHelpers';

import { BLOCKS } from '@contentful/rich-text-types';
import { List } from 'immutable';

const emptyInitialValue = Value.create({
  document: Document.create({
    nodes: [
      Block.create({
        type: BLOCKS.PARAGRAPH,
        nodes: List([Text.create('')]),
      }),
    ],
  }),
});

describe('PasteText Plugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = PasteTextPlugin();
  });

  it('parses raw text', () => {
    const event = createPasteEvent('text/plain', 'I am a plain old text');
    const editor = new Editor({ value: emptyInitialValue });
    const next = jest.fn();

    const result = plugin.onPaste(event, editor, next);

    expect(result).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
    expect(editor.value.document.toJSON()).toEqual(
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('I am a plain old text'))))
    );
  });

  it('ignores HTML', () => {
    const event = createPasteHtmlEvent('<marquee>I sure am some fancy HTML</marquee>');

    const editor = new Editor({ value: emptyInitialValue });
    const next = jest.fn();

    const result = plugin.onPaste(event, editor, next);

    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalled();

    expect(editor.value.document.toJSON()).toEqual(emptyInitialValue.document.toJSON());
  });
});
