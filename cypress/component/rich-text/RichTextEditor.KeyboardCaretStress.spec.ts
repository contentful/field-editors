import { BLOCKS, MARKS, Document } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  mark,
  text,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import {
  expectNativeCaret,
  expectParagraphCaret,
  keyModifiers,
  pauseSelectionUpdates,
  pressNativeKey,
  resumeSelectionUpdates,
} from './caretTestUtils';
import { entryBlock, paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

const paragraphDocument = (...values: string[]) => doc(...values.map(paragraphWithText));

const mountWithPendingSelection = (first = paragraphWithText('First paragraph')) => {
  const sdk = createRichTextFakeSdk({
    initialValue: doc(first, paragraphWithText('Second paragraph')),
  });
  mountRichTextEditor({ sdk, withSelectionSync: true });
  const page = new RichTextPage();
  page.editor.findByText('Second paragraph').click();
  page.editor.type('{home}');
  // Hold Slate’s selection-update timer pending across native browser events.
  pauseSelectionUpdates();
  pressNativeKey('a');
  expectNativeCaret('aSecond paragraph', 1);
  return page;
};

const expectSavedValue = (page: RichTextPage, expected: Document) => {
  resumeSelectionUpdates();
  page.expectValue(expected);
};

const markShortcuts = [
  ['b', MARKS.BOLD],
  ['i', MARKS.ITALIC],
  ['u', MARKS.UNDERLINE],
] as const;
const headingShortcuts = [
  ['3', BLOCKS.HEADING_3],
  ['5', BLOCKS.HEADING_5],
] as const;

describe('Rich text native caret under repeated editing', { browser: 'chrome' }, () => {
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
        [1, 'ArrowDown', 'y'],
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
    cy.then(() => page.expectValue(paragraphDocument(...values)));
  });

  it('distinguishes identical paragraphs when the native caret moves before typing', () => {
    const page = mountWithPendingSelection(paragraphWithText('aSecond paragraph'));
    pressNativeKey('ArrowUp');
    expectNativeCaret('aSecond paragraph', 1);
    pressNativeKey('b');
    expectNativeCaret('abSecond paragraph', 2);
    expectSavedValue(page, paragraphDocument('abSecond paragraph', 'aSecond paragraph'));
  });

  for (const format of ['plain text', 'HTML']) {
    it(`pastes ${format} at the visible caret and keeps the next edit there`, () => {
      const page = mountWithPendingSelection();
      pressNativeKey('ArrowUp');
      expectNativeCaret('First paragraph', 1);
      page.editor.then(($editor) => {
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/plain', 'paste');
        if (format === 'HTML') clipboardData.setData('text/html', '<b>paste</b>');
        cy.wrap($editor).trigger('paste', { eventConstructor: 'ClipboardEvent', clipboardData });
        if (format === 'HTML') {
          cy.window().then((win) => {
            const target = win.getSelection()!.getRangeAt(0).cloneRange();
            // Chrome follows paste with beforeinput; plain-text paste uses onPaste alone.
            const input = new InputEvent('beforeinput', {
              inputType: 'insertFromPaste',
              bubbles: true,
              cancelable: true,
              dataTransfer: clipboardData,
            });
            cy.wrap($editor).trigger(
              'beforeinput',
              Object.assign(input, {
                getTargetRanges: () => [target],
              }),
            );
          });
        }
      });
      expectParagraphCaret('Fpasteirst paragraph', 6);
      pressNativeKey('x');
      expectParagraphCaret('Fpastexirst paragraph', 7);
      const content =
        format === 'HTML'
          ? [text('F'), text('pastex', [mark(MARKS.BOLD)]), text('irst paragraph')]
          : [text('Fpastexirst paragraph')];
      expectSavedValue(
        page,
        doc(block(BLOCKS.PARAGRAPH, {}, ...content), paragraphWithText('aSecond paragraph')),
      );
    });
  }

  for (const action of ['copy', 'cut']) {
    it(`${action === 'copy' ? 'copies' : 'cuts'} the visible selection while its Slate update is pending`, () => {
      const page = mountWithPendingSelection();
      pressNativeKey('ArrowUp');
      pressNativeKey('ArrowRight', keyModifiers.shift);
      cy.window().should((win) => expect(win.getSelection()?.toString()).to.equal('i'));
      page.editor.then(($editor) => {
        const clipboardData = new DataTransfer();
        cy.wrap($editor).trigger(action, { eventConstructor: 'ClipboardEvent', clipboardData });
        cy.then(() => expect(clipboardData.getData('text/plain')).to.equal('i'));
      });
      expectSavedValue(
        page,
        paragraphDocument(
          action === 'cut' ? 'Frst paragraph' : 'First paragraph',
          'aSecond paragraph',
        ),
      );
    });
  }

  it('cuts a selected card without deleting text at the old browser caret', () => {
    const sdk = createRichTextFakeSdk({
      initialValue: doc(entryBlock(), paragraphWithText('Body')),
    });
    mountRichTextEditor({ sdk, withSelectionSync: true });
    const page = new RichTextPage();
    page.editor.findByText('Body').click();
    page.editor.type('{home}');
    pauseSelectionUpdates();
    cy.findByTestId('cf-ui-entry-card').click();
    page.editor.trigger('cut', {
      eventConstructor: 'ClipboardEvent',
      clipboardData: new DataTransfer(),
    });
    expectSavedValue(page, paragraphDocument('Body'));
  });

  it('indents the visible list item after Up during a pending selection update', () => {
    const item = (value: string) => block(BLOCKS.LIST_ITEM, {}, paragraphWithText(value));
    const list = (...items) => block(BLOCKS.UL_LIST, {}, ...items);
    const page = mountWithPendingSelection(list(item('First item'), item('Second item')));
    pressNativeKey('ArrowUp');
    let offset: number;
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal('Second item');
      offset = win.getSelection()!.anchorOffset;
    });
    pressNativeKey('Tab');
    cy.then(() => expectNativeCaret('Second item', offset));
    pressNativeKey('x');
    resumeSelectionUpdates();
    cy.then(() => {
      const edited = 'Second item'.slice(0, offset) + 'x' + 'Second item'.slice(offset);
      page.expectValue(
        doc(
          list(block(BLOCKS.LIST_ITEM, {}, paragraphWithText('First item'), list(item(edited)))),
          paragraphWithText('aSecond paragraph'),
        ),
      );
    });
  });

  for (const [key, markType] of markShortcuts) {
    it(`applies ${markType} and types in the destination after Up during a pending selection update`, () => {
      const page = mountWithPendingSelection();
      pressNativeKey('ArrowUp');
      expectNativeCaret('First paragraph', 1);
      pressNativeKey(key, keyModifiers.command);
      pressNativeKey('x');
      expectNativeCaret('x', 1);
      expectSavedValue(
        page,
        doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            text('F'),
            text('x', [mark(markType)]),
            text('irst paragraph'),
          ),
          paragraphWithText('aSecond paragraph'),
        ),
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
      expectSavedValue(
        page,
        doc(block(type, {}, text('Fxirst paragraph')), paragraphWithText('aSecond paragraph')),
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
    expectSavedValue(page, paragraphDocument('bFirst paragraph', 'aSecond paragraph'));
  });

  it('backspaces in the destination paragraph while the previous selection update is pending', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    pressNativeKey('Backspace');
    expectSavedValue(page, paragraphDocument('irst paragraph', 'aSecond paragraph'));
    expectParagraphCaret('irst paragraph', 0);
  });

  it('deletes forward in the destination paragraph while the previous selection update is pending', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    pressNativeKey('Delete');
    expectNativeCaret('Frst paragraph', 1);
    expectSavedValue(page, paragraphDocument('Frst paragraph', 'aSecond paragraph'));
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
    expectSavedValue(page, paragraphDocument('Fbrst paragraph', 'aSecond paragraph'));
  });

  it('preserves bold and plain text when editing across a formatting boundary', () => {
    const first = block(
      BLOCKS.PARAGRAPH,
      {},
      text('First', [mark(MARKS.BOLD)]),
      text(' paragraph'),
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
            text(' paragraph'.slice(0, offset) + 'c' + ' paragraph'.slice(offset)),
          ),
          paragraphWithText('aSecond paragraph'),
        ),
      ),
    );
  });

  it('undoes and redoes the destination edit without changing the source paragraph', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    pressNativeKey('b');
    expectNativeCaret('Fbirst paragraph', 2);
    expectSavedValue(page, paragraphDocument('Fbirst paragraph', 'aSecond paragraph'));
    pressNativeKey('z', keyModifiers.command);
    page.expectValue(paragraphDocument('First paragraph', 'aSecond paragraph'));
    pressNativeKey('z', keyModifiers.command | keyModifiers.shift);
    page.expectValue(paragraphDocument('Fbirst paragraph', 'aSecond paragraph'));
    expectNativeCaret('Fbirst paragraph', 2);
  });

  it('commits IME text after Up without duplicating it or returning to the source paragraph', () => {
    const page = mountWithPendingSelection();
    pressNativeKey('ArrowUp');
    expectNativeCaret('First paragraph', 1);
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.imeSetComposition',
        params: { text: 'に', selectionStart: 1, selectionEnd: 1 },
      }),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.insertText',
        params: { text: '日本' },
      }),
    );
    expectNativeCaret('F日本irst paragraph', 3);
    pressNativeKey('b');
    expectNativeCaret('F日本birst paragraph', 4);
    expectSavedValue(page, paragraphDocument('F日本birst paragraph', 'aSecond paragraph'));
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
    expectSavedValue(page, paragraphDocument('First paragraph', 'aSecond paragraph'));
  });

  it('keeps a read-only editor unchanged under native arrow and text input', () => {
    const value = paragraphDocument('First paragraph', 'Second paragraph');
    const sdk = createRichTextFakeSdk({ initialValue: value });
    mountRichTextEditor({
      sdk,
      withSelectionSync: true,
      isInitiallyDisabled: true,
      isDisabled: true,
    });
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
          initialValue: doc(entryBlock(), paragraphWithText('Body text')),
        });
        mountRichTextEditor({ sdk, withSelectionSync: true });
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
    for (const edit of ['typing', 'Enter', 'Shift+Enter']) {
      it(`keeps the caret and next edit after ${arrow} then ${edit}`, () => {
        const values = ['First paragraph', 'Second paragraph'];
        const source = arrow === 'ArrowUp' ? 1 : 0;
        const target = 1 - source;
        const sdk = createRichTextFakeSdk({ initialValue: paragraphDocument(...values) });
        mountRichTextEditor({ sdk, withSelectionSync: true });
        const page = new RichTextPage();
        page.editor.findByText(values[source]).click();
        page.editor.type('{home}');
        pauseSelectionUpdates();
        pressNativeKey('a');
        values[source] = `a${values[source]}`;
        expectNativeCaret(values[source], 1);
        pressNativeKey(arrow);
        expectNativeCaret(values[target], 1);
        if (edit === 'typing') {
          values[target] = values[target].slice(0, 1) + 'b' + values[target].slice(1);
        } else if (edit === 'Shift+Enter') {
          pressNativeKey('Enter', keyModifiers.shift);
          expectNativeCaret(values[target].slice(0, 1) + '\n' + values[target].slice(1), 2);
          values[target] = values[target].slice(0, 1) + '\nb' + values[target].slice(1);
        } else {
          pressNativeKey('Enter');
          expectNativeCaret(values[target].slice(1), 0);
          values.splice(target, 1, values[target].slice(0, 1), `b${values[target].slice(1)}`);
        }
        pressNativeKey('b');
        if (edit === 'typing') expectNativeCaret(values[target], 2);
        expectSavedValue(page, paragraphDocument(...values));
      });
    }
  }

  it('keeps the caret after Enter, Down and Enter within a wrapped normal paragraph', () => {
    cy.viewport(1000, 900);
    const value =
      'week near the sea. Lisbon and Valencia work well for travelers seeking sunshine and city life. Bergen and Naxos provide access to striking landscapes, while Edinburgh, Kraków and Tallinn are especially rewarding for history lovers.';
    mountRichTextEditor({
      sdk: createRichTextFakeSdk({ initialValue: paragraphDocument(value) }),
      withSelectionSync: true,
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
      page.expectValue(paragraphDocument('', value.slice(0, offset), `b${value.slice(offset)}`)),
    );
  });
});
