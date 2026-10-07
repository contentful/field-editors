import * as React from 'react';

import { BLOCKS } from '@contentful/rich-text-types';

import { RichTextEditor } from '../../../packages/rich-text/src';
import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { createRichTextFakeSdk } from '../../fixtures';
import { mount } from '../mount';
import {
  expectNativeCaret,
  pauseSelectionUpdates,
  pressNativeKey,
  resumeSelectionUpdates
} from './caretTestUtils';
import { paragraphWithText } from './helpers';
import { RichTextPage } from './RichTextPage';

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
              role="presentation"
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
              <RichTextEditor
                sdk={sdk}
                isInitiallyDisabled={false}
                withSelectionSync
                onAction={() => undefined}
              />
            </div>
          );
        };
        mount(<Host />);
        const page = new RichTextPage();
        page.editor.findByText('Main heading').click();
        page.editor.type('{home}');
        // Keep Slate's previous caret-update timer pending during native clicks.
        pauseSelectionUpdates();
        pressNativeKey('a');
        expectNativeCaret('aMain heading');
        page.editor.findByText('Sub heading').realClick({ x: 20, y: 10, scrollBehavior: false });
        page.editor
          .findByText('Body paragraph')
          .realClick({ x: 20, y: 10, scrollBehavior: false, clickCount });
        let expected: string;
        cy.then(() => {
          expect(offset, 'native mouse-up selected the paragraph').to.be.a('number');
          expect(selected).to.equal(['', 'Body', 'Body paragraph'][clickCount - 1]);
          expected =
            'Body paragraph'.slice(0, offset) +
            'x' +
            'Body paragraph'.slice(offset + selected.length);
        });
        cy.window().should((win) => {
          expect(win.getSelection()?.anchorNode?.textContent).to.equal('Body paragraph');
          expect(win.getSelection()?.toString()).to.equal(selected);
        });
        pressNativeKey('x');
        cy.then(() => expectNativeCaret(expected, offset + 1));
        resumeSelectionUpdates();
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
