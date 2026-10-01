import { document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

describe('Rich text caret during save', () => {
  it('keeps the browser caret when a save precedes the selectionchange event', () => {
    const sdk = createRichTextFakeSdk({
      initialValue: doc(paragraphWithText('First paragraph'), paragraphWithText('Second paragraph')),
    });
    mountRichTextEditor({ sdk });
    const richText = new RichTextPage();

    richText.editor.findByText('First paragraph').click();
    cy.clock();
    richText.editor.type('{end}!');
    cy.tick(100);

    richText.editor.findByText('Second paragraph').then(($paragraph) => {
      const node = $paragraph[0].firstChild!;
      const selection = node.ownerDocument!.getSelection()!;
      cy.clock().then((clock) => {
        // Browser selection changes synchronously; selectionchange is queued.
        // Make the pending save run in that gap, without relying on CPU speed.
        selection.collapse(node, 3);
        clock.tick(500);
        expect(sdk.field.getValue(), 'pending edit was saved').to.deep.equal(
          doc(paragraphWithText('First paragraph!'), paragraphWithText('Second paragraph')),
        );
      });
    });

    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal('Second paragraph');
      expect(win.getSelection()?.anchorOffset).to.equal(3);
    });
    cy.clock().then((clock) => clock.restore());
    cy.realType('x');
    richText.expectValue(
      doc(paragraphWithText('First paragraph!'), paragraphWithText('Secxond paragraph')),
    );

    // Skipping local save renders must still allow incoming content to render.
    cy.then(() => sdk.field.setValue(doc(paragraphWithText('Remote update'))));
    richText.editor.findByText('Remote update').should('be.visible');
  });
});
