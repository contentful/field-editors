import { BLOCKS, MARKS, Document } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  mark,
  text
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import {
  expectNativeCaret,
  keyModifiers,
  pauseSelectionUpdates,
  pressNativeKey,
  resumeSelectionUpdates
} from './caretTestUtils';
import { entryBlock, paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

const mountWithPendingSelection = (first = paragraphWithText('First paragraph')) => {
  const sdk = createRichTextFakeSdk({
    initialValue: doc(first, paragraphWithText('Second paragraph'))
  });
  mountRichTextEditor({ sdk });
  const page = new RichTextPage();
  page.editor.findByText('Second paragraph').click();
  page.editor.type('{home}');
  // Hold Slate’s selection-update timer pending across native browser events.
  pauseSelectionUpdates();
  pressNativeKey('a');
  expectNativeCaret('aSecond paragraph', 1);
  return page;
};

const resumeAndExpectValue = (page: RichTextPage, expected: Document) => {
  resumeSelectionUpdates();
  page.expectValue(expected);
};

const markShortcuts = [
  ['b', MARKS.BOLD],
  ['i', MARKS.ITALIC],
  ['u', MARKS.UNDERLINE]
] as const;
const headingShortcuts = [
  ['3', BLOCKS.HEADING_3],
  ['5', BLOCKS.HEADING_5]
] as const;

describe('Rich text native caret under repeated editing', () => {
  afterEach(() => {
    cy.document().then((document) => {
      document.querySelector('[data-test-id=outside-editor]')?.remove();
    });
  });

  it('keeps every edit and caret through 50 rapid Up/Down reversals', () => {
    cy.viewport(2000, 900);
    const page = mountWithPendingSelection();
    page.editor.invoke('css', 'width', '1800px');
    const values = ['First paragraph', 'aSecond paragraph'];
    let offset: number;
    for (let repeat = 0; repeat < 50; repeat++) {
      const steps: [number, string, string][] = [
        [0, 'ArrowUp', 'x'],
        [1, 'ArrowDown', 'y']
      ];
      steps.forEach(([index, arrow, letter]) => {
        pressNativeKey(arrow);
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal(values[index]);
          offset = win.getSelection()!.anchorOffset;
        });
        cy.then(() => {
          values[index] = values[index].slice(0, offset) + letter + values[index].slice(offset);
        });
        pressNativeKey(letter);
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal(values[index]);
          expect(win.getSelection()?.anchorOffset).to.equal(offset + 1);
        });
      });
    }
    resumeSelectionUpdates();
    cy.then(() => page.expectValue(doc(...values.map(paragraphWithText))));
  });

  it('distinguishes identical paragraphs when the native caret moves before typing', () => {
    const page = mountWithPendingSelection(paragraphWithText('aSecond paragraph'));
    pressNativeKey('ArrowUp');
    expectNativeCaret('aSecond paragraph', 1);
    pressNativeKey('b');
    expectNativeCaret('abSecond paragraph', 2);
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('abSecond paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  for (const [key, markType] of markShortcuts) {
    it(`applies ${markType} and types in the destination after Up during a pending selection update`, () => {
      const page = mountWithPendingSelection();
      pressNativeKey('ArrowUp');
      expectNativeCaret('First paragraph', 1);
      pressNativeKey(key, keyModifiers.command);
      pressNativeKey('x');
      expectNativeCaret('x', 1);
      resumeAndExpectValue(
        page,
        doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            text('F'),
            text('x', [mark(markType)]),
            text('irst paragraph')
          ),
          paragraphWithText('aSecond paragraph')
        )
      );
    });
  }

  for (const [key, type] of headingShortcuts) {
    it(`changes the destination to ${type} after Up during a pending selection update`, () => {
      const page = mountWithPendingSelection();
      pressNativeKey('ArrowUp');
      expectNativeCaret('First paragraph', 1);
      pressNativeKey(key, keyModifiers.command | keyModifiers.alt);
      expectNativeCaret('First paragraph', 1);
      pressNativeKey('x');
      expectNativeCaret('Fxirst paragraph', 2);
      resumeAndExpectValue(
        page,
        doc(block(type, {}, text('Fxirst paragraph')), paragraphWithText('aSecond paragraph'))
      );
    });
  }

  it('uses the visible caret for horizontal navigation immediately after Up', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    pressNativeKey('ArrowLeft');
    expectNativeCaret('First paragraph', 0);
    pressNativeKey('b');
    expectNativeCaret('bFirst paragraph', 1);
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('bFirst paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('backspaces in the destination paragraph while the previous selection update is pending', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    pressNativeKey('Backspace');
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('irst paragraph'), paragraphWithText('aSecond paragraph'))
    );
    cy.window().should((win) => {
      const selection = win.getSelection()!;
      const paragraph = selection.anchorNode!.parentElement!.closest(
        '[data-slate-node="element"]'
      )!;
      expect(paragraph.textContent!.replace(/\uFEFF/g, '')).to.equal('irst paragraph');
      const range = win.document.createRange();
      range.setStart(paragraph, 0);
      range.setEnd(selection.anchorNode!, selection.anchorOffset);
      expect(range.toString().replace(/\uFEFF/g, '').length).to.equal(0);
    });
  });

  it('deletes forward in the destination paragraph while the previous selection update is pending', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    pressNativeKey('Delete');
    expectNativeCaret('Frst paragraph', 1);
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('Frst paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('replaces an expanded native selection after rapid vertical navigation', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    pressNativeKey('ArrowRight', keyModifiers.shift);
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal('First paragraph');
      expect(win.getSelection()?.toString()).to.equal('i');
    });
    pressNativeKey('b');
    expectNativeCaret('Fbrst paragraph', 2);
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('Fbrst paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('preserves bold and plain text when editing across a formatting boundary', () => {
    const first = block(
      BLOCKS.PARAGRAPH,
      {},
      text('First', [mark(MARKS.BOLD)]),
      text(' paragraph')
    );
    const page = mountWithPendingSelection(first);
    pressNativeKey('ArrowUp');
    expectNativeCaret('First', 1);
    pressNativeKey('b');
    expectNativeCaret('Fbirst', 2);
    for (let index = 0; index < 5; index++) pressNativeKey('ArrowRight');
    let offset: number;
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal(' paragraph');
      offset = win.getSelection()!.anchorOffset;
    });
    pressNativeKey('c');
    resumeSelectionUpdates();
    cy.then(() =>
      page.expectValue(
        doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            text('Fbirst', [mark(MARKS.BOLD)]),
            text(' paragraph'.slice(0, offset) + 'c' + ' paragraph'.slice(offset))
          ),
          paragraphWithText('aSecond paragraph')
        )
      )
    );
  });

  it('undoes and redoes the destination edit without changing the source paragraph', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    pressNativeKey('b');
    expectNativeCaret('Fbirst paragraph', 2);
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('Fbirst paragraph'), paragraphWithText('aSecond paragraph'))
    );
    pressNativeKey('z', keyModifiers.command);
    page.expectValue(
      doc(paragraphWithText('First paragraph'), paragraphWithText('aSecond paragraph'))
    );
    pressNativeKey('z', keyModifiers.command | keyModifiers.shift);
    page.expectValue(
      doc(paragraphWithText('Fbirst paragraph'), paragraphWithText('aSecond paragraph'))
    );
    expectNativeCaret('Fbirst paragraph', 2);
  });

  it('commits IME text after Up without duplicating it or returning to the source paragraph', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.imeSetComposition',
        params: { text: 'に', selectionStart: 1, selectionEnd: 1 }
      })
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.insertText',
        params: { text: '日本' }
      })
    );
    expectNativeCaret('F日本irst paragraph', 3);
    pressNativeKey('b');
    expectNativeCaret('F日本birst paragraph', 4);
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('F日本birst paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('keeps editor content intact when typing into another focused input', () => {
    const page = mountWithPendingSelection();
    cy.window().then((win) => {
      const input = win.document.createElement('input');
      input.setAttribute('data-test-id', 'outside-editor');
      win.document.body.appendChild(input);
      input.focus();
    });
    pressNativeKey('x');
    cy.findByTestId('outside-editor')
      .should('have.value', 'x')
      .then(($input) => $input.remove());
    resumeAndExpectValue(
      page,
      doc(paragraphWithText('First paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('keeps a read-only editor unchanged under native arrow and text input', () => {
    const value = doc(paragraphWithText('First paragraph'), paragraphWithText('Second paragraph'));
    const sdk = createRichTextFakeSdk({ initialValue: value });
    mountRichTextEditor({ sdk, isInitiallyDisabled: true, isDisabled: true });
    const page = new RichTextPage();
    page.editor.should('have.attr', 'contenteditable', 'false').click({ force: true });
    for (let index = 0; index < 10; index++) {
      pressNativeKey('ArrowUp');
      pressNativeKey('x');
      pressNativeKey('ArrowDown');
      pressNativeKey('y');
    }
    page.expectValue(value);
  });

  for (const arrow of ['ArrowDown', 'ArrowRight']) {
    for (const key of ['Delete', 'x']) {
      it(`${arrow} then ${key} preserves the card and edits the paragraph`, () => {
        const sdk = createRichTextFakeSdk({
          initialValue: doc(entryBlock(), paragraphWithText('Body text'))
        });
        mountRichTextEditor({ sdk });
        const page = new RichTextPage();
        page.editor.findByText('Body text').click();
        page.editor.type('{home}');
        cy.findByTestId('cf-ui-entry-card').click();
        page.editor.focus();
        page.editor.should('be.focused');
        pauseSelectionUpdates();
        pressNativeKey(arrow);
        let offset: number;
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal('Body text');
          offset = win.getSelection()!.anchorOffset;
        });
        pressNativeKey(key);
        resumeSelectionUpdates();
        cy.then(() => {
          const value =
            key === 'Delete'
              ? 'Body text'.slice(0, offset) + 'Body text'.slice(offset + 1)
              : 'Body text'.slice(0, offset) + key + 'Body text'.slice(offset);
          page.expectValue(doc(entryBlock(), paragraphWithText(value)));
        });
      });
    }
  }

  for (const arrow of ['ArrowUp', 'ArrowDown']) {
    for (const softBreak of [false, true]) {
      it(`keeps the caret and next edit after ${arrow} then ${softBreak ? 'Shift+Enter' : 'Enter'}`, () => {
        const values = ['First paragraph', 'Second paragraph'];
        const source = arrow === 'ArrowUp' ? 1 : 0;
        const target = 1 - source;
        const sdk = createRichTextFakeSdk({ initialValue: doc(...values.map(paragraphWithText)) });
        mountRichTextEditor({ sdk });
        const page = new RichTextPage();
        page.editor.findByText(values[source]).click();
        page.editor.type('{home}');
        pauseSelectionUpdates();
        pressNativeKey('a');
        values[source] = `a${values[source]}`;
        pressNativeKey(arrow);
        expectNativeCaret(values[target], 1);
        pressNativeKey('Enter', softBreak ? keyModifiers.shift : 0);
        if (softBreak) {
          expectNativeCaret(values[target].slice(0, 1) + '\n' + values[target].slice(1), 2);
          values[target] = values[target].slice(0, 1) + '\nb' + values[target].slice(1);
        } else {
          expectNativeCaret(values[target].slice(1), 0);
          values.splice(target, 1, values[target].slice(0, 1), `b${values[target].slice(1)}`);
        }
        pressNativeKey('b');
        resumeAndExpectValue(page, doc(...values.map(paragraphWithText)));
      });
    }
  }

  it('keeps the caret after Enter, Down and Enter within a wrapped normal paragraph', () => {
    cy.viewport(1000, 900);
    const value =
      'week near the sea. Lisbon and Valencia work well for travelers seeking sunshine and city life. Bergen and Naxos provide access to striking landscapes, while Edinburgh, Kraków and Tallinn are especially rewarding for history lovers.';
    mountRichTextEditor({
      sdk: createRichTextFakeSdk({ initialValue: doc(paragraphWithText(value)) })
    });
    const page = new RichTextPage();
    page.editor.invoke('css', 'width', '350px').findByText(value).click('topLeft');
    page.editor.type('{moveToStart}');
    pauseSelectionUpdates();
    // The first Enter leaves Slate's caret-update timer pending, as in the video.
    pressNativeKey('Enter');
    expectNativeCaret(value, 0);
    pressNativeKey('ArrowDown');
    let offset: number;
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal(value);
      offset = win.getSelection()!.anchorOffset;
      expect(offset).to.be.greaterThan(0);
    });
    pressNativeKey('Enter');
    cy.then(() => expectNativeCaret(value.slice(offset), 0));
    pressNativeKey('b');
    resumeSelectionUpdates();
    cy.then(() =>
      page.expectValue(
        doc(
          paragraphWithText(''),
          paragraphWithText(value.slice(0, offset)),
          paragraphWithText(`b${value.slice(offset)}`)
        )
      )
    );
  });
});
