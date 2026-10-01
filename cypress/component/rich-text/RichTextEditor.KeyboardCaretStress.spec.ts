import { BLOCKS, MARKS, Document } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  mark,
  text
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { entryBlock, paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

const press = (key: string, modifiers = 0) => {
  const codes = {
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    Backspace: 8,
    Delete: 46,
    Enter: 13
  };
  const control = key in codes;
  const code = control ? key : `Key${key.toUpperCase()}`;
  const windowsVirtualKeyCode = codes[key] ?? key.toUpperCase().charCodeAt(0);
  ['keyDown', 'keyUp'].forEach((type) => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type: control && key !== 'Enter' && type === 'keyDown' ? 'rawKeyDown' : type,
          key,
          code,
          windowsVirtualKeyCode,
          modifiers,
          ...((!control || key === 'Enter') && !modifiers && type === 'keyDown'
            ? { text: key === 'Enter' ? '\r' : key, unmodifiedText: key === 'Enter' ? '\r' : key }
            : {})
        }
      })
    );
  });
};

const expectCaret = (value: string, offset?: number) => {
  cy.window().should((win) => {
    expect(win.getSelection()?.anchorNode?.textContent).to.equal(value);
    if (offset !== undefined) expect(win.getSelection()?.anchorOffset).to.equal(offset);
  });
};

const pendingSelection = (first = paragraphWithText('First paragraph')) => {
  const sdk = createRichTextFakeSdk({
    initialValue: doc(first, paragraphWithText('Second paragraph'))
  });
  mountRichTextEditor({ sdk });
  const page = new RichTextPage();
  page.editor.findByText('Second paragraph').click();
  page.editor.type('{home}');
  // Hold Slate’s selection-update timer pending across native browser events.
  cy.clock();
  cy.tick(100);
  press('a');
  expectCaret('aSecond paragraph', 1);
  return page;
};

const finish = (page: RichTextPage, expected: Document) => {
  cy.tick(600);
  cy.clock().then((clock) => clock.restore());
  page.expectValue(expected);
};

describe('Rich text native caret under repeated editing', () => {
  afterEach(() => {
    cy.document().then((document) => {
      document.querySelector('[data-test-id=outside-editor]')?.remove();
    });
  });

  it('keeps every edit and caret through 50 rapid Up/Down reversals', () => {
    cy.viewport(2000, 900);
    const page = pendingSelection();
    page.editor.invoke('css', 'width', '1800px');
    const values = ['First paragraph', 'aSecond paragraph'];
    let offset: number;
    for (let repeat = 0; repeat < 50; repeat++) {
      const steps: [number, string, string][] = [
        [0, 'ArrowUp', 'x'],
        [1, 'ArrowDown', 'y']
      ];
      steps.forEach(([index, arrow, letter]) => {
        press(arrow);
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal(values[index]);
          offset = win.getSelection()!.anchorOffset;
        });
        cy.then(() => {
          values[index] = values[index].slice(0, offset) + letter + values[index].slice(offset);
        });
        press(letter);
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal(values[index]);
          expect(win.getSelection()?.anchorOffset).to.equal(offset + 1);
        });
      });
    }
    cy.tick(600);
    cy.clock().then((clock) => clock.restore());
    cy.then(() => page.expectValue(doc(...values.map(paragraphWithText))));
  });

  it('distinguishes identical paragraphs when the native caret moves before typing', () => {
    const page = pendingSelection(paragraphWithText('aSecond paragraph'));
    press('ArrowUp');
    expectCaret('aSecond paragraph', 1);
    press('b');
    expectCaret('abSecond paragraph', 2);
    finish(
      page,
      doc(paragraphWithText('abSecond paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('uses the visible caret for horizontal navigation immediately after Up', () => {
    const page = pendingSelection();
    press('ArrowUp');
    expectCaret('First paragraph', 1);
    press('ArrowLeft');
    expectCaret('First paragraph', 0);
    press('b');
    expectCaret('bFirst paragraph', 1);
    finish(
      page,
      doc(paragraphWithText('bFirst paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('backspaces in the destination paragraph while the previous selection update is pending', () => {
    const page = pendingSelection();
    press('ArrowUp');
    expectCaret('First paragraph', 1);
    press('Backspace');
    finish(page, doc(paragraphWithText('irst paragraph'), paragraphWithText('aSecond paragraph')));
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
    const page = pendingSelection();
    press('ArrowUp');
    expectCaret('First paragraph', 1);
    press('Delete');
    expectCaret('Frst paragraph', 1);
    finish(page, doc(paragraphWithText('Frst paragraph'), paragraphWithText('aSecond paragraph')));
  });

  it('replaces an expanded native selection after rapid vertical navigation', () => {
    const page = pendingSelection();
    press('ArrowUp');
    expectCaret('First paragraph', 1);
    press('ArrowRight', 8);
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal('First paragraph');
      expect(win.getSelection()?.toString()).to.equal('i');
    });
    press('b');
    expectCaret('Fbrst paragraph', 2);
    finish(page, doc(paragraphWithText('Fbrst paragraph'), paragraphWithText('aSecond paragraph')));
  });

  it('preserves bold and plain text when editing across a formatting boundary', () => {
    const first = block(
      BLOCKS.PARAGRAPH,
      {},
      text('First', [mark(MARKS.BOLD)]),
      text(' paragraph')
    );
    const page = pendingSelection(first);
    press('ArrowUp');
    expectCaret('First', 1);
    press('b');
    expectCaret('Fbirst', 2);
    for (let index = 0; index < 5; index++) press('ArrowRight');
    let offset: number;
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal(' paragraph');
      offset = win.getSelection()!.anchorOffset;
    });
    press('c');
    cy.tick(600);
    cy.clock().then((clock) => clock.restore());
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
    const page = pendingSelection();
    press('ArrowUp');
    press('b');
    expectCaret('Fbirst paragraph', 2);
    finish(
      page,
      doc(paragraphWithText('Fbirst paragraph'), paragraphWithText('aSecond paragraph'))
    );
    const modifier = Cypress.platform === 'darwin' ? 4 : 2;
    press('z', modifier);
    page.expectValue(
      doc(paragraphWithText('First paragraph'), paragraphWithText('aSecond paragraph'))
    );
    press('z', modifier | 8);
    page.expectValue(
      doc(paragraphWithText('Fbirst paragraph'), paragraphWithText('aSecond paragraph'))
    );
    expectCaret('Fbirst paragraph', 2);
  });

  it('commits IME text after Up without duplicating it or returning to the source paragraph', () => {
    const page = pendingSelection();
    press('ArrowUp');
    expectCaret('First paragraph', 1);
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
    expectCaret('F日本irst paragraph', 3);
    press('b');
    expectCaret('F日本birst paragraph', 4);
    finish(
      page,
      doc(paragraphWithText('F日本birst paragraph'), paragraphWithText('aSecond paragraph'))
    );
  });

  it('keeps editor content intact when typing into another focused input', () => {
    const page = pendingSelection();
    cy.window().then((win) => {
      const input = win.document.createElement('input');
      input.setAttribute('data-test-id', 'outside-editor');
      win.document.body.appendChild(input);
      input.focus();
    });
    press('x');
    cy.findByTestId('outside-editor')
      .should('have.value', 'x')
      .then(($input) => $input.remove());
    finish(page, doc(paragraphWithText('First paragraph'), paragraphWithText('aSecond paragraph')));
  });

  it('keeps a read-only editor unchanged under native arrow and text input', () => {
    const value = doc(paragraphWithText('First paragraph'), paragraphWithText('Second paragraph'));
    const sdk = createRichTextFakeSdk({ initialValue: value });
    mountRichTextEditor({ sdk, isInitiallyDisabled: true, isDisabled: true });
    const page = new RichTextPage();
    page.editor.should('have.attr', 'contenteditable', 'false').click({ force: true });
    for (let index = 0; index < 10; index++) {
      press('ArrowUp');
      press('x');
      press('ArrowDown');
      press('y');
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
        cy.clock();
        cy.tick(100);
        press(arrow);
        let offset: number;
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal('Body text');
          offset = win.getSelection()!.anchorOffset;
        });
        press(key);
        cy.tick(600);
        cy.clock().then((clock) => clock.restore());
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
        cy.clock();
        cy.tick(100);
        press('a');
        values[source] = `a${values[source]}`;
        press(arrow);
        expectCaret(values[target], 1);
        press('Enter', softBreak ? 8 : 0);
        if (softBreak) {
          expectCaret(values[target].slice(0, 1) + '\n' + values[target].slice(1), 2);
          values[target] = values[target].slice(0, 1) + '\nb' + values[target].slice(1);
        } else {
          expectCaret(values[target].slice(1), 0);
          values.splice(target, 1, values[target].slice(0, 1), `b${values[target].slice(1)}`);
        }
        press('b');
        finish(page, doc(...values.map(paragraphWithText)));
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
    cy.clock();
    cy.tick(100);
    // The first Enter leaves Slate's caret-update timer pending, as in the video.
    press('Enter');
    expectCaret(value, 0);
    press('ArrowDown');
    let offset: number;
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal(value);
      offset = win.getSelection()!.anchorOffset;
      expect(offset).to.be.greaterThan(0);
    });
    press('Enter');
    cy.then(() => expectCaret(value.slice(offset), 0));
    press('b');
    cy.tick(600);
    cy.clock().then((clock) => clock.restore());
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
