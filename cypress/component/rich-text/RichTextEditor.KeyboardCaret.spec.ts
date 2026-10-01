import { document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
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
  cy.clock();
  cy.tick(100);

  const press = (key: string, code: string, windowsVirtualKeyCode: number, text?: string) => {
    ['keyDown', 'keyUp'].forEach((type) => {
      cy.then(() =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchKeyEvent',
          params: {
            type: key.startsWith('Arrow') && type === 'keyDown' ? 'rawKeyDown' : type,
            key,
            code,
            windowsVirtualKeyCode,
            ...(type === 'keyDown' && text ? { text, unmodifiedText: text } : {})
          }
        })
      );
    });
  };

  // Insertion at offset zero makes Slate render a new DOM caret. Keep its
  // selection-update timer pending while the next native keys arrive.
  press('a', 'KeyA', 65, 'a');
  paragraphs[source] = `a${paragraphs[source]}`;
  cy.window().should((win) => {
    expect(win.getSelection()?.anchorNode?.textContent).to.equal(paragraphs[source]);
    expect(win.getSelection()?.anchorOffset).to.equal(1);
  });
  press(key, key, key === 'ArrowUp' ? 38 : 40);
  let offset: number;
  cy.window().should((win) => {
    expect(win.getSelection()?.anchorNode?.textContent).to.equal(paragraphs[target]);
    offset = win.getSelection()!.anchorOffset;
  });
  cy.then(() => {
    paragraphs[target] =
      paragraphs[target].slice(0, offset) + 'b' + paragraphs[target].slice(offset);
  });
  press('b', 'KeyB', 66, 'b');
  cy.window().should((win) => {
    expect(win.getSelection()?.anchorNode?.textContent).to.equal(paragraphs[target]);
    expect(win.getSelection()?.anchorOffset).to.equal(offset + 1);
  });
  cy.tick(600);
  cy.clock().then((clock) => clock.restore());
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
