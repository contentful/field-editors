import { PasteHtmlPlugin } from '.';
import { Value, Document, Block, Text, Editor } from 'slate';
import {
  document,
  block,
  inline,
  text,
  leaf,
  mark,
  emptyText,
  createPasteHtmlEvent,
  createPasteEvent,
} from './../shared/PasteTestHelpers';

import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';
import { List } from 'immutable';
import SchemaEs6 from '../../constants/Schema';

const emptyInitialValue = Value.create({
  document: Document.create({
    nodes: [
      Block.create({
        type: BLOCKS.PARAGRAPH,
        nodes: List([Text.create('')]),
      }),
    ],
  }),
});

describe('PasteHtml Plugin', () => {
  it('ignores raw text', () => {
    const event = createPasteEvent('text/plain', 'text');
    const editor = new Editor({ value: emptyInitialValue });
    const next = jest.fn();

    const result = PasteHtmlPlugin().onPaste(event, editor, next);

    expect(next).toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(editor.value.document.toJSON()).toEqual(emptyInitialValue.document.toJSON());
  });

  describe.each([
    ['supports bold', '<b>Text</b>', markDocFactory(MARKS.BOLD)],
    ['supports italic i', '<i>Text</i>', markDocFactory(MARKS.ITALIC)],
    ['supports italic em', '<em>Text</em>', markDocFactory(MARKS.ITALIC)],
    ['supports underline', '<u>Text</u>', markDocFactory(MARKS.UNDERLINE)],
    ['supports code', '<code>Text</code>', markDocFactory(MARKS.CODE)],
    ...[1, 2, 3, 4, 5, 6].map(headingTestDataFactory),
    [
      'supports anchor',
      '<a href="https://www.dict.cc/german-english/Herren.html">Herren</a>',
      document(
        {},
        block(
          BLOCKS.PARAGRAPH,
          {},
          emptyText(),
          inline(
            INLINES.HYPERLINK,
            {
              data: {
                uri: 'https://www.dict.cc/german-english/Herren.html',
              },
            },
            text({}, leaf('Herren'))
          ),
          emptyText()
        )
      ),
    ],
    [
      'ignores empty anchor',
      '<a>Herren</a>',
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('Herren')))),
    ],
    [
      'supports paragraph',
      `<p>Herren</p>`,
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('Herren')))),
    ],
    ['supports hr', `<hr />`, document({}, block(BLOCKS.HR, {}, emptyText()))],
    [
      'supports quote',
      `<meta charset='utf-8'><blockquote cite="https://www.huxley.net/bnw/four.html" ><p>Words can be like X-rays, if you use them properly – they'll go through anything. You read and you're pierced.</p></blockquote>`.trim(),
      document(
        {},
        block(BLOCKS.PARAGRAPH, {}, emptyText()),
        block(
          BLOCKS.QUOTE,
          {},
          block(
            BLOCKS.PARAGRAPH,
            {},
            text(
              {},
              leaf(
                `Words can be like X-rays, if you use them properly – they'll go through anything. You read and you're pierced.`
              )
            )
          )
        )
      ),
    ],
    ...listFactory(BLOCKS.OL_LIST),
    ...listFactory(BLOCKS.UL_LIST),
    [
      `handles not supported tag`,
      `<img src="/media/examples/frog.png" alt="Frog"/>`.trim(),
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('')))),
    ],
    [
      `handles not supported tag inside paragraph`,
      `<p><img src="/media/examples/frog.png" alt="Frog"/></p>`.trim(),
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('')))),
    ],
    [
      `handles unsupported root element`,
      `<dl><dd><em>HyperText Markup Language</em> describes the structure of the page and its contents.</dd></dl>`.trim(),
      document(
        {},
        block(
          BLOCKS.PARAGRAPH,
          {},
          text(
            {},
            leaf('HyperText Markup Language', mark(MARKS.ITALIC)),
            leaf(' describes the structure of the page and its contents.')
          )
        )
      ),
    ],
    [
      'removes Apple-interchange-newline',
      `<p>HyperText Markup Language</p><br class="Apple-interchange-newline" />`,
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('HyperText Markup Language')))),
    ],
    [
      'retains soft-break',
      `<p>HyperText Markup<br/>Language</p>`,
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('HyperText Markup\nLanguage')))),
    ],
    gDocFactory([
      'ignores wrapping b tag',
      `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d3549954-7fff-0957-0dd2-f2ae4a9fbb1c"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sehr geehrte Damen und Herren</span></p></b>`,
      document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('Sehr geehrte Damen und Herren')))),
    ]),
    gDocFactory([
      'bold',
      `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-f6273d47-7fff-a7ed-f53b-f11da8984a92"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sehr geehrte </span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Damen</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> und Herren</span></b>`,
      document(
        {},
        block(
          BLOCKS.PARAGRAPH,
          {},
          text({}, leaf('Sehr geehrte '), leaf('Damen', mark(MARKS.BOLD)), leaf(' und Herren'))
        )
      ),
    ]),
    gDocFactory([
      'italic',
      `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-63f57981-7fff-fb19-466c-7e0bd418b994"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sehr geehrte </span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Damen</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> und Herren</span></b>`,
      document(
        {},
        block(
          BLOCKS.PARAGRAPH,
          {},
          text({}, leaf('Sehr geehrte '), leaf('Damen', mark(MARKS.ITALIC)), leaf(' und Herren'))
        )
      ),
    ]),
    gDocFactory([
      'underline',
      `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-8d3c7835-7fff-da0f-38eb-1477ff1e7735"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sehr geehrte </span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Damen</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> und Herren</span></b>`,
      document(
        {},
        block(
          BLOCKS.PARAGRAPH,
          {},
          text({}, leaf('Sehr geehrte '), leaf('Damen', mark(MARKS.UNDERLINE)), leaf(' und Herren'))
        )
      ),
    ]),
    gDocFactory([
      'bold and italic',
      `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-829af27b-7fff-2bef-07b2-63bfb4244318"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sehr geehrte </span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Damen</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> und Herren</span></b>`,
      document(
        {},
        block(
          BLOCKS.PARAGRAPH,
          {},
          text(
            {},
            leaf('Sehr geehrte '),
            leaf('Damen', mark(MARKS.BOLD), mark(MARKS.ITALIC)),
            leaf(' und Herren')
          )
        )
      ),
    ]),
  ])('html parsing', (testName, html, expected) => {
    it(`${testName}`, () => {
      const event = createPasteHtmlEvent(html);
      const editor = new Editor({ value: emptyInitialValue, schema: SchemaEs6 });

      const next = jest.fn();
      const result = PasteHtmlPlugin().onPaste(event, editor, next);

      expect(result).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
      expect(editor.value.document.toJSON()).toEqual(expected);
    });
  });
});

function headingTestDataFactory(i) {
  return [
    `supports Heading ${i}`,
    `<h${i}>Heading ${i}</h${i}>`.trim(),
    document({}, block(BLOCKS[`HEADING_${i}`], {}, text({}, leaf(`Heading ${i}`)))),
  ];
}

function markDocFactory(markType) {
  return document({}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf(`Text`, mark(markType)))));
}

function listFactory(listType) {
  const htmlTag = listType === BLOCKS.UL_LIST ? 'ul' : 'ol';
  return [
    [
      `for ${htmlTag} wraps text in list item with paragraph`,
      `<meta charset='utf-8'><${htmlTag}><li>Mix flour, baking powder, sugar, and salt.</li></${htmlTag}>`.trim(),
      document(
        {},
        block(BLOCKS.PARAGRAPH, {}, emptyText()),
        block(
          listType,
          {},
          block(
            BLOCKS.LIST_ITEM,
            {},
            block(
              BLOCKS.PARAGRAPH,
              {},
              text({}, leaf('Mix flour, baking powder, sugar, and salt.'))
            )
          )
        )
      ),
    ],
    [
      `for ${htmlTag} preserves the child nodes of list items`,
      `<meta charset='utf-8'><${htmlTag}><li>Mix flour, baking powder, sugar, and salt.</li><li><hr /></li></${htmlTag}>`.trim(),
      document(
        {},
        block(BLOCKS.PARAGRAPH, {}, emptyText()),
        block(
          listType,
          {},
          block(
            BLOCKS.LIST_ITEM,
            {},
            block(
              BLOCKS.PARAGRAPH,
              {},
              text({}, leaf('Mix flour, baking powder, sugar, and salt.'))
            )
          ),
          block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.HR, {}, emptyText()))
        )
      ),
    ],
    [
      `for ${htmlTag} supports nested lists`,
      `<meta charset='utf-8'><ul style="color: rgb(51, 51, 51); font-family: sans-serif; font-size: 14.4px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-style: initial; text-decoration-color: initial;"><li style="list-style-type: circle;">Milk</li><li style="list-style-type: circle;">Cheese<ul><li style="list-style-type: square;">Blue cheese</li><li style="list-style-type: square;">Feta</li></ul></li></ul>`,
      document(
        {},
        block(BLOCKS.PARAGRAPH, {}, emptyText()),
        block(
          BLOCKS.UL_LIST,
          {},
          block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('Milk')))),
          block(
            BLOCKS.LIST_ITEM,
            {},
            block(BLOCKS.PARAGRAPH, {}, text({}, leaf('Cheese'))),
            block(
              BLOCKS.UL_LIST,
              {},
              block(
                BLOCKS.LIST_ITEM,
                {},
                block(BLOCKS.PARAGRAPH, {}, text({}, leaf('Blue cheese')))
              ),
              block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text({}, leaf('Feta'))))
            )
          )
        )
      ),
    ],
  ];
}

function gDocFactory(args) {
  const [title, ...rest] = args;
  return [`Google Docs: ${title}`, ...rest];
}
