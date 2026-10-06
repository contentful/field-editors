import React, { useState } from 'react';

import { BLOCKS, MARKS } from '@contentful/rich-text-types';

import { RichTextEditor } from '../../../packages/rich-text/src';
import {
  block,
  document as doc,
  mark,
  text
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';

const press = (key: string, modifiers = 0) => {
  const isArrow = key === 'ArrowUp';
  ['keyDown', 'keyUp'].forEach((type) => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type: isArrow && type === 'keyDown' ? 'rawKeyDown' : type,
          key,
          code: isArrow ? key : `Key${key.toUpperCase()}`,
          windowsVirtualKeyCode: isArrow ? 38 : key.toUpperCase().charCodeAt(0),
          modifiers,
          ...(!isArrow && !modifiers && type === 'keyDown' ? { text: key } : {})
        }
      })
    );
  });
};

describe('Rich text selection sync flag', () => {
  for (const enabled of [undefined, false, true]) {
    it(`uses the initial ${String(enabled)} flag after a prop change`, () => {
      const sdk = createRichTextFakeSdk({
        initialValue: doc(
          paragraphWithText('First paragraph'),
          paragraphWithText('Second paragraph')
        )
      });
      const Host = () => {
        const [withSelectionSync, setWithSelectionSync] = useState(enabled);
        return (
          <>
            <button onClick={() => setWithSelectionSync(!withSelectionSync)}>Toggle flag</button>
            <RichTextEditor
              sdk={sdk}
              isInitiallyDisabled={false}
              withSelectionSync={withSelectionSync}
            />
          </>
        );
      };
      mount(<Host />);
      // Plugin registration uses the initial flag. A later prop update must
      // neither replace the editor nor change its selection handling.
      cy.contains('button', 'Toggle flag').click();
      const page = new RichTextPage();
      page.editor.findByText('Second paragraph').click();
      page.editor.type('{home}');
      cy.clock();
      cy.tick(100);
      press('a');
      press('ArrowUp');
      cy.window().should((win) => {
        expect(win.getSelection()?.anchorNode?.textContent).to.equal('First paragraph');
        expect(win.getSelection()?.anchorOffset).to.equal(1);
      });
      press('b', Cypress.platform === 'darwin' ? 4 : 2);
      press('x');
      cy.tick(600);
      cy.clock().then((clock) => clock.restore());
      // Formatting before the pending selection update makes the disabled
      // control reproduce the old jump; enabling inserts at the visible caret.
      page.expectValue(
        enabled
          ? doc(
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('F'),
                text('x', [mark(MARKS.BOLD)]),
                text('irst paragraph')
              ),
              paragraphWithText('aSecond paragraph')
            )
          : doc(
              paragraphWithText('First paragraph'),
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('a'),
                text('x', [mark(MARKS.BOLD)]),
                text('Second paragraph')
              )
            )
      );
    });
  }

  it('preserves the caret, content and undo history when the flag prop changes', () => {
    const sdk = createRichTextFakeSdk({ initialValue: doc(paragraphWithText('Body')) });
    const Host = () => {
      const [enabled, setEnabled] = useState(false);
      return (
        <>
          <button onClick={() => setEnabled(!enabled)}>Sync {String(enabled)}</button>
          <RichTextEditor sdk={sdk} isInitiallyDisabled={false} withSelectionSync={enabled} />
        </>
      );
    };
    mount(<Host />);
    const page = new RichTextPage();
    page.editor.type('{end}!');
    page.expectValue(doc(paragraphWithText('Body!')));
    page.editor.then(($editor) => {
      const editorElement = $editor[0];
      for (const enabled of [false, true]) {
        page.editor.focus();
        cy.window().then((win) => {
          const { anchorNode, anchorOffset } = win.getSelection()!;
          // A flag update does not move focus to a button as a real click would.
          cy.contains('button', `Sync ${String(enabled)}`).trigger('click');
          cy.window().should((current) => {
            expect(current.getSelection()?.anchorNode).to.equal(anchorNode);
            expect(current.getSelection()?.anchorOffset).to.equal(anchorOffset);
          });
        });
        cy.contains('button', `Sync ${String(!enabled)}`).should('be.visible');
        page.editor.should(($current) => expect($current[0]).to.equal(editorElement));
        page.expectValue(doc(paragraphWithText('Body!')));
        page.toolbar.undo.click();
        page.expectValue(doc(paragraphWithText('Body')));
        page.toolbar.redo.click();
        page.expectValue(doc(paragraphWithText('Body!')));
      }
    });
  });
});
