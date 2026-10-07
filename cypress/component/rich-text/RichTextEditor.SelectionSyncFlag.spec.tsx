import React, { useState } from 'react';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';

describe('Rich text selection sync flag', () => {
  it('preserves content, caret and undo history when the selection sync flag changes', () => {
    const sdk = createRichTextFakeSdk({ initialValue: doc(paragraphWithText('Body')) });
    const Host = () => {
      const [enabled, setEnabled] = useState(false);
      return (
        <>
          <button aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
            Toggle sync
          </button>
          <RichTextEditor sdk={sdk} isInitiallyDisabled={false} withSelectionSync={enabled} />
        </>
      );
    };
    mount(<Host />);
    const page = new RichTextPage();
    page.editor.type('{end}!');
    page.expectValue(doc(paragraphWithText('Body!')));

    for (const enabled of [true, false]) {
      page.editor.focus();
      cy.window().then((win) => {
        const { anchorNode, anchorOffset } = win.getSelection()!;
        // Update the prop without moving focus away from the editor.
        cy.contains('button', 'Toggle sync').trigger('click');
        cy.window().should((current) => {
          expect(current.getSelection()?.anchorNode).to.equal(anchorNode);
          expect(current.getSelection()?.anchorOffset).to.equal(anchorOffset);
        });
      });
      cy.contains('button', 'Toggle sync').should('have.attr', 'aria-pressed', String(enabled));
      page.expectValue(doc(paragraphWithText('Body!')));
      page.toolbar.undo.click();
      page.expectValue(doc(paragraphWithText('Body')));
      page.toolbar.redo.click();
      page.expectValue(doc(paragraphWithText('Body!')));
    }
  });
});
