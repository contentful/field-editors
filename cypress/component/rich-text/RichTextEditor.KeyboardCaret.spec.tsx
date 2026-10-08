import * as React from 'react';

import { BLOCKS } from '@contentful/rich-text-types';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import {
  expectNativeCaret,
  expectParagraphCaret,
  pauseSelectionUpdates,
  pressNativeKey,
  resumeSelectionUpdates,
} from './caretTestUtils';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';

// Force an unrelated parent update after native movement, before Slate's
// throttled selection handler catches up. The editor content stays unchanged.
const Host = ({ sdk }: { sdk: ReturnType<typeof createRichTextFakeSdk> }) => {
  const [, render] = React.useReducer((count) => count + 1, 0);
  return (
    <div
      role="presentation"
      onKeyUp={(event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') render();
      }}>
      <RichTextEditor
        sdk={sdk}
        isInitiallyDisabled={false}
        withSelectionSync
        onAction={() => undefined}
      />
    </div>
  );
};

describe('Rich text keyboard caret during host renders', { browser: 'chrome' }, () => {
  it('keeps the native caret through rapid Up/Down and a host render before typing', () => {
    const sdk = createRichTextFakeSdk({
      initialValue: doc(
        paragraphWithText('First paragraph'),
        paragraphWithText('Second paragraph'),
      ),
    });
    mount(<Host sdk={sdk} />);
    const page = new RichTextPage();
    page.editor.findByText('Second paragraph').click();
    page.editor.type('{home}');
    pauseSelectionUpdates();
    pressNativeKey('a');
    expectNativeCaret('aSecond paragraph', 1);
    for (let repeat = 0; repeat < 8; repeat++) {
      pressNativeKey('ArrowUp');
      pressNativeKey('ArrowDown');
    }
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    pressNativeKey('x');
    expectNativeCaret('Fxirst paragraph', 2);
    resumeSelectionUpdates();
    page.expectValue(
      doc(paragraphWithText('Fxirst paragraph'), paragraphWithText('aSecond paragraph')),
    );
  });

  it('keeps edits in a wrapped paragraph in a long document with live selection timers', () => {
    const first = 'A wrapped paragraph with enough words to fill several lines. '.repeat(8);
    const heading = block(BLOCKS.HEADING_1, {}, text('Long document'));
    const remaining = Array.from({ length: 300 }, (_, index) =>
      paragraphWithText(`Paragraph ${index}: ${first}`),
    );
    const sdk = createRichTextFakeSdk({
      initialValue: doc(
        heading,
        paragraphWithText(first),
        paragraphWithText('Second paragraph'),
        ...remaining,
      ),
    });
    mount(<Host sdk={sdk} />);
    const page = new RichTextPage();
    page.editor.findByText('Second paragraph').click();
    page.editor.type('{home}');
    pressNativeKey('a');
    expectNativeCaret('aSecond paragraph', 1);
    for (let repeat = 0; repeat < 30; repeat++) {
      pressNativeKey('ArrowUp');
      pressNativeKey('ArrowDown');
    }
    pressNativeKey('ArrowUp');
    let offset: number;
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal(first);
      offset = win.getSelection()!.anchorOffset;
    });
    pressNativeKey('x');
    cy.then(() => {
      const expected = first.slice(0, offset) + 'x' + first.slice(offset);
      expectParagraphCaret(expected, offset + 1);
      page.expectValue(
        doc(
          heading,
          paragraphWithText(expected),
          paragraphWithText('aSecond paragraph'),
          ...remaining,
        ),
      );
    });
  });
});
