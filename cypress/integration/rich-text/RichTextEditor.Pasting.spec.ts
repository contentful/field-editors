import { expectRichTextFieldValue } from './utils';
import {
  block,
  document as doc,
  text,
  mark,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { BLOCKS, MARKS } from '@contentful/rich-text-types';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen
describe('Rich Text Editor', { viewportHeight: 2000 }, () => {
  let editor: () => Cypress.Chainable<any>;

  beforeEach(() => {
    cy.visit('/rich-text');
    const wrapper = () => cy.findByTestId('rich-text-editor-integration-test');
    editor = () => wrapper().find('[data-slate-editor=true]');
    wrapper().should('be.visible');
    editor().should('be.visible');
  });

  it('supports pasting of a simple list', () => {
    const expectedValue = doc(
      block(
        BLOCKS.UL_LIST,
        {},
        block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item #1'))),
        block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('item #2')))
      ),
      block(BLOCKS.PARAGRAPH, {}, text(''))
    );

    editor().click().paste({
      'text/html': '<ul><li>item #1</li><li>item #2</li></ul>',
    });

    expectRichTextFieldValue(expectedValue);
  });

  it(`accepts basic Google Doc`, () => {
    const bold = mark(MARKS.BOLD);
    const italic = mark(MARKS.ITALIC);
    const underline = mark(MARKS.UNDERLINE);
    const firstParagraph = block(
      BLOCKS.PARAGRAPH,
      {},
      text('Lorem ipsum '),
      text('dolor', [bold]),
      text(' sit amet, consectetur adipiscing elit. Integer '),
      text('consectetur', [italic]),
      text('.')
    );
    const secondParagraph = block(
      BLOCKS.PARAGRAPH,
      {},
      text('Lorem '),
      text('ipsum', [bold, italic, underline]),
      text(' dolor sit amet.')
    );
    const expectedValue = doc(
      block(BLOCKS.HEADING_1, {}, text('Heading 1')),
      firstParagraph,
      secondParagraph,
      block(BLOCKS.HEADING_2, {}, text('Heading 2')),
      block(
        BLOCKS.UL_LIST,
        {},
        block(
          BLOCKS.LIST_ITEM,
          {},
          block(BLOCKS.PARAGRAPH, {}, text('Lorem', [underline])),
          block(
            BLOCKS.OL_LIST,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('Ipsum'))),
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('Dolor')))
          )
        ),
        block(
          BLOCKS.LIST_ITEM,
          {},
          block(BLOCKS.PARAGRAPH, {}, text('Sit', [underline])),
          block(
            BLOCKS.OL_LIST,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('amet', [])))
          )
        )
      ),
      block(BLOCKS.HEADING_3, {}, text('Heading 3')),
      block(BLOCKS.PARAGRAPH, {}, text('Lorem ipsum dolor sit amet.')),
      block(BLOCKS.PARAGRAPH, {}, text(`\n`))
    );

    editor().click().paste({
      'text/plain':
        'Heading 1\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Integer consectetur.\nLorem ipsum dolor sit amet.\nHeading 2\nLorem\nIpsum\nDolor\nSit\namet\nHeading 3\nLorem ipsum dolor sit amet.\n',
      'text/html':
        '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d7dc231f-7fff-3927-43a8-208cc1e0a1fd"><h1 dir="ltr" style="line-height:1.38;margin-top:20pt;margin-bottom:6pt;"><span style="font-size:20pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 1</span></h1><p dir="ltr" style="line-height:1.38;text-align: justify;background-color:#ffffff;margin-top:0pt;margin-bottom:0pt;padding:0pt 0pt 11pt 0pt;"><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Lorem ipsum </span><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">dolor</span><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> sit amet, consectetur adipiscing elit. Integer </span><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">consectetur</span><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p><p dir="ltr" style="line-height:1.38;text-align: justify;background-color:#ffffff;margin-top:0pt;margin-bottom:0pt;padding:0pt 0pt 11pt 0pt;"><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Lorem </span><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:italic;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">ipsum</span><span style="font-size:10.5pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> dolor sit amet.</span></p><h2 dir="ltr" style="line-height:1.38;text-align: justify;background-color:#ffffff;margin-top:0pt;margin-bottom:11pt;padding:7pt 0pt 0pt 0pt;"><span style="font-size:16pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 2</span></h2><ul style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Lorem</span></p></li><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:lower-alpha;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Ipsum</span></p></li><li dir="ltr" style="list-style-type:lower-alpha;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Dolor</span></p></li></ol><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sit</span></p></li><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:lower-alpha;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">amet</span></p></li></ol></ul><h3 dir="ltr" style="line-height:1.38;text-align: justify;background-color:#ffffff;margin-top:16pt;margin-bottom:0pt;padding:0pt 0pt 11pt 0pt;"><span style="font-size:13.999999999999998pt;font-family:Arial;color:#434343;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 3</span></h3><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Lorem ipsum dolor sit amet.</span></p></b><br class="Apple-interchange-newline">',
    });

    expectRichTextFieldValue(expectedValue);
  });
});
