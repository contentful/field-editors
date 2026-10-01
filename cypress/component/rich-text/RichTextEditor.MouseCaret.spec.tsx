import * as React from 'react';

import { BLOCKS } from '@contentful/rich-text-types';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';

const press = (key: string) => {
  ['keyDown', 'keyUp'].forEach((type) => {
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type,
          key,
          code: `Key${key.toUpperCase()}`,
          windowsVirtualKeyCode: key.toUpperCase().charCodeAt(0),
          ...(type === 'keyDown' ? { text: key } : {})
        }
      })
    );
  });
};

const heading = (type: BLOCKS, value: string) => block(type, {}, text(value));

describe(
  'Rich text mouse caret during host renders',
  { viewportWidth: 1000, viewportHeight: 900 },
  () => {
    for (const clickCount of [1, 2, 3]) {
      it(`edits the paragraph after heading clicks and a ${clickCount}-click selection`, () => {
        const sdk = createRichTextFakeSdk({
          initialValue: doc(
            heading(BLOCKS.HEADING_1, 'Main heading'),
            heading(BLOCKS.HEADING_2, 'Sub heading'),
            paragraphWithText('Body paragraph')
          )
        });
        let offset: number;
        let selected: string;
        const Host = () => {
          const [, render] = React.useReducer((count) => count + 1, 0);
          return (
            <div
              onMouseUp={(event) => {
                const selection = event.currentTarget.ownerDocument.getSelection();
                if (selection?.anchorNode?.textContent === 'Body paragraph') {
                  offset = selection.anchorOffset;
                  selected = selection.toString();
                }
                render();
              }}
            >
              {/* A host rerender can pass a new callback without changing editor content. */}
              <RichTextEditor sdk={sdk} isInitiallyDisabled={false} onAction={() => undefined} />
            </div>
          );
        };
        mount(<Host />);
        const page = new RichTextPage();
        page.editor.findByText('Main heading').click();
        page.editor.type('{home}');
        // Keep Slate's previous caret-update timer pending during native clicks.
        cy.clock();
        cy.tick(100);
        press('a');
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal('aMain heading');
        });
        page.editor.findByText('Sub heading').realClick({ x: 20, y: 10, scrollBehavior: false });
        page.editor
          .findByText('Body paragraph')
          .realClick({ x: 20, y: 10, scrollBehavior: false, clickCount });
        let expected: string;
        cy.then(() => {
          expect(offset, 'native mouse-up selected the paragraph').to.be.a('number');
          if (clickCount === 1) {
            expect(selected).to.equal('');
            expected = 'Body paragraph'.slice(0, offset) + 'x' + 'Body paragraph'.slice(offset);
          } else {
            expect(selected).to.equal(clickCount === 2 ? 'Body' : 'Body paragraph');
            expected = clickCount === 2 ? 'x paragraph' : 'x';
          }
        });
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal('Body paragraph');
          expect(win.getSelection()?.toString()).to.equal(selected);
        });
        press('x');
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal(expected);
          expect(win.getSelection()?.anchorOffset).to.equal(clickCount === 1 ? offset + 1 : 1);
        });
        cy.tick(600);
        cy.clock().then((clock) => clock.restore());
        cy.then(() => {
          page.expectValue(
            doc(
              heading(BLOCKS.HEADING_1, 'aMain heading'),
              heading(BLOCKS.HEADING_2, 'Sub heading'),
              paragraphWithText(expected)
            )
          );
        });
      });
    }
  }
);
