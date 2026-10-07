import { document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import {
  expectNativeCaret,
  pauseSelectionUpdates,
  pressNativeKey,
  resumeSelectionUpdates
} from './caretTestUtils';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

const checkTypingAfterArrow = (key: 'ArrowUp' | 'ArrowDown') => {
  const paragraphs = ['First paragraph', 'Second paragraph'];
  const source = key === 'ArrowUp' ? 1 : 0;
  const target = 1 - source;
  const sdk = createRichTextFakeSdk({ initialValue: doc(...paragraphs.map(paragraphWithText)) });
  mountRichTextEditor({ sdk });
  const page = new RichTextPage();
  page.editor.findByText(paragraphs[source]).click();
  page.editor.type('{home}');
  pauseSelectionUpdates();

  // Insertion at offset zero makes Slate render a new DOM caret. Keep its
  // selection-update timer pending while the next native keys arrive.
  pressNativeKey('a');
  paragraphs[source] = `a${paragraphs[source]}`;
  expectNativeCaret(paragraphs[source], 1);
  pressNativeKey(key);
  let offset: number;
  cy.window().should((win) => {
    expect(win.getSelection()?.anchorNode?.textContent).to.equal(paragraphs[target]);
    offset = win.getSelection()!.anchorOffset;
  });
  cy.then(() => {
    paragraphs[target] =
      paragraphs[target].slice(0, offset) + 'b' + paragraphs[target].slice(offset);
  });
  pressNativeKey('b');
  cy.then(() => expectNativeCaret(paragraphs[target], offset + 1));
  resumeSelectionUpdates();
  cy.then(() => {
    page.expectValue(doc(...paragraphs.map(paragraphWithText)));
  });
};

describe('Rich text caret after vertical navigation', () => {
  it('keeps the insertion caret after moving up during a pending selection update', () => {
    checkTypingAfterArrow('ArrowUp');
  });

  it('keeps the insertion caret after moving down during a pending selection update', () => {
    checkTypingAfterArrow('ArrowDown');
  });
});
