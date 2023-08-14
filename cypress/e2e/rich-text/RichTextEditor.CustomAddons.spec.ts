import { BLOCKS } from '@contentful/rich-text-types';
import { lipsumBlockID } from '@contentful/field-editor-rich-text/stories/editor/customAddons';

import { block, document as doc, text } from '../../../packages/rich-text/src/helpers/nodeFactory';
import { RichTextPage } from './RichTextPage';

describe('Rich Text Editor - Custom Addons', { viewportHeight: 2000 }, () => {
    let richText: RichTextPage;

    beforeEach(() => {
        cy.viewport(1000, 2000);
        richText = new RichTextPage();
        richText.visit('lipsum');
    });

    describe('toolbar', () => {
        // NOTE: We really just want to ensure that the button and component get registered and operate properly.
        //   As a result, these tests are pretty minimal, since we don't care about the specific functionality of the custom plugin.
        it('should be visible', () => {
            richText.customToolbar.toolbar.should('be.visible');
        });

        it('should contain lipsum button', () => {
            richText.customToolbar.lipsum.should('be.visible');
        });

        it('should insert component when clicked', () => {
            richText.editor.click().type('some text');

            richText.customToolbar.lipsum.click();

            const expectedValue = doc(
                block(BLOCKS.PARAGRAPH, {}, text('some text', [])),
                block(lipsumBlockID, {}, text('', [])),
                block(BLOCKS.PARAGRAPH, {}, text('', []))
            );

            richText.expectValue(expectedValue);
        });
    });
});
