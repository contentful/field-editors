import * as React from 'react';

import { createFakeFieldAPI } from '@contentful/field-editor-test-utils';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { document as doc } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';
import { mountRichTextEditor } from './utils';

describe('Rich Text selection', { viewportWidth: 1000, viewportHeight: 2000 }, () => {
  afterEach(() => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setCPUThrottlingRate',
        params: { rate: 1 }
      })
    );
  });

  it('preserves the caret and undo history when parent props are recreated', () => {
    const initialValue = doc(paragraphWithText('First paragraph'));
    const sdk = createRichTextFakeSdk({ initialValue });
    let rerenderParent: () => void;
    function Parent() {
      const [, setRevision] = React.useState(0);
      rerenderParent = () => setRevision((revision) => revision + 1);
      return React.createElement(RichTextEditor, {
        sdk,
        isInitiallyDisabled: false,
        restrictedMarks: [],
        onAction: () => undefined
      });
    }
    mount(React.createElement(Parent));
    const richText = new RichTextPage();
    let offset = 0;
    let editedText = '';
    richText.editor.findByText('First paragraph').realClick({ scrollBehavior: false });
    cy.window()
      .should((win) => {
        expect(win.getSelection()?.anchorNode?.textContent).to.equal('First paragraph');
      })
      .then((win) => {
        offset = win.getSelection()!.anchorOffset;
        editedText = 'First paragraph'.slice(0, offset) + 'X' + 'First paragraph'.slice(offset);
      });
    cy.realType('X');
    cy.wrap(sdk.field).should((field) => {
      expect(field.getValue()).to.deep.equal(doc(paragraphWithText(editedText)));
    });
    cy.then(() => rerenderParent());
    cy.window().should((win) => {
      expect(win.getSelection()?.anchorNode?.textContent).to.equal(editedText);
      expect(win.getSelection()?.anchorOffset).to.equal(offset + 1);
    });
    richText.toolbar.undo.click();
    cy.wrap(sdk.field).should((field) => expect(field.getValue()).to.deep.equal(initialValue));
  });

  it('inserts at the clicked paragraph while the CPU is throttled', () => {
    const paragraphs = Array.from({ length: 30 }, (_, i) => `Paragraph ${i}`);
    const sdk = createRichTextFakeSdk({ initialValue: doc(...paragraphs.map(paragraphWithText)) });
    mountRichTextEditor({ sdk });
    const richText = new RichTextPage();
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setCPUThrottlingRate',
        params: { rate: 6 }
      })
    );

    [24, 2, 16, 1].forEach((index) => {
      richText.editor
        .findByText(`Paragraph ${index}`, { exact: true })
        .realClick({ scrollBehavior: false });
      cy.window()
        .should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal(paragraphs[index]);
        })
        .then((win) => {
          const offset = win.getSelection()!.anchorOffset;
          paragraphs[index] =
            paragraphs[index].slice(0, offset) + 'x' + paragraphs[index].slice(offset);
        });
      cy.realType('x');
      cy.wrap(sdk.field).should((field) => {
        expect(field.getValue()).to.deep.equal(doc(...paragraphs.map(paragraphWithText)));
      });
    });
  });

  it('preserves the caret and avoids saving back an incoming field update', () => {
    const initialValue = doc(
      paragraphWithText('First paragraph'),
      paragraphWithText('Second paragraph')
    );
    const [field, events] = createFakeFieldAPI(undefined, initialValue);
    const sdk = createRichTextFakeSdk({ modifier: (sdk) => ({ ...sdk, field }) });
    const save = cy.spy(field, 'setValue');
    mountRichTextEditor({ sdk });
    const richText = new RichTextPage();
    let offset = 0;
    richText.editor.findByText('First paragraph').realClick({ scrollBehavior: false });
    cy.window()
      .should((win) => {
        expect(win.getSelection()?.anchorNode?.textContent).to.equal('First paragraph');
      })
      .then((win) => {
        offset = win.getSelection()!.anchorOffset;
      });

    const incoming = doc(
      paragraphWithText('First paragraph'),
      paragraphWithText('Changed remotely')
    );
    cy.then(() => events.emit('onValueChanged', incoming));
    richText.editor.findByText('Changed remotely').should('be.visible');
    cy.window().should((win) => {
      const selection = win.getSelection();
      expect(selection?.anchorNode?.textContent).to.equal('First paragraph');
      expect(selection?.anchorOffset).to.equal(offset);
    });
    // Observe the full outgoing debounce interval to catch update feedback loops.
    cy.wait(600);
    cy.then(() => expect(save).not.to.have.been.called);
    cy.realType('X');
    cy.wrap(field).should((field) => {
      expect(field.getValue()).to.deep.equal(
        doc(
          paragraphWithText(
            'First paragraph'.slice(0, offset) + 'X' + 'First paragraph'.slice(offset)
          ),
          paragraphWithText('Changed remotely')
        )
      );
    });
  });
});
