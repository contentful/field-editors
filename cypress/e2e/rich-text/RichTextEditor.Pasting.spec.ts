import { BLOCKS, MARKS, INLINES } from '@contentful/rich-text-types';

import {
  block,
  document as doc,
  text,
  inline,
  mark,
} from '../../../packages/rich-text/src/helpers/nodeFactory';
import { getIframeWindow } from '../../fixtures/utils';
import googleDocs from './document-mocks/googleDocs';
import msWordOnline from './document-mocks/msWordOnline';
import paragraphWithoutFormattings from './document-mocks/paragraphWithoutFormattings';
import pastingListItems from './document-mocks/pastingListItems';
import pastingListItemsConfersParent from './document-mocks/pastingListItemsConfersParent';
import tableAndTextFromMsWord from './fixtures/msWordOnline';
import { RichTextPage } from './RichTextPage';

// the sticky toolbar gets in the way of some of the tests, therefore
// we increase the viewport height to fit the whole page on the screen
describe(
  'Rich Text Editor',
  {
    viewportHeight: 2000,
    retries: 0,
  },
  () => {
    let richText: RichTextPage;

    beforeEach(() => {
      richText = new RichTextPage();
      richText.visit();
    });

    it('removes style tags', () => {
      richText.editor.click().paste({
        'text/html': `
            <style> p {background: white;}</style>
            <p>paste only this</p>`,
      });

      const expectedValue = doc(block('paragraph', {}, text('paste only this')));

      richText.expectValue(expectedValue);
    });

    describe('text', () => {
      it('supports pasting of links within text', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset=\'utf-8\'><span>Some text </span><a href="https://be.contentful.com" title="https://be.contentful.com" data-renderer-mark="true"><u data-renderer-mark="true">with link</u></a><span> and some more text</span><a href="https://be.contentful.com" title="https://be.contentful.com" data-renderer-mark="true"> <u data-renderer-mark="true">and another link</u></a><span> following.</span>',
        });

        const expectedValue = doc(
          block(
            'paragraph',
            {},
            text('Some text '),
            inline(
              'hyperlink',
              { uri: 'https://be.contentful.com' },
              text('with link', [mark('underline')])
            ),
            text(' and some more text'),
            inline(
              'hyperlink',
              { uri: 'https://be.contentful.com' },
              text(' '),
              text('and another link', [mark('underline')])
            ),
            text(' following.')
          )
        );

        richText.expectValue(expectedValue);
      });
      it('supports pasting of cross space links within text', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset=\'utf-8\'><div data-slate-node="element" data-slate-void="true" class="css-1mpluvt" data-entity-type="Contentful:Entry" data-entity-id="crn:contentful:::content:spaces/space-id/entries/example-entity-urn" draggable="true"><div data-slate-spacer="true" style="height: 0px; color: transparent; outline: none; position: absolute;" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMmVtYmVkZGVkLXJlc291cmNlLWJsb2NrJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQXRydWUlMkMlMjJkYXRhJTIyJTNBJTdCJTIydGFyZ2V0JTIyJTNBJTdCJTIyc3lzJTIyJTNBJTdCJTIydXJuJTIyJTNBJTIyY3JuJTNBY29udGVudGZ1bCUzQSUzQSUzQWNvbnRlbnQlM0FzcGFjZXMlMkZzcGFjZS1pZCUyRmVudHJpZXMlMkZleGFtcGxlLWVudGl0eS11cm4lMjIlMkMlMjJ0eXBlJTIyJTNBJTIyUmVzb3VyY2VMaW5rJTIyJTJDJTIybGlua1R5cGUlMjIlM0ElMjJDb250ZW50ZnVsJTNBRW50cnklMjIlN0QlN0QlN0QlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmVtYmVkZGVkLXJlc291cmNlLWlubGluZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJ1cm4lMjIlM0ElMjJjcm4lM0Fjb250ZW50ZnVsJTNBJTNBJTNBY29udGVudCUzQXNwYWNlcyUyRnNwYWNlLWlkJTJGZW50cmllcyUyRmV4YW1wbGUtZW50aXR5LXVybiUyMiUyQyUyMnR5cGUlMjIlM0ElMjJSZXNvdXJjZUxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkNvbnRlbnRmdWwlM0FFbnRyeSUyMiU3RCU3RCU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnJlc291cmNlLWh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJ1cm4lMjIlM0ElMjJjcm4lM0Fjb250ZW50ZnVsJTNBJTNBJTNBY29udGVudCUzQXNwYWNlcyUyRnNwYWNlLWlkJTJGZW50cmllcyUyRmV4YW1wbGUtZW50aXR5LXVybiUyMiUyQyUyMnR5cGUlMjIlM0ElMjJSZXNvdXJjZUxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkNvbnRlbnRmdWwlM0FFbnRyeSUyMiU3RCU3RCU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMnJlc291cmNlSHlwZXJsaW5rJTIyJTdEJTVEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCU3RCU1RA=="><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></div></div><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span><span data-slate-node="element" data-slate-inline="true" data-slate-void="true" class="css-eodypg" data-entity-type="Contentful:Entry" data-entity-id="crn:contentful:::content:spaces/space-id/entries/example-entity-urn" draggable="true"><span contenteditable="false" draggable="true"><span class="css-1nqn0g6"><article class="css-1wp1jwt" data-test-id="embedded-resource-inline" aria-describedby="tooltip_7246"><div class="css-1cjnmwb" data-card-part="wrapper"><button type="button" aria-label="Actions" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_1179" data-test-id="cf-ui-card-actions" class="css-t7r739"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"></path><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></span></button><div class="css-161cbg" data-card-part="content"><span class="css-1eadhne">The best article ever</span></div></div></article></span></span><span data-slate-spacer="true" style="height: 0px; color: transparent; outline: none; position: absolute;"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></span></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0"> </span></span></span></div><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span><span class="css-1wt9k1k"><a class="css-1k4k586" data-test-id="cf-ui-text-link" data-resource-link-type="Contentful:Entry" data-resource-link-urn="crn:contentful:::content:spaces/space-id/entries/example-entity-urn" aria-describedby="tooltip_1186"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">resourceHyperlink</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></div>',
        });

        const expectedValue = doc(
          block(BLOCKS.EMBEDDED_RESOURCE, {
            target: {
              sys: {
                urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
                type: 'ResourceLink',
                linkType: 'Contentful:Entry',
              },
            },
          }),
          block(
            BLOCKS.PARAGRAPH,
            {},
            text('', []),
            inline(INLINES.EMBEDDED_RESOURCE, {
              target: {
                sys: {
                  type: 'ResourceLink',
                  linkType: 'Contentful:Entry',
                  urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
                },
              },
            }),
            text('')
          ),
          block(
            BLOCKS.PARAGRAPH,
            {},
            text(''),
            inline(
              INLINES.RESOURCE_HYPERLINK,
              {
                target: {
                  sys: {
                    type: 'ResourceLink',
                    linkType: 'Contentful:Entry',
                    urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
                  },
                },
              },
              text('resourceHyperlink')
            ),
            text('')
          )
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('Lists', () => {
      it('supports pasting of a simple list', () => {
        richText.editor.click().paste({
          'text/html': '<ul><li>item #1</li><li>item #2</li></ul>',
        });

        const expectedValue = doc(
          block('paragraph', {}, text()),
          block(
            'unordered-list',
            {},
            block('list-item', {}, block('paragraph', {}, text('item #1'))),
            block('list-item', {}, block('paragraph', {}, text('item #2')))
          ),
          block('paragraph', {}, text())
        );

        richText.expectValue(expectedValue);
      });

      it('MS Word - does not remove space around link in list surrounded by text with background color', () => {
        richText.editor.click().paste({
          'text/plain': 'One list item \n\nA list item with a background colors ',
          'text/html':
            '<meta charset=\'utf-8\'><ul class="BulletListStyle1 SCXW103293938 BCX0" role="list" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; list-style-type: disc; font-family: verdana; color: rgb(0, 0, 0); font-size: 18px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><li data-leveltext="●" data-font="Symbol" data-listid="1" data-list-defn-props="{&quot;335552541&quot;:1,&quot;335559684&quot;:-2,&quot;335559685&quot;:720,&quot;335559991&quot;:360,&quot;469769226&quot;:&quot;Symbol&quot;,&quot;469769242&quot;:[8226],&quot;469777803&quot;:&quot;left&quot;,&quot;469777804&quot;:&quot;●&quot;}" aria-setsize="-1" data-aria-posinset="2" data-aria-level="1" role="listitem" class="OutlineElement Ltr SCXW103293938 BCX0" style="margin: 0px 0px 0px 24px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr; display: block; font-size: 11pt; font-family: Arial, Arial_MSFontService, sans-serif; vertical-align: baseline;"><p class="Paragraph SCXW103293938 BCX0" xml:lang="EN-US" lang="EN-US" paraid="571741902" paraeid="{33bf33aa-2b31-4c40-a709-649da2e0a90a}{221}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; white-space: pre-wrap; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="none" xml:lang="EN" lang="EN" class="TextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(34, 34, 34); font-size: 11pt; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif;"><span class="NormalTextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">One list item</span></span><span class="EOP SCXW103293938 BCX0" data-ccp-props="{&quot;134233117&quot;:false,&quot;134233118&quot;:false,&quot;201341983&quot;:0,&quot;335551550&quot;:1,&quot;335551620&quot;:1,&quot;335559685&quot;:720,&quot;335559737&quot;:0,&quot;335559738&quot;:0,&quot;335559739&quot;:0,&quot;335559740&quot;:276,&quot;335559991&quot;:360}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif; color: rgb(34, 34, 34);"> </span></p></li><li data-leveltext="●" data-font="Symbol" data-listid="1" data-list-defn-props="{&quot;335552541&quot;:1,&quot;335559684&quot;:-2,&quot;335559685&quot;:720,&quot;335559991&quot;:360,&quot;469769226&quot;:&quot;Symbol&quot;,&quot;469769242&quot;:[8226],&quot;469777803&quot;:&quot;left&quot;,&quot;469777804&quot;:&quot;●&quot;}" aria-setsize="-1" data-aria-posinset="3" data-aria-level="1" role="listitem" class="OutlineElement Ltr SCXW103293938 BCX0" style="margin: 0px 0px 0px 24px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr; display: block; font-size: 11pt; font-family: Arial, Arial_MSFontService, sans-serif; vertical-align: baseline;"><p class="Paragraph SCXW103293938 BCX0" xml:lang="EN-US" lang="EN-US" paraid="1888776521" paraeid="{2919134a-aaff-4fb5-82d7-44f6f6dc9a55}{234}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; white-space: pre-wrap; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="none" xml:lang="EN" lang="EN" class="TextRun Highlight SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; outline: transparent solid 1px; font-variant-ligatures: none !important; color: rgb(34, 34, 34); background-color: rgb(255, 255, 0); font-size: 11pt; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif;"><span class="NormalTextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">A list</span></span><span data-contrast="none" xml:lang="EN" lang="EN" class="TextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(34, 34, 34); font-size: 11pt; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif;"><span class="NormalTextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;"> </span></span><a class="Hyperlink SCXW103293938 BCX0" href="https://www.google.com/" target="_blank" rel="noreferrer noopener" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; cursor: text; text-decoration: none; color: inherit;"><span data-contrast="none" xml:lang="EN" lang="EN" class="TextRun Underlined SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(0, 0, 255); font-size: 11pt; text-decoration: underline; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif;"><span class="NormalTextRun SCXW103293938 BCX0" data-ccp-charstyle="Hyperlink" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">item</span></span></a><span data-contrast="none" xml:lang="EN" lang="EN" class="TextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(34, 34, 34); font-size: 11pt; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif;"><span class="NormalTextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;"> </span></span><span data-contrast="none" xml:lang="EN" lang="EN" class="TextRun Highlight SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; outline: transparent solid 1px; font-variant-ligatures: none !important; color: rgb(34, 34, 34); background-color: rgb(255, 255, 0); font-size: 11pt; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif;"><span class="NormalTextRun SCXW103293938 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">with a background colors</span></span><span class="EOP SCXW103293938 BCX0" data-ccp-props="{&quot;134233117&quot;:false,&quot;134233118&quot;:false,&quot;201341983&quot;:0,&quot;335551550&quot;:1,&quot;335551620&quot;:1,&quot;335559685&quot;:720,&quot;335559737&quot;:0,&quot;335559738&quot;:0,&quot;335559739&quot;:0,&quot;335559740&quot;:276,&quot;335559991&quot;:360}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 19.55px; font-family: Arial, Arial_EmbeddedFont, Arial_MSFontService, sans-serif; color: rgb(34, 34, 34);"> </span></p></li></ul>',
        });

        const expectedValue = doc(
          block('paragraph', {}, text()),
          block(
            'unordered-list',
            {},
            block('list-item', {}, block('paragraph', {}, text('One list item'))),
            block(
              'list-item',
              {},
              block(
                'paragraph',
                {},
                text('A list '),
                inline(
                  'hyperlink',
                  { uri: 'https://www.google.com/' },
                  text('item', [mark('underline')])
                ),
                text(' with a background colors')
              )
            )
          ),
          block('paragraph', {}, text())
        );

        richText.expectValue(expectedValue);
      });

      it('pastes texts inside lists', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.type('Hello ');

        richText.editor.paste({
          'text/plain': 'world!',
        });

        const expectedValue = doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('Hello world!')))
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('pastes elements inside links', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">This is a </span></span></span><span class="css-1wt9k1k"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" rel="noopener noreferrer" aria-describedby="tooltip_9004" href="https://example.com"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">link</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true"> and an inline entry: </span></span></span><span data-slate-node="element" data-slate-inline="true" data-slate-void="true" class="css-1dx5s2y" data-embedded-entity-inline-id="example-entity-id" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlRoaXMlMjBpcyUyMGElMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ1cmklMjIlM0ElMjJodHRwcyUzQSUyRiUyRmV4YW1wbGUuY29tJTIyJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIybGluayUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjBhbmQlMjBhbiUyMGlubGluZSUyMGVudHJ5JTNBJTIwJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmVtYmVkZGVkLWVudHJ5LWlubGluZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJpZCUyMiUzQSUyMmV4YW1wbGUtZW50aXR5LWlkJTIyJTJDJTIydHlwZSUyMiUzQSUyMkxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkVudHJ5JTIyJTdEJTdEJTdEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RA=="><span contenteditable="false" draggable="true"><article class="css-122osjo" data-test-id="embedded-entry-inline"><div class="css-1sz1u6f" data-card-part="wrapper"><button type="button" aria-label="Actions" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_8727" data-test-id="cf-ui-card-actions" class="css-2ulqgl"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"></path><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></span></button><div class="css-123a08z" data-card-part="content"><span class="css-1eadhne"><span>Example Content Type The best article ever</span></span></div></div></article></span><span data-slate-spacer="true" style="height: 0px; color: transparent; outline: none; position: absolute;"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></span></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span>',
        });

        const expectedValue = doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('This is a '),
                inline(INLINES.HYPERLINK, { uri: 'https://example.com' }, text('link')),
                text(' and an inline entry: '),
                inline(INLINES.EMBEDDED_ENTRY, {
                  target: {
                    sys: {
                      id: 'example-entity-id',
                      type: 'Link',
                      linkType: 'Entry',
                    },
                  },
                }),
                text('')
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });
      it('pastes cross space links inside lists', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">This is a </span></span></span><span class="css-1wt9k1k"><a class="css-1k4k586" data-test-id="cf-ui-text-link" data-resource-link-type="Contentful:Entry" data-resource-link-urn="crn:contentful:::content:spaces/space-id/entries/example-entity-urn" aria-describedby="tooltip_4346"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">resourceHyperlink</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true"> </span></span></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">and an inline resource link: </span></span></span><span data-slate-node="element" data-slate-inline="true" data-slate-void="true" class="css-eodypg" data-entity-type="Contentful:Entry" data-entity-id="crn:contentful:::content:spaces/space-id/entries/example-entity-urn" draggable="true" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlRoaXMlMjBpcyUyMGElMjAlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnJlc291cmNlLWh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJ1cm4lMjIlM0ElMjJjcm4lM0Fjb250ZW50ZnVsJTNBJTNBJTNBY29udGVudCUzQXNwYWNlcyUyRnNwYWNlLWlkJTJGZW50cmllcyUyRmV4YW1wbGUtZW50aXR5LXVybiUyMiUyQyUyMnR5cGUlMjIlM0ElMjJSZXNvdXJjZUxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkNvbnRlbnRmdWwlM0FFbnRyeSUyMiU3RCU3RCU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIyZGF0YSUyMiUzQSU3QiU3RCUyQyUyMnRleHQlMjIlM0ElMjJyZXNvdXJjZUh5cGVybGluayUyMiU3RCU1RCU3RCUyQyU3QiUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJ0ZXh0JTIyJTNBJTIyJTIwJTIyJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMmFuZCUyMGFuJTIwaW5saW5lJTIwcmVzb3VyY2UlMjBsaW5rJTNBJTIwJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmVtYmVkZGVkLXJlc291cmNlLWlubGluZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJ1cm4lMjIlM0ElMjJjcm4lM0Fjb250ZW50ZnVsJTNBJTNBJTNBY29udGVudCUzQXNwYWNlcyUyRnNwYWNlLWlkJTJGZW50cmllcyUyRmV4YW1wbGUtZW50aXR5LXVybiUyMiUyQyUyMnR5cGUlMjIlM0ElMjJSZXNvdXJjZUxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkNvbnRlbnRmdWwlM0FFbnRyeSUyMiU3RCU3RCU3RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlN0QlNUQ="><span contenteditable="false" draggable="true"><span class="css-1nqn0g6"><article class="css-1wp1jwt" data-test-id="embedded-resource-inline" aria-describedby="tooltip_763"><div class="css-1cjnmwb" data-card-part="wrapper"><button type="button" aria-label="Actions" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_3854" data-test-id="cf-ui-card-actions" class="css-t7r739"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"></path><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg></span></button><div class="css-161cbg" data-card-part="content"><span class="css-1eadhne">The best article ever</span></div></div></article></span></span><span data-slate-spacer="true" style="height: 0px; color: transparent; outline: none; position: absolute;"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span></span></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span>',
        });

        const expectedValue = doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('This is a '),
                inline(
                  INLINES.RESOURCE_HYPERLINK,
                  {
                    target: {
                      sys: {
                        urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
                        type: 'ResourceLink',
                        linkType: 'Contentful:Entry',
                      },
                    },
                  },
                  text('resourceHyperlink')
                ),
                text(' '),
                text('and an inline resource link: '),
                inline(INLINES.EMBEDDED_RESOURCE, {
                  target: {
                    sys: {
                      urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
                      type: 'ResourceLink',
                      linkType: 'Contentful:Entry',
                    },
                  },
                }),
                text('')
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('pastes list items as new lists inside lists', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.type('Hello');

        richText.editor.paste({
          'text/html':
            '<li data-slate-node="element" class="css-1eg5fk0"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">sub</span></span></span></div></li><li data-slate-node="element" class="css-1eg5fk0" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnVub3JkZXJlZC1saXN0JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIybGlzdC1pdGVtJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyc3ViJTIyJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmxpc3QtaXRlbSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIybGlzdCUyMiU3RCU1RCU3RCU1RCU3RCU1RCU3RCU1RA=="><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">list</span></span></span></div></li>',
        });

        richText.expectValue(pastingListItems);
      });

      it('confers the parent list type upon list items pasted within lists', () => {
        richText.editor.click();
        richText.toolbar.ol.click();

        richText.editor.type('Hello');

        richText.editor.paste({
          'text/html':
            '<li data-slate-node="element" class="css-1eg5fk0"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">sub</span></span></span></div></li><li data-slate-node="element" class="css-1eg5fk0" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnVub3JkZXJlZC1saXN0JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIybGlzdC1pdGVtJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyc3ViJTIyJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMmxpc3QtaXRlbSUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIybGlzdCUyMiU3RCU1RCU3RCU1RCU3RCU1RCU3RCU1RA=="><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">list</span></span></span></div></li>',
        });

        richText.expectValue(pastingListItemsConfersParent);
      });

      it('pastes orphaned list items as unordered lists', () => {
        richText.editor.click();

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Hello</span></span></span></div><ul data-slate-node="element" class="css-a9oioc"><li data-slate-node="element" class="css-h3rza2"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">world!</span></strong></span></span></div></li></ul></li><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0">\n</span></span></span></div>',
        });

        const expectedValue = doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('Hello')),
              block(
                BLOCKS.UL_LIST,
                {},
                block(
                  BLOCKS.LIST_ITEM,
                  {},
                  block(BLOCKS.PARAGRAPH, {}, text('world!', [mark(MARKS.BOLD)]))
                )
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      // TODO: test related to https://contentful.atlassian.net/browse/SHE-752
      // when a table is copied its structure is kept if pasted at a list entry level
      // only its text should be pasted instead.
      // Note that, in real scenarions, tables fragments contain the attribute "data-slate-fragment" differently from this test case,
      // which determines the table to keep its formatting. Therefore ensure the example html has that attribute
      it('pastes only the text content of other blocks', () => {
        richText.editor.click();
        richText.toolbar.ul.click();

        richText.editor.type('Item #1');

        richText.editor.paste({
          'text/html':
            '<meta charset=\'utf-8\'><tr data-slate-node="element" class="css-1uop5es"><th data-slate-node="element" class="css-cg2mfz"><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">Header 1</span></strong></span></span></div></th><th data-slate-node="element" class="css-cg2mfz"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_3199" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Header 2 (</span></span></span><span class="css-1wt9k1k"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" rel="noopener noreferrer" aria-describedby="tooltip_5239" href="https://example.com"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">with link</span></span></span></span></a></span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">)</span></span></span></div></th></tr><tr data-slate-node="element" class="css-1uop5es"><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_5758" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><strong data-slate-leaf="true" class="css-35ezg3"><span data-slate-string="true">Cell 1</span></strong></span></span></div></td><td data-slate-node="element" class="css-o8kig5"><button type="button" tabindex="-1" aria-label="Open table menu" aria-haspopup="menu" aria-expanded="false" aria-controls="menu_4160" data-test-id="cf-table-actions-button" class="css-194n435"><span class="css-k008qs"><svg class="css-1jrff5x" data-test-id="cf-ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"></path></svg></span></button><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">Cell 2</span></span></span></div></td></tr>',
        });

        const expectedValue = doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(
              BLOCKS.LIST_ITEM,
              {},
              block(BLOCKS.PARAGRAPH, {}, text('Item #1'), text('Header 1', [mark(MARKS.BOLD)])),
              block(
                BLOCKS.PARAGRAPH,
                {},
                text('Header 2 ('),
                inline(INLINES.HYPERLINK, { uri: 'https://example.com' }, text('with link')),
                text(')')
              ),
              block(BLOCKS.PARAGRAPH, {}, text('Cell 1', [mark(MARKS.BOLD)])),
              block(BLOCKS.PARAGRAPH, {}, text('Cell 2'))
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('pastes table & its inline elements correctly', () => {
        richText.editor.click();

        // What can I do with tables
        // __________________________________________________________________________________
        // | Property                             | Supported                               |
        // |--------------------------------------|-----------------------------------------|
        // | Adding and removing rows and columns | Yes                                     |
        // | Table header                         | Yes, for rows and columns               |
        // | Formatting options                   | Bold,italics,underline,code             |
        // | Hyperlinks                           | URL, asset and entry                    |
        // | Embed entries                        | Only inline entries [inline entry]      |
        // | Copy & paste from other documents    | Yes, Eg. Google Docs, Jira, Confluence  |
        //  --------------------------------------|-----------------------------------------
        //  <empty paragraph>
        //
        richText.editor.paste({
          'application/x-slate-fragment':
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMldoYXQlMjBjYW4lMjBJJTIwZG8lMjB3aXRoJTIwdGFibGVzJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZSUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWhlYWRlci1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyUHJvcGVydHklMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtaGVhZGVyLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJTdXBwb3J0ZWQlMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkFkZGluZyUyMGFuZCUyMHJlbW92aW5nJTIwcm93cyUyMGFuZCUyMGNvbHVtbnMlMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlllcyUyMiU3RCU1RCU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1yb3clMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyVGFibGUlMjBoZWFkZXIlMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlllcyUyQyUyMGZvciUyMHJvd3MlMjBhbmQlMjBjb2x1bW5zJTIyJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJGb3JtYXR0aW5nJTIwb3B0aW9ucyUyMiU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyQm9sZCUyMiUyQyUyMmJvbGQlMjIlM0F0cnVlJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyQyUyMiU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjJpdGFsaWNzJTIyJTJDJTIyaXRhbGljJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMkMlMjIlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIydW5kZXJsaW5lJTIyJTJDJTIydW5kZXJsaW5lJTIyJTNBdHJ1ZSU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMkMlMjIlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyY29kZSUyMiUyQyUyMmNvZGUlMjIlM0F0cnVlJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJIeXBlcmxpbmtzJTIyJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyaHlwZXJsaW5rJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnVyaSUyMiUzQSUyMmh0dHBzJTNBJTJGJTJGZ29vZ2xlLmNvbSUyMiU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlVSTCUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMkMlMjAlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyYXNzZXQtaHlwZXJsaW5rJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyQXNzZXQlMjIlN0QlN0QlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJhc3NldCUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjBhbmQlMjAlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyZW50cnktaHlwZXJsaW5rJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyRW50cnklMjIlN0QlN0QlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJlbnRyeSUyMiU3RCU1RCU3RCUyQyU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMkVtYmVkJTIwZW50cmllcyUyMiU3RCU1RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJ0YWJsZS1jZWxsJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyT25seSUyMGlubGluZSUyMGVudHJpZXMlMjAlMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyZW1iZWRkZWQtZW50cnktaW5saW5lJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyRW50cnklMjIlN0QlN0QlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVEJTdEJTVEJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLXJvdyUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlLWNlbGwlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJDb3B5JTIwJTI2JTIwcGFzdGUlMjBmcm9tJTIwb3RoZXIlMjBkb2N1bWVudHMlMjIlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMlllcy4lMjBFZy4lMjBHb29nbGUlMjBEb2NzJTJDJTIwSmlyYSUyQyUyMENvbmZsdWVuY2UlMjIlN0QlNUQlN0QlNUQlN0QlNUQlN0QlNUQlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE',
        });

        const expectedValue = doc(
          block('paragraph', {}, text('What can I do with tables')),
          block(
            'table',
            {},
            block(
              'table-row',
              {},
              block('table-header-cell', {}, block('paragraph', {}, text('Property'))),
              block('table-header-cell', {}, block('paragraph', {}, text('Supported')))
            ),
            block(
              'table-row',
              {},
              block(
                'table-cell',
                {},
                block('paragraph', {}, text('Adding and removing rows and columns'))
              ),
              block('table-cell', {}, block('paragraph', {}, text('Yes')))
            ),
            block(
              'table-row',
              {},
              block('table-cell', {}, block('paragraph', {}, text('Table header'))),
              block('table-cell', {}, block('paragraph', {}, text('Yes, for rows and columns')))
            ),
            block(
              'table-row',
              {},
              block('table-cell', {}, block('paragraph', {}, text('Formatting options'))),
              block(
                'table-cell',
                {},
                block(
                  'paragraph',
                  {},
                  text('Bold', [mark('bold')]),
                  text(','),
                  text('italics', [mark('italic')]),
                  text(','),
                  text('underline', [mark('underline')]),
                  text(','),
                  text('code', [mark('code')])
                )
              )
            ),
            block(
              'table-row',
              {},
              block('table-cell', {}, block('paragraph', {}, text('Hyperlinks'))),
              block(
                'table-cell',
                {},
                block(
                  'paragraph',
                  {},
                  text(''),
                  inline('hyperlink', { uri: 'https://google.com' }, text('URL')),
                  text(', '),
                  inline(
                    'asset-hyperlink',
                    {
                      target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Asset' } },
                    },
                    text('asset')
                  ),
                  text(' and '),
                  inline(
                    'entry-hyperlink',
                    {
                      target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Entry' } },
                    },
                    text('entry')
                  ),
                  text('')
                )
              )
            ),
            block(
              'table-row',
              {},
              block('table-cell', {}, block('paragraph', {}, text('Embed entries'))),
              block(
                'table-cell',
                {},
                block(
                  'paragraph',
                  {},
                  text('Only inline entries '),
                  inline('embedded-entry-inline', {
                    target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Entry' } },
                  }),
                  text('')
                )
              )
            ),
            block(
              'table-row',
              {},
              block(
                'table-cell',
                {},
                block('paragraph', {}, text('Copy & paste from other documents'))
              ),
              block(
                'table-cell',
                {},
                block('paragraph', {}, text('Yes. Eg. Google Docs, Jira, Confluence'))
              )
            )
          ),
          block('paragraph', {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('normalizes paragraphs in table cells correctly', () => {
        richText.editor.click();
        richText.editor.paste({
          'text/html':
            '<meta charset="utf-8"><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-7728c6fc-7fff-c78a-cca3-698830ce6bb7"><div dir="ltr" style="margin-left:0pt;" align="left"><table style="border:none;border-collapse:collapse;table-layout:fixed;width:468pt"><colgroup><col><col><col></colgroup><tbody><tr style="height:0pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><h1 dir="ltr" style="line-height:1.2;margin-top:20pt;margin-bottom:6pt;"><span style="font-size:20pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Field</span></h1></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><h2 dir="ltr" style="line-height:1.2;margin-top:18pt;margin-bottom:6pt;"><span style="font-size:16pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Type</span></h2></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:3pt;"><span style="font-size:26pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Description</span></p></td></tr></tbody></table></div></b>',
        });
        const expectedValue = doc(
          block(
            'table',
            {},
            block(
              'table-row',
              {},
              block('table-cell', {}, block('paragraph', {}, text('Field'))),
              block('table-cell', {}, block('paragraph', {}, text('Type'))),
              block('table-cell', {}, block('paragraph', {}, text('Description')))
            )
          ),
          block('paragraph', {}, text(''))
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('HR', () => {
      it('should paste from internal copying', () => {
        richText.editor.click().paste({
          'text/html': `<div data-void-element="hr"></div>`,
        });

        const expectedValue = doc(block('hr', {}), block('paragraph', {}, text('')));

        richText.expectValue(expectedValue);
      });

      it('should paste from external resources', () => {
        richText.editor.click().paste({
          'text/html': `<div><hr /></div>`,
        });

        const expectedValue = doc(block('hr', {}), block('paragraph', {}, text('')));

        richText.expectValue(expectedValue);
      });
    });

    describe('Tables', () => {
      it('Google Docs', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-3a5fc9fb-7fff-86fa-06f9-66bc9986ea50"><div dir="ltr" style="margin-left:0pt;" align="left"><table style="border:none;border-collapse:collapse;"><colgroup><col width="161" /><col width="112" /><col width="329" /></colgroup><tbody><tr style="height:38.25pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Field</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Type</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Description</span></p></td></tr><tr style="height:24.75pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">sys</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sys</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Common </span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">system</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> properties</span></p><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">system common&nbsp;</span></p><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">properties.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.title</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Text</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Title</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> of the asset.</span></p><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Title&nbsp;</span></p><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Of the</span></p><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">asset</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.description</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Text</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Description</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> of the asset.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.file</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">File</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">File</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">(s) of the asset.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.file.fileName</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Symbol</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:italic;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Original</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"> filename of the file.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.file.contentType</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Symbol</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Content type of the file.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.file.url</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Symbol</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">URL of the file.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.file.details</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Object</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Details of the file, depending on its MIME type.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">fields.file.details.size</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Number</span></p></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Size (in bytes) of the file.</span></p></td></tr><tr style="height:24pt"><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><br /></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><br /></td><td style="border-left:solid #666666 1pt;border-right:solid #666666 1pt;border-bottom:solid #666666 1pt;border-top:solid #666666 1pt;vertical-align:middle;background-color:#ffffff;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><br /></td></tr></tbody></table></div></b>',
        });

        richText.expectValue(googleDocs);
      });

      it('Google Docs - <table> around <div>', () => {
        richText.editor.click().paste({
          'text/html': `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-763ad9cc-7fff-b0f1-0964-6c720e552c72"><p dir="ltr" style="line-height:1.3776;background-color:#ffffff;margin-top:0pt;margin-bottom:69pt;padding:-33pt 0pt 0pt 0pt;"></p><div dir="ltr" style="margin-left:0pt;" align="left"><table style="border:none;border-collapse:collapse;table-layout:fixed;width:468pt"><colgroup><col /><col /></colgroup><tbody><tr style="height:24.75pt"><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Cell 1</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Cell 2</span></p></td></tr><tr style="height:0pt"><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Cell 3</span></p></td><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Cell 4</span></p></td></tr></tbody></table></div></b>`,
        });

        const expectedValue = doc(
          block(
            'table',
            {},
            block(
              'table-row',
              {},
              block('table-cell', {}, block('paragraph', {}, text('Cell 1'))),
              block('table-cell', {}, block('paragraph', {}, text('Cell 2')))
            ),
            block(
              'table-row',
              {},
              block('table-cell', {}, block('paragraph', {}, text('Cell 3'))),
              block('table-cell', {}, block('paragraph', {}, text('Cell 4')))
            )
          ),
          block('paragraph', {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('removes table wrappers when pasting a single cell', () => {
        richText.editor.click().paste({
          'application/x-slate-fragment':
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnRhYmxlJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtcm93JTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIydGFibGUtY2VsbCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMmNlbGwlMjBjb250ZW50JTIwd2l0aCUyMGElMjBsaW5rJTIwYW5kJTIwaW5saW5lJTIwZW50cnklMjIlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyZW1iZWRkZWQtZW50cnktaW5saW5lJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyRW50cnklMjIlN0QlN0QlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyLiUyMiU3RCU1RCU3RCU1RCU3RCU1RCU3RCU1RCU3RCU1RA==',
        });

        const expectedValue = doc(
          block(
            'paragraph',
            {},
            text('cell content with a link and inline entry'),
            inline(INLINES.EMBEDDED_ENTRY, {
              target: { sys: { id: 'example-entity-id', type: 'Link', linkType: 'Entry' } },
            }),
            text('.')
          )
        );

        richText.expectValue(expectedValue);
      });
      it('removes table wrappers when pasting a single cell for resource links', () => {
        richText.editor.click().paste({
          'application/x-slate-fragment':
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJDZWxsJTIwY29udGVudCUyMHdpdGglMjBhJTIwJTIyJTdEJTJDJTdCJTIydHlwZSUyMiUzQSUyMnJlc291cmNlLWh5cGVybGluayUyMiUyQyUyMmRhdGElMjIlM0ElN0IlMjJ0YXJnZXQlMjIlM0ElN0IlMjJzeXMlMjIlM0ElN0IlMjJ1cm4lMjIlM0ElMjJjcm4lM0Fjb250ZW50ZnVsJTNBJTNBJTNBY29udGVudCUzQXNwYWNlcyUyRnNwYWNlLWlkJTJGZW50cmllcyUyRmV4YW1wbGUtZW50aXR5LXVybiUyMiUyQyUyMnR5cGUlMjIlM0ElMjJSZXNvdXJjZUxpbmslMjIlMkMlMjJsaW5rVHlwZSUyMiUzQSUyMkNvbnRlbnRmdWwlM0FFbnRyeSUyMiU3RCU3RCU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMnJlc291cmNlSHlwZXJsaW5rJTIyJTdEJTVEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMGFuZCUyMGElMjByZXNvdXJjZSUyMGlubGluZSUyMCUzQSUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJlbWJlZGRlZC1yZXNvdXJjZS1pbmxpbmUlMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlMkMlMjJkYXRhJTIyJTNBJTdCJTIydGFyZ2V0JTIyJTNBJTdCJTIyc3lzJTIyJTNBJTdCJTIydXJuJTIyJTNBJTIyY3JuJTNBY29udGVudGZ1bCUzQSUzQSUzQWNvbnRlbnQlM0FzcGFjZXMlMkZzcGFjZS1pZCUyRmVudHJpZXMlMkZleGFtcGxlLWVudGl0eS11cm4lMjIlMkMlMjJ0eXBlJTIyJTNBJTIyUmVzb3VyY2VMaW5rJTIyJTJDJTIybGlua1R5cGUlMjIlM0ElMjJDb250ZW50ZnVsJTNBRW50cnklMjIlN0QlN0QlN0QlN0QlMkMlN0IlMjJ0ZXh0JTIyJTNBJTIyJTIyJTdEJTVEJTdEJTVE',
        });

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('')),
          block(
            BLOCKS.PARAGRAPH,
            {},
            text('Cell content with a '),
            inline(
              INLINES.RESOURCE_HYPERLINK,
              {
                target: {
                  sys: {
                    urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
                    type: 'ResourceLink',
                    linkType: 'Contentful:Entry',
                  },
                },
              },
              text('resourceHyperlink')
            ),
            text(' and a resource inline :'),
            inline(INLINES.EMBEDDED_RESOURCE, {
              target: {
                sys: {
                  urn: 'crn:contentful:::content:spaces/space-id/entries/example-entity-urn',
                  type: 'ResourceLink',
                  linkType: 'Contentful:Entry',
                },
              },
            }),
            text('')
          )
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('spreadsheets', () => {
      describe('removes empty columns/rows', () => {
        it('Google Sheets', () => {
          richText.editor.click().paste({
            'text/html':
              '<google-sheets-html-origin><style type="text/css"><!--td {border: 1px solid #ccc;}br {mso-data-placement:same-cell;}--></style><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col width="100"/><col width="100"/><col width="100"/><col width="100"/><col width="100"/><col width="100"/></colgroup><tbody><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Cell 1&quot;}">Cell 1</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;" data-sheets-value="{&quot;1&quot;:2,&quot;2&quot;:&quot;Cell 2&quot;}">Cell 2</td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr><tr style="height:21px;"><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td><td style="overflow:hidden;padding:2px 3px 2px 3px;vertical-align:bottom;"></td></tr></tbody></table>',
          });

          const expectedValue = doc(
            block(
              'table',
              {},
              block(
                'table-row',
                {},
                block('table-cell', {}, block('paragraph', {}, text('Cell 1'))),
                block('table-cell', {}, block('paragraph', {}, text('Cell 2')))
              )
            ),
            block('paragraph', {}, text(''))
          );

          richText.expectValue(expectedValue);
        });

        it('MS Excel', () => {
          richText.editor.click().paste({
            'text/html':
              "<div ccp_infra_version='3' ccp_infra_timestamp='1641327998326' ccp_infra_user_hash='4114474985' ccp_infra_copy_id='' data-ccp-timestamp='1641327998326'><html>\r\n\r\n<head>\r\n<meta http-equiv=Content-Type content=\"text/html; charset=utf-8\">\r\n<meta name=ProgId content=Excel.Sheet>\r\n<meta name=Generator content=\"Microsoft Excel 15\">\r\n<style>\r\ntable\r\n\t{mso-displayed-decimal-separator:\"\\,\";\r\n\tmso-displayed-thousand-separator:\"\\.\";}\r\ntr\r\n\t{mso-height-source:auto;}\r\ncol\r\n\t{mso-width-source:auto;}\r\ntd\r\n\t{padding-top:1px;\r\n\tpadding-right:1px;\r\n\tpadding-left:1px;\r\n\tmso-ignore:padding;\r\n\tcolor:black;\r\n\tfont-size:11.0pt;\r\n\tfont-weight:400;\r\n\tfont-style:normal;\r\n\ttext-decoration:none;\r\n\tfont-family:Calibri, sans-serif;\r\n\tmso-font-charset:0;\r\n\ttext-align:general;\r\n\tvertical-align:bottom;\r\n\tborder:none;\r\n\twhite-space:nowrap;\r\n\tmso-rotate:0;}\r\n</style>\r\n</head>\r\n\r\n<body link=\"#0563C1\" vlink=\"#954F72\">\r\n\r\n<table width=384 style='border-collapse:collapse;width:288pt'>\r\n<!--StartFragment-->\r\n <col width=64 style='width:48pt' span=6>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td width=64 height=20 style='width:48pt;height:15.0pt'>Cell 1</td>\r\n  <td width=64 style='width:48pt'></td>\r\n  <td width=64 style='width:48pt'>Cell 2</td>\r\n  <td width=64 style='width:48pt'></td>\r\n  <td width=64 style='width:48pt'></td>\r\n  <td width=64 style='width:48pt'></td>\r\n </tr>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td height=20 style='height:15.0pt'></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n </tr>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td height=20 style='height:15.0pt'></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n </tr>\r\n <tr height=20 style='height:15.0pt'>\r\n  <td height=20 style='height:15.0pt'></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n  <td></td>\r\n </tr>\r\n<!--EndFragment-->\r\n</table>\r\n\r\n</body>\r\n\r\n</html>\r\n</div>",
          });

          const expectedValue = doc(
            block(
              'table',
              {},
              block(
                'table-row',
                {},
                block('table-cell', {}, block('paragraph', {}, text('Cell 1'))),
                block('table-cell', {}, block('paragraph', {}, text('Cell 2')))
              )
            ),
            block('paragraph', {}, text(''))
          );

          richText.expectValue(expectedValue);
        });
      });
    });

    describe('Microsoft Word (.docx) deserialization', () => {
      it('paragraphs, marks and links', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset=\'utf-8\'><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">This is a<span> </span></span></span><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun MacChromeBold SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; -webkit-font-smoothing: antialiased; font-variant-ligatures: none !important; color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif; font-weight: bold;"><span class="NormalTextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">paragraph<span> </span></span></span><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(0, 0, 0); font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 11pt; font-style: italic; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">with<span> </span></span></span><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun Underlined SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration: underline; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">some</span></span><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;"><span> </span>marks and<span> </span></span></span><a class="Hyperlink SCXW35745285 BCX0" href="https://contentful.com/" target="_blank" rel="noreferrer noopener" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; cursor: text; font-family: &quot;Segoe UI&quot;, &quot;Segoe UI Web&quot;, Arial, Verdana, sans-serif; font-size: 12px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration: none; color: inherit;"><span data-contrast="none" xml:lang="EN-US" lang="EN-US" class="TextRun Underlined SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(5, 99, 193); font-size: 11pt; text-decoration: underline; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW35745285 BCX0" data-ccp-charstyle="Hyperlink" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">links</span></span></a><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun EmptyTextRun SCXW35745285 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"></span><span class="EOP SCXW35745285 BCX0" data-ccp-props="{&quot;201341983&quot;:0,&quot;335559739&quot;:160,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; color: rgb(0, 0, 0); font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span>',
        });

        const expectedValue = doc(
          block(
            'paragraph',
            {},
            text('This is a '),
            text('paragraph ', [mark('bold')]),
            text('with ', [mark('italic')]),
            text('some', [mark('underline')]),
            text(' marks and '),
            inline(
              'hyperlink',
              { uri: 'https://contentful.com/' },
              text('links', [mark('underline')])
            ),
            text(' ')
          )
        );

        richText.expectValue(expectedValue);
      });

      it('paragraphs with formattings', () => {
        richText.editor.click().paste({
          'text/html': `<html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
          xmlns="http://www.w3.org/TR/REC-html40">
          <body lang=DE style='tab-interval:35.4pt;word-wrap:break-word'>
          <!--StartFragment-->

          <p class=MsoNormal style='margin-bottom:7.5pt;line-height:18.0pt;mso-outline-level:
          2;background:white'><b><span style='font-size:18.0pt;font-family:"DauphinPlain",serif;
          mso-fareast-font-family:"Times New Roman";mso-bidi-font-family:"Times New Roman";
          color:black;mso-fareast-language:EN-GB'>What is Lorem Ipsum?<o:p></o:p></span></b></p>

          <p class=MsoNormal style='text-align:justify;background:white'><b><span
          style='font-size:10.5pt;font-family:"Open Sans",sans-serif;mso-fareast-font-family:
          "Times New Roman";color:black;mso-fareast-language:EN-GB'>Lorem Ipsum</span></b><span
          style='font-size:10.5pt;font-family:"Open Sans",sans-serif;mso-fareast-font-family:
          "Times New Roman";color:black;mso-fareast-language:EN-GB'>&nbsp;is simply dummy
          text of the printing and typesetting industry. Lorem Ipsum has been the
          industry's standard dummy text ever since the 1500s, when an unknown printer
          took a galley of type and scrambled it to make a type specimen book. It has
          survived not only five centuries, but also the leap into electronic
          typesetting, remaining essentially unchanged. <i>It was popularised in the
          1960s with the release of Letraset sheets containing Lorem Ipsum</i> <b>passages,
          and more recently with desktop publishing software like Aldus PageMaker
          including </b><u>versions of Lorem Ipsum.</u><o:p></o:p></span></p>

          <p class=MsoNormal><o:p>&nbsp;</o:p></p>

          <!--EndFragment-->
          </body>

          </html>`,
        });

        richText.expectValue(paragraphWithoutFormattings);
      });

      it('unordered list', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset=\'utf-8\'><div class="ListContainerWrapper SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; position: relative; color: rgb(0, 0, 0); font-family: Calibri, Calibri_MSFontService, sans-serif; font-size: 14.6667px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><ul class="BulletListStyle1 SCXW131097012 BCX0" role="list" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; list-style-type: disc; font-family: verdana;"><li data-leveltext="" data-font="Symbol" data-listid="1" aria-setsize="-1" data-aria-posinset="1" role="listitem" data-aria-level="1" class="OutlineElement Ltr  BCX0 SCXW131097012" style="margin: 0px 0px 0px 24px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr; display: block; font-size: 11pt; font-family: Calibri, Calibri_MSFontService, sans-serif; vertical-align: baseline;"><p class="Paragraph SCXW131097012 BCX0" xml:lang="EN-US" lang="EN-US" paraid="1400493943" paraeid="{86d4aaeb-c566-4c64-a4fa-b88b187e215f}{15}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">This</span></span><span class="EOP SCXW131097012 BCX0" data-ccp-props="{&quot;134233279&quot;:true,&quot;201341983&quot;:0,&quot;335559739&quot;:160,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span></p></li></ul></div><div class="ListContainerWrapper SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; position: relative; color: rgb(0, 0, 0); font-family: Calibri, Calibri_MSFontService, sans-serif; font-size: 14.6667px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><ul class="BulletListStyle2 SCXW131097012 BCX0" role="list" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; list-style-type: circle; font-family: verdana;"><li data-leveltext="o" data-font="Courier New" data-listid="1" aria-setsize="-1" data-aria-posinset="1" role="listitem" data-aria-level="2" class="OutlineElement Ltr  BCX0 SCXW131097012" style="margin: 0px 0px 0px 72px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr; display: block; font-size: 11pt; font-family: Calibri, Calibri_MSFontService, sans-serif; vertical-align: baseline;"><p class="Paragraph SCXW131097012 BCX0" xml:lang="EN-US" lang="EN-US" paraid="1614497803" paraeid="{86d4aaeb-c566-4c64-a4fa-b88b187e215f}{64}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">Is</span></span><span class="EOP SCXW131097012 BCX0" data-ccp-props="{&quot;134233279&quot;:true,&quot;201341983&quot;:0,&quot;335559739&quot;:160,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span></p></li></ul></div><div class="ListContainerWrapper SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; position: relative; color: rgb(0, 0, 0); font-family: Calibri, Calibri_MSFontService, sans-serif; font-size: 14.6667px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><ul class="BulletListStyle3 SCXW131097012 BCX0" role="list" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; list-style-type: square; font-family: verdana; font-size: 8pt;"><li data-leveltext="" data-font="Wingdings" data-listid="1" aria-setsize="-1" data-aria-posinset="1" role="listitem" data-aria-level="3" class="OutlineElement Ltr  BCX0 SCXW131097012" style="margin: 0px 0px 0px 120px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr; display: block; font-size: 11pt; font-family: Calibri, Calibri_MSFontService, sans-serif; vertical-align: baseline;"><p class="Paragraph SCXW131097012 BCX0" xml:lang="EN-US" lang="EN-US" paraid="206469907" paraeid="{86d4aaeb-c566-4c64-a4fa-b88b187e215f}{106}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW131097012 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">A list</span></span><span class="EOP SCXW131097012 BCX0" data-ccp-props="{&quot;134233279&quot;:true,&quot;201341983&quot;:0,&quot;335559739&quot;:160,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span></p></li></ul></div>',
        });

        const expectedValue = doc(
          block(
            BLOCKS.UL_LIST,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('This'))),
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('Is'))),
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('A list')))
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('ordered list', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset=\'utf-8\'><div class="ListContainerWrapper SCXW91513133 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; position: relative; color: rgb(0, 0, 0); font-family: Calibri, Calibri_MSFontService, sans-serif; font-size: 14.6667px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><ol class="NumberListStyle1 SCXW91513133 BCX0" role="list" start="1" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; list-style-type: decimal;"><li data-leveltext="%1." data-font="Calibri" data-listid="2" aria-setsize="-1" data-aria-posinset="1" role="listitem" data-aria-level="1" class="OutlineElement Ltr  BCX0 SCXW91513133" style="margin: 0px 0px 0px 24px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr; display: block; font-size: 11pt; font-family: Calibri, Calibri_MSFontService, sans-serif; vertical-align: baseline;"><p class="Paragraph SCXW91513133 BCX0" xml:lang="EN-US" lang="EN-US" paraid="1179540675" paraeid="{86d4aaeb-c566-4c64-a4fa-b88b187e215f}{245}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW91513133 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW91513133 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">This is</span></span><span class="EOP SCXW91513133 BCX0" data-ccp-props="{&quot;134233279&quot;:true,&quot;201341983&quot;:0,&quot;335559739&quot;:160,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span></p></li></ol></div><div class="ListContainerWrapper SCXW91513133 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; position: relative; color: rgb(0, 0, 0); font-family: Calibri, Calibri_MSFontService, sans-serif; font-size: 14.6667px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><ol class="NumberListStyle2 SCXW91513133 BCX0" role="list" start="1" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; list-style-type: lower-alpha;"><li data-leveltext="%2." data-font="Calibri" data-listid="2" aria-setsize="-1" data-aria-posinset="1" role="listitem" data-aria-level="2" class="OutlineElement Ltr  BCX0 SCXW91513133" style="margin: 0px 0px 0px 72px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr; display: block; font-size: 11pt; font-family: Calibri, Calibri_MSFontService, sans-serif; vertical-align: baseline;"><p class="Paragraph SCXW91513133 BCX0" xml:lang="EN-US" lang="EN-US" paraid="496335205" paraeid="{b90c08e7-46ab-48c8-92b7-bdeb1c7ad344}{54}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW91513133 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW91513133 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">An ordered list</span></span><span class="EOP SCXW91513133 BCX0" data-ccp-props="{&quot;134233279&quot;:true,&quot;201341983&quot;:0,&quot;335559739&quot;:160,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span></p></li></ol></div>',
        });

        const expectedValue = doc(
          block(
            BLOCKS.OL_LIST,
            {},
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('This is'))),
            block(BLOCKS.LIST_ITEM, {}, block(BLOCKS.PARAGRAPH, {}, text('An ordered list')))
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('tables', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset=\'utf-8\'><table class="Table  Ltr TableGrid BorderColorBlack TransparentBackgroundColor TableWordWrap SCXW32171913 BCX0" border="1" data-tablestyle="MsoTableGrid" data-tablelook="1696" aria-rowcount="1" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; table-layout: fixed; width: 0px; overflow: visible; border-collapse: collapse; empty-cells: show; position: relative; color: rgb(0, 0, 0); font-family: &quot;Segoe UI&quot;, &quot;Segoe UI Web&quot;, Arial, Verdana, sans-serif; font-size: 12px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background: transparent; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; border-spacing: 0px;"><tbody class="SCXW32171913 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;"><tr class="TableRow SCXW32171913 BCX0" role="row" aria-rowindex="1" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; height: 0px;"><td class="FirstRow FirstCol LastRow SCXW32171913 BCX0" role="rowheader" data-celllook="0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; vertical-align: top; overflow: visible; background-color: transparent; border-color: var(--clrTableBlack,#000000); border-width: 1px; border-style: solid; width: 208px;"><div class="TableCellContent SCXW32171913 BCX0" style="margin: 0px; padding: 0px 7px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible;"><div class="OutlineElement Ltr  BCX0 SCXW32171913" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr;"><p class="Paragraph SCXW32171913 BCX0" xml:lang="EN-US" lang="EN-US" paraid="243520039" paraeid="{4efaadf3-cfb0-4e44-a683-865e57d4714e}{197}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun SCXW32171913 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-variant-ligatures: none !important; font-size: 11pt; font-style: italic; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"><span class="NormalTextRun SCXW32171913 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">This is some</span></span><span class="EOP SCXW32171913 BCX0" data-ccp-props="{&quot;201341983&quot;:0,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span></p></div></div></td> <td class="FirstRow LastCol LastRow SCXW32171913 BCX0" role="columnheader" data-celllook="0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; vertical-align: top; overflow: visible; background-color: transparent; border-color: var(--clrTableBlack,#000000); border-width: 1px 1px 1px 0px; border-style: solid solid solid none; width: 208px;"><div class="TableCellContent SCXW32171913 BCX0" style="margin: 0px; padding: 0px 7px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible;"><div class="OutlineElement Ltr  BCX0 SCXW32171913" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow: visible; cursor: text; clear: both; position: relative; direction: ltr;"><p class="Paragraph SCXW32171913 BCX0" xml:lang="EN-US" lang="EN-US" paraid="2061326778" paraeid="{4efaadf3-cfb0-4e44-a683-865e57d4714e}{203}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; overflow-wrap: break-word; font-weight: normal; font-style: normal; vertical-align: baseline; font-kerning: none; background-color: transparent; color: windowtext; text-align: left; text-indent: 0px;"><span data-contrast="auto" xml:lang="EN-US" lang="EN-US" class="TextRun Underlined MacChromeBold SCXW32171913 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; -webkit-font-smoothing: antialiased; font-variant-ligatures: none !important; font-size: 11pt; text-decoration: underline; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif; font-weight: bold;"><span class="NormalTextRun SCXW32171913 BCX0" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent;">Content on tables</span></span><span class="EOP SCXW32171913 BCX0" data-ccp-props="{&quot;201341983&quot;:0,&quot;335559740&quot;:259}" style="margin: 0px; padding: 0px; user-select: text; -webkit-user-drag: none; -webkit-tap-highlight-color: transparent; font-size: 11pt; line-height: 18.3458px; font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;"> </span></p></div></div> </td></tr></tbody></table>',
        });

        const expectedValue = doc(
          block(
            BLOCKS.TABLE,
            {},
            block(
              BLOCKS.TABLE_ROW,
              {},
              block(
                BLOCKS.TABLE_CELL,
                {},
                block(BLOCKS.PARAGRAPH, {}, text('This is some', [{ type: MARKS.ITALIC }]))
              ),
              block(
                BLOCKS.TABLE_CELL,
                {},
                block(
                  BLOCKS.PARAGRAPH,
                  {},
                  text('Content on tables', [{ type: MARKS.UNDERLINE }, { type: MARKS.BOLD }])
                )
              )
            )
          ),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it('text and tables from ms word online', () => {
        richText.editor.click().paste({
          'text/html': tableAndTextFromMsWord,
        });

        richText.expectValue(msWordOnline);
      });
    });

    describe('Basic marks', () => {
      it('works when pasting from another RT editor', () => {
        // A simple "hello world" text with marks: bold, italic, underline
        // and code. Copied from the RT editor
        richText.editor.click().paste({
          'text/html':
            '<span data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMmhlbGxvJTIwd29ybGQlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyYm9sZCUyMiUzQXRydWUlMkMlMjJpdGFsaWMlMjIlM0F0cnVlJTJDJTIydW5kZXJsaW5lJTIyJTNBdHJ1ZSUyQyUyMmNvZGUlMjIlM0F0cnVlJTdEJTVEJTJDJTIyaXNWb2lkJTIyJTNBZmFsc2UlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTVE" style="white-space: pre;">hello world</span>',
          'text/plain': 'hello world',
          'application/x-slate-fragment':
            'JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMmhlbGxvJTIwd29ybGQlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyYm9sZCUyMiUzQXRydWUlMkMlMjJpdGFsaWMlMjIlM0F0cnVlJTJDJTIydW5kZXJsaW5lJTIyJTNBdHJ1ZSUyQyUyMmNvZGUlMjIlM0F0cnVlJTdEJTVEJTJDJTIyaXNWb2lkJTIyJTNBZmFsc2UlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTVE',
        });

        const expectedValue = doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            text('hello world', [
              { type: MARKS.BOLD },
              { type: MARKS.ITALIC },
              { type: MARKS.UNDERLINE },
              { type: MARKS.CODE },
            ])
          )
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('Superscript and subscript marks', () => {
      it('works when pasting subscript and superscript from a google doc', () => {
        // A simple "hello world" text with marks: superscript and subscript.
        // Copied from a google doc
        richText.editor.click().paste({
          'text/plain': 'HelloWorld',
          'text/html':
            '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d846cac1-7fff-6b53-5ddb-bef1e002bcd8"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"><span style="font-size:0.6em;vertical-align:super;">Hello</span></span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"><span style="font-size:0.6em;vertical-align:sub;">World</span></span></b>',
          'application/x-vnd.google-docs-document-slice-clip+wrapped':
            '{"dih":3014089275,"data":"{\\"resolved\\":{\\"dsl_spacers\\":\\"HelloWorld\\",\\"dsl_styleslices\\":[{\\"stsl_type\\":\\"autogen\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"cell\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"code_snippet\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"collapsed_heading\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"column_sector\\",\\"stsl_leading\\":{\\"css_cols\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"css_lb\\":false,\\"css_ltr\\":true,\\"css_st\\":\\"continuous\\",\\"css_mb\\":null,\\"css_mh\\":null,\\"css_mf\\":null,\\"css_ml\\":null,\\"css_mr\\":null,\\"css_mt\\":null,\\"css_fi\\":null,\\"css_hi\\":null,\\"css_epfi\\":null,\\"css_ephi\\":null,\\"css_fpfi\\":null,\\"css_fphi\\":null,\\"css_ufphf\\":null,\\"css_pnsi\\":null,\\"css_fpo\\":null},\\"stsl_leadingType\\":\\"column_sector\\",\\"stsl_trailing\\":{\\"css_cols\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"css_lb\\":false,\\"css_ltr\\":true,\\"css_st\\":\\"continuous\\",\\"css_mb\\":null,\\"css_mh\\":null,\\"css_mf\\":null,\\"css_ml\\":null,\\"css_mr\\":null,\\"css_mt\\":null,\\"css_fi\\":null,\\"css_hi\\":null,\\"css_epfi\\":null,\\"css_ephi\\":null,\\"css_fpfi\\":null,\\"css_fphi\\":null,\\"css_ufphf\\":null,\\"css_pnsi\\":null,\\"css_fpo\\":null},\\"stsl_trailingType\\":\\"column_sector\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"comment\\",\\"stsl_styles\\":[{\\"cs_cids\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"doco_anchor\\",\\"stsl_styles\\":[{\\"das_a\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"document\\",\\"stsl_leading\\":{\\"ds_b\\":{\\"bg_c2\\":{\\"clr_type\\":0,\\"hclr_color\\":null}},\\"ds_df\\":{\\"df_dm\\":0},\\"ds_fi\\":null,\\"ds_hi\\":null,\\"ds_epfi\\":null,\\"ds_ephi\\":null,\\"ds_uephf\\":false,\\"ds_fpfi\\":null,\\"ds_fphi\\":null,\\"ds_ufphf\\":false,\\"ds_pnsi\\":1,\\"ds_mb\\":72,\\"ds_ml\\":72,\\"ds_mr\\":72,\\"ds_mt\\":72,\\"ds_ph\\":792,\\"ds_pw\\":612,\\"ds_rtd\\":\\"\\",\\"ds_mh\\":36,\\"ds_mf\\":36,\\"ds_ulhfl\\":false,\\"ds_lhs\\":1,\\"ds_fpo\\":false},\\"stsl_leadingType\\":\\"document\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"equation\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"equation_function\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"field\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"footnote\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"headings\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"horizontal_rule\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"ignore_spellcheck\\",\\"stsl_styles\\":[{\\"isc_osh\\":null}]},{\\"stsl_type\\":\\"import_warnings\\",\\"stsl_styles\\":[{\\"iws_iwids\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"language\\",\\"stsl_trailing\\":{\\"lgs_l\\":\\"en\\"},\\"stsl_trailingType\\":\\"language\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"link\\",\\"stsl_styles\\":[{\\"lnks_link\\":null}]},{\\"stsl_type\\":\\"list\\",\\"stsl_trailing\\":{\\"ls_nest\\":0,\\"ls_id\\":null,\\"ls_c\\":null,\\"ls_ts\\":{\\"ts_bd\\":false,\\"ts_fs\\":11,\\"ts_ff\\":\\"Arial\\",\\"ts_it\\":false,\\"ts_sc\\":false,\\"ts_st\\":false,\\"ts_tw\\":400,\\"ts_un\\":false,\\"ts_va\\":\\"nor\\",\\"ts_bgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":null},\\"ts_fgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":\\"#000000\\"},\\"ts_bd_i\\":false,\\"ts_fs_i\\":false,\\"ts_ff_i\\":false,\\"ts_it_i\\":false,\\"ts_sc_i\\":false,\\"ts_st_i\\":false,\\"ts_un_i\\":false,\\"ts_va_i\\":false,\\"ts_bgc2_i\\":false,\\"ts_fgc2_i\\":false}},\\"stsl_trailingType\\":\\"list\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"named_range\\",\\"stsl_styles\\":[{\\"nrs_ei\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"paragraph\\",\\"stsl_trailing\\":{\\"ps_al\\":0,\\"ps_awao\\":true,\\"ps_sd\\":null,\\"ps_bbtw\\":null,\\"ps_bb\\":null,\\"ps_bl\\":null,\\"ps_br\\":null,\\"ps_bt\\":null,\\"ps_hd\\":0,\\"ps_hdid\\":\\"\\",\\"ps_ifl\\":0,\\"ps_il\\":0,\\"ps_ir\\":0,\\"ps_klt\\":false,\\"ps_kwn\\":false,\\"ps_ltr\\":true,\\"ps_ls\\":1.15,\\"ps_lslm\\":1,\\"ps_pbb\\":false,\\"ps_sm\\":0,\\"ps_sa\\":0,\\"ps_sb\\":0,\\"ps_al_i\\":false,\\"ps_awao_i\\":false,\\"ps_sd_i\\":false,\\"ps_bbtw_i\\":false,\\"ps_bb_i\\":false,\\"ps_bl_i\\":false,\\"ps_br_i\\":false,\\"ps_bt_i\\":false,\\"ps_ifl_i\\":false,\\"ps_il_i\\":false,\\"ps_ir_i\\":false,\\"ps_klt_i\\":false,\\"ps_kwn_i\\":false,\\"ps_ls_i\\":false,\\"ps_lslm_i\\":false,\\"ps_pbb_i\\":false,\\"ps_rd\\":\\"\\",\\"ps_sm_i\\":false,\\"ps_sa_i\\":false,\\"ps_sb_i\\":false,\\"ps_shd\\":false,\\"ps_ts\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}},\\"stsl_trailingType\\":\\"paragraph\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"row\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"suppress_feature\\",\\"stsl_styles\\":[{\\"sfs_sst\\":false}]},{\\"stsl_type\\":\\"tbl\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"text\\",\\"stsl_styles\\":[{\\"ts_bd\\":false,\\"ts_fs\\":11,\\"ts_ff\\":\\"Arial\\",\\"ts_it\\":false,\\"ts_sc\\":false,\\"ts_st\\":false,\\"ts_tw\\":400,\\"ts_un\\":false,\\"ts_va\\":\\"sup\\",\\"ts_bgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":null},\\"ts_fgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":\\"#000000\\"},\\"ts_bd_i\\":false,\\"ts_fs_i\\":false,\\"ts_ff_i\\":false,\\"ts_it_i\\":false,\\"ts_sc_i\\":false,\\"ts_st_i\\":false,\\"ts_un_i\\":false,\\"ts_va_i\\":false,\\"ts_bgc2_i\\":false,\\"ts_fgc2_i\\":false},null,null,null,null,{\\"ts_bd\\":false,\\"ts_fs\\":11,\\"ts_ff\\":\\"Arial\\",\\"ts_it\\":false,\\"ts_sc\\":false,\\"ts_st\\":false,\\"ts_tw\\":400,\\"ts_un\\":false,\\"ts_va\\":\\"sub\\",\\"ts_bgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":null},\\"ts_fgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":\\"#000000\\"},\\"ts_bd_i\\":false,\\"ts_fs_i\\":false,\\"ts_ff_i\\":false,\\"ts_it_i\\":false,\\"ts_sc_i\\":false,\\"ts_st_i\\":false,\\"ts_un_i\\":false,\\"ts_va_i\\":false,\\"ts_bgc2_i\\":false,\\"ts_fgc2_i\\":false}]}],\\"dsl_metastyleslices\\":[{\\"stsl_type\\":\\"autocorrect\\",\\"stsl_styles\\":[{\\"ac_ot\\":null,\\"ac_ct\\":null,\\"ac_type\\":null,\\"ac_sm\\":{\\"asm_s\\":0,\\"asm_rl\\":0,\\"asm_l\\":\\"\\"},\\"ac_id\\":\\"\\"}]},{\\"stsl_type\\":\\"collapsed_content\\",\\"stsl_styles\\":[{\\"colc_icc\\":false}]},{\\"stsl_type\\":\\"composing_decoration\\",\\"stsl_styles\\":[{\\"cd_u\\":false,\\"cd_bgc\\":{\\"clr_type\\":0,\\"hclr_color\\":null}}]},{\\"stsl_type\\":\\"composing_region\\",\\"stsl_styles\\":[{\\"cr_c\\":false}]},{\\"stsl_type\\":\\"draft_comment\\",\\"stsl_styles\\":[{\\"dcs_cids\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"ignore_word\\",\\"stsl_styles\\":[{\\"iwos_i\\":false}]},{\\"stsl_type\\":\\"revision_diff\\",\\"stsl_styles\\":[{\\"revdiff_dt\\":0,\\"revdiff_a\\":\\"\\",\\"revdiff_aid\\":\\"\\"}]},{\\"stsl_type\\":\\"smart_todo\\",\\"stsl_styles\\":[{\\"sts_cid\\":null,\\"sts_ot\\":null,\\"sts_ac\\":null,\\"sts_hi\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"sts_pa\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"sts_dm\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"spellcheck\\",\\"stsl_styles\\":[{\\"sc_id\\":\\"\\",\\"sc_ow\\":null,\\"sc_sl\\":null,\\"sc_sugg\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"sc_sm\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"voice_corrections\\",\\"stsl_styles\\":[{\\"vcs_c\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"vcs_id\\":\\"\\"}]},{\\"stsl_type\\":\\"voice_dotted_span\\",\\"stsl_styles\\":[{\\"vdss_p\\":null,\\"vdss_id\\":\\"\\"}]}],\\"dsl_suggestedinsertions\\":{\\"sgsl_sugg\\":[]},\\"dsl_suggesteddeletions\\":{\\"sgsl_sugg\\":[]},\\"dsl_entitypositionmap\\":{},\\"dsl_entitymap\\":{},\\"dsl_entitytypemap\\":{},\\"dsl_drawingrevisionaccesstokenmap\\":{},\\"dsl_relateddocslices\\":{},\\"dsl_nestedmodelmap\\":{}},\\"autotext_content\\":{}}","edi":"QT9bASY3_GwFN8ZN119g2Ja2EHnrx_nq6yjODnrlfjrbkZEpqMl5NY_AGJtzSbcFsVk9XklA8IoHTqo123xXoO8cLKmVgnTCRWC6udfsvDpa","edrk":"xKYajWttYyLMt_u511ACUFI3qewboAf7dCubtDmoDhoCHwlXkw..","dct":"kix","ds":false,"cses":false}',
        });

        const expectedValue = doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            text('Hello', [mark(MARKS.SUPERSCRIPT)]),
            text('World', [mark(MARKS.SUBSCRIPT)])
          )
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('copy from safari (no href in anchors)', () => {
      it('recognizes entry hyperlink', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset="UTF-8"><span data-slate-node="text" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none;"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span><span class="css-1wt9k1k" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none;"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" data-link-type="Entry" data-link-id="example-entity-id" aria-describedby="tooltip_5371"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">a</span></span></span></span></a></span><span data-slate-node="text" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlMkMlN0IlMjJ0eXBlJTIyJTNBJTIyZW50cnktaHlwZXJsaW5rJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiUyMnRhcmdldCUyMiUzQSU3QiUyMnN5cyUyMiUzQSU3QiUyMmlkJTIyJTNBJTIyZXhhbXBsZS1lbnRpdHktaWQlMjIlMkMlMjJ0eXBlJTIyJTNBJTIyTGluayUyMiUyQyUyMmxpbmtUeXBlJTIyJTNBJTIyRW50cnklMjIlN0QlN0QlN0QlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjJhJTIyJTdEJTVEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMGIlMjIlN0QlNUQlMkMlMjJpc1ZvaWQlMjIlM0FmYWxzZSUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlNUQ=" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none;"><span data-slate-leaf="true"><span data-slate-string="true"><span class="Apple-converted-space">&nbsp;</span>b</span></span></span>',
          'text/plain': 'a b',
        });

        const expectedValue = doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            text(''),
            inline(
              INLINES.ENTRY_HYPERLINK,
              {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Entry',
                  },
                },
              },
              text('a')
            ),
            text(' b')
          )
        );

        richText.expectValue(expectedValue);
      });

      it('recognizes asset hyperlink', () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset="UTF-8"><span data-slate-node="text" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none;"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0"></span></span></span><span class="css-1wt9k1k" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none;"><a class="css-1dcu81t" data-test-id="cf-ui-text-link" data-link-type="Asset" data-link-id="example-entity-id" aria-describedby="tooltip_4165"><span><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">a</span></span></span></span></a></span><span data-slate-node="text" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMnBhcmFncmFwaCUyMiUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMiUyMiU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJhc3NldC1oeXBlcmxpbmslMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTIydGFyZ2V0JTIyJTNBJTdCJTIyc3lzJTIyJTNBJTdCJTIyaWQlMjIlM0ElMjJleGFtcGxlLWVudGl0eS1pZCUyMiUyQyUyMnR5cGUlMjIlM0ElMjJMaW5rJTIyJTJDJTIybGlua1R5cGUlMjIlM0ElMjJBc3NldCUyMiU3RCU3RCU3RCUyQyUyMmNoaWxkcmVuJTIyJTNBJTVCJTdCJTIydGV4dCUyMiUzQSUyMmElMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTVEJTdEJTJDJTdCJTIydGV4dCUyMiUzQSUyMiUyMGIlMjIlN0QlNUQlMkMlMjJpc1ZvaWQlMjIlM0FmYWxzZSUyQyUyMmRhdGElMjIlM0ElN0IlN0QlN0QlNUQ=" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none;"><span data-slate-leaf="true"><span data-slate-string="true"><span class="Apple-converted-space">&nbsp;</span>b</span></span></span>',
          'text/plain': 'a b',
        });

        const expectedValue = doc(
          block(
            BLOCKS.PARAGRAPH,
            {},
            text(''),
            inline(
              INLINES.ASSET_HYPERLINK,
              {
                target: {
                  sys: {
                    id: 'example-entity-id',
                    type: 'Link',
                    linkType: 'Asset',
                  },
                },
              },
              text('a')
            ),
            text(' b')
          )
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('blockquotes', () => {
      it('breaks a paragraph when pasting a blockquote in the middle', () => {
        richText.editor.type('A paragraph{leftarrow}').paste({
          'text/html':
            '<span data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMmJsb2NrcXVvdGUlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyYSUyMHF1b3RlJTIyJTdEJTVEJTdEJTVEJTdEJTVE" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none; white-space: pre;">a quote</span>',
          'text/plain': 'a blockquote',
        });

        const expectedValue = doc(
          block(BLOCKS.PARAGRAPH, {}, text('A paragrap')),
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('a quote'))),
          block(BLOCKS.PARAGRAPH, {}, text('h'))
        );

        richText.expectValue(expectedValue);
      });

      it("removes the paragraph if it's empty", () => {
        richText.editor.click().paste({
          'text/html':
            '<meta charset="utf-8"><blockquote data-slate-node="element" class="css-1p66r2x" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMmJsb2NrcXVvdGUlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyYSUyMHF1b3RlJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlN0QlNUQ="><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">a quote</span></span></span></div></blockquote><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0"></span></span></span></div>',
          'text/plain': 'a blockquote',
        });

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('a quote'))),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });

      it("removes the paragraph if it's fully selected", () => {
        richText.editor.click().type('abc').type('{selectall}');

        getIframeWindow().then((win: any) => {
          const selection = win.getSelection();
          cy.wrap(selection).its('focusNode.data').should('equal', 'abc');
          // slate throttles the handling of selection changes
          // so the editor might be unaware of the new selection at the time we paste
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(200);
        });
        richText.editor.paste({
          'text/html':
            '<meta charset="utf-8"><blockquote data-slate-node="element" class="css-1p66r2x" data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMmJsb2NrcXVvdGUlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIyYSUyMHF1b3RlJTIyJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RCUyQyUyMmlzVm9pZCUyMiUzQWZhbHNlJTJDJTIyZGF0YSUyMiUzQSU3QiU3RCU3RCU1RCU3RCUyQyU3QiUyMnR5cGUlMjIlM0ElMjJwYXJhZ3JhcGglMjIlMkMlMjJjaGlsZHJlbiUyMiUzQSU1QiU3QiUyMnRleHQlMjIlM0ElMjIlMjIlN0QlNUQlN0QlNUQ="><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">a quote</span></span></span></div></blockquote><div data-slate-node="element" class="css-ss00rg"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="n" data-slate-length="0"></span></span></span></div>',
          'text/plain': 'a blockquote',
        });

        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('a quote'))),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('missing application/x-slate-fragment [safari]', () => {
      it('render slate fragment if attribute "data-slate-fragment" exists', () => {
        richText.editor.click().paste({
          'text/html':
            '<span data-slate-fragment="JTVCJTdCJTIydHlwZSUyMiUzQSUyMmJsb2NrcXVvdGUlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0eXBlJTIyJTNBJTIycGFyYWdyYXBoJTIyJTJDJTIyY2hpbGRyZW4lMjIlM0ElNUIlN0IlMjJ0ZXh0JTIyJTNBJTIycXVvdGUlMjIlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTVEJTJDJTIyaXNWb2lkJTIyJTNBZmFsc2UlMkMlMjJkYXRhJTIyJTNBJTdCJTdEJTdEJTVEJTdEJTVE" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); font-style: normal; font-variant-caps: normal; font-weight: normal; letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none; white-space: pre;">quote</span>',
          'text/plain': 'quote',
        });
        const expectedValue = doc(
          block(BLOCKS.QUOTE, {}, block(BLOCKS.PARAGRAPH, {}, text('quote'))),
          block(BLOCKS.PARAGRAPH, {}, text(''))
        );

        richText.expectValue(expectedValue);
      });
    });

    describe('removing restricted marks', () => {
      it('works when pasting subscript and superscript from a google doc', () => {
        cy.setRestrictedMarks(['superscript', 'subscript']);
        cy.reload();
        // A simple "hello world" text with marks: superscript and subscript.
        // Copied from a google doc
        richText.editor.click().paste({
          'text/plain': 'HelloWorld',
          'text/html':
            '<meta charset=\'utf-8\'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-d846cac1-7fff-6b53-5ddb-bef1e002bcd8"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"><span style="font-size:0.6em;vertical-align:super;">Hello</span></span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"><span style="font-size:0.6em;vertical-align:sub;">World</span></span></b>',
          'application/x-vnd.google-docs-document-slice-clip+wrapped':
            '{"dih":3014089275,"data":"{\\"resolved\\":{\\"dsl_spacers\\":\\"HelloWorld\\",\\"dsl_styleslices\\":[{\\"stsl_type\\":\\"autogen\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"cell\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"code_snippet\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"collapsed_heading\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"column_sector\\",\\"stsl_leading\\":{\\"css_cols\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"css_lb\\":false,\\"css_ltr\\":true,\\"css_st\\":\\"continuous\\",\\"css_mb\\":null,\\"css_mh\\":null,\\"css_mf\\":null,\\"css_ml\\":null,\\"css_mr\\":null,\\"css_mt\\":null,\\"css_fi\\":null,\\"css_hi\\":null,\\"css_epfi\\":null,\\"css_ephi\\":null,\\"css_fpfi\\":null,\\"css_fphi\\":null,\\"css_ufphf\\":null,\\"css_pnsi\\":null,\\"css_fpo\\":null},\\"stsl_leadingType\\":\\"column_sector\\",\\"stsl_trailing\\":{\\"css_cols\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"css_lb\\":false,\\"css_ltr\\":true,\\"css_st\\":\\"continuous\\",\\"css_mb\\":null,\\"css_mh\\":null,\\"css_mf\\":null,\\"css_ml\\":null,\\"css_mr\\":null,\\"css_mt\\":null,\\"css_fi\\":null,\\"css_hi\\":null,\\"css_epfi\\":null,\\"css_ephi\\":null,\\"css_fpfi\\":null,\\"css_fphi\\":null,\\"css_ufphf\\":null,\\"css_pnsi\\":null,\\"css_fpo\\":null},\\"stsl_trailingType\\":\\"column_sector\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"comment\\",\\"stsl_styles\\":[{\\"cs_cids\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"doco_anchor\\",\\"stsl_styles\\":[{\\"das_a\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"document\\",\\"stsl_leading\\":{\\"ds_b\\":{\\"bg_c2\\":{\\"clr_type\\":0,\\"hclr_color\\":null}},\\"ds_df\\":{\\"df_dm\\":0},\\"ds_fi\\":null,\\"ds_hi\\":null,\\"ds_epfi\\":null,\\"ds_ephi\\":null,\\"ds_uephf\\":false,\\"ds_fpfi\\":null,\\"ds_fphi\\":null,\\"ds_ufphf\\":false,\\"ds_pnsi\\":1,\\"ds_mb\\":72,\\"ds_ml\\":72,\\"ds_mr\\":72,\\"ds_mt\\":72,\\"ds_ph\\":792,\\"ds_pw\\":612,\\"ds_rtd\\":\\"\\",\\"ds_mh\\":36,\\"ds_mf\\":36,\\"ds_ulhfl\\":false,\\"ds_lhs\\":1,\\"ds_fpo\\":false},\\"stsl_leadingType\\":\\"document\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"equation\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"equation_function\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"field\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"footnote\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"headings\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"horizontal_rule\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"ignore_spellcheck\\",\\"stsl_styles\\":[{\\"isc_osh\\":null}]},{\\"stsl_type\\":\\"import_warnings\\",\\"stsl_styles\\":[{\\"iws_iwids\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"language\\",\\"stsl_trailing\\":{\\"lgs_l\\":\\"en\\"},\\"stsl_trailingType\\":\\"language\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"link\\",\\"stsl_styles\\":[{\\"lnks_link\\":null}]},{\\"stsl_type\\":\\"list\\",\\"stsl_trailing\\":{\\"ls_nest\\":0,\\"ls_id\\":null,\\"ls_c\\":null,\\"ls_ts\\":{\\"ts_bd\\":false,\\"ts_fs\\":11,\\"ts_ff\\":\\"Arial\\",\\"ts_it\\":false,\\"ts_sc\\":false,\\"ts_st\\":false,\\"ts_tw\\":400,\\"ts_un\\":false,\\"ts_va\\":\\"nor\\",\\"ts_bgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":null},\\"ts_fgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":\\"#000000\\"},\\"ts_bd_i\\":false,\\"ts_fs_i\\":false,\\"ts_ff_i\\":false,\\"ts_it_i\\":false,\\"ts_sc_i\\":false,\\"ts_st_i\\":false,\\"ts_un_i\\":false,\\"ts_va_i\\":false,\\"ts_bgc2_i\\":false,\\"ts_fgc2_i\\":false}},\\"stsl_trailingType\\":\\"list\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"named_range\\",\\"stsl_styles\\":[{\\"nrs_ei\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"paragraph\\",\\"stsl_trailing\\":{\\"ps_al\\":0,\\"ps_awao\\":true,\\"ps_sd\\":null,\\"ps_bbtw\\":null,\\"ps_bb\\":null,\\"ps_bl\\":null,\\"ps_br\\":null,\\"ps_bt\\":null,\\"ps_hd\\":0,\\"ps_hdid\\":\\"\\",\\"ps_ifl\\":0,\\"ps_il\\":0,\\"ps_ir\\":0,\\"ps_klt\\":false,\\"ps_kwn\\":false,\\"ps_ltr\\":true,\\"ps_ls\\":1.15,\\"ps_lslm\\":1,\\"ps_pbb\\":false,\\"ps_sm\\":0,\\"ps_sa\\":0,\\"ps_sb\\":0,\\"ps_al_i\\":false,\\"ps_awao_i\\":false,\\"ps_sd_i\\":false,\\"ps_bbtw_i\\":false,\\"ps_bb_i\\":false,\\"ps_bl_i\\":false,\\"ps_br_i\\":false,\\"ps_bt_i\\":false,\\"ps_ifl_i\\":false,\\"ps_il_i\\":false,\\"ps_ir_i\\":false,\\"ps_klt_i\\":false,\\"ps_kwn_i\\":false,\\"ps_ls_i\\":false,\\"ps_lslm_i\\":false,\\"ps_pbb_i\\":false,\\"ps_rd\\":\\"\\",\\"ps_sm_i\\":false,\\"ps_sa_i\\":false,\\"ps_sb_i\\":false,\\"ps_shd\\":false,\\"ps_ts\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}},\\"stsl_trailingType\\":\\"paragraph\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"row\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"suppress_feature\\",\\"stsl_styles\\":[{\\"sfs_sst\\":false}]},{\\"stsl_type\\":\\"tbl\\",\\"stsl_styles\\":[]},{\\"stsl_type\\":\\"text\\",\\"stsl_styles\\":[{\\"ts_bd\\":false,\\"ts_fs\\":11,\\"ts_ff\\":\\"Arial\\",\\"ts_it\\":false,\\"ts_sc\\":false,\\"ts_st\\":false,\\"ts_tw\\":400,\\"ts_un\\":false,\\"ts_va\\":\\"sup\\",\\"ts_bgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":null},\\"ts_fgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":\\"#000000\\"},\\"ts_bd_i\\":false,\\"ts_fs_i\\":false,\\"ts_ff_i\\":false,\\"ts_it_i\\":false,\\"ts_sc_i\\":false,\\"ts_st_i\\":false,\\"ts_un_i\\":false,\\"ts_va_i\\":false,\\"ts_bgc2_i\\":false,\\"ts_fgc2_i\\":false},null,null,null,null,{\\"ts_bd\\":false,\\"ts_fs\\":11,\\"ts_ff\\":\\"Arial\\",\\"ts_it\\":false,\\"ts_sc\\":false,\\"ts_st\\":false,\\"ts_tw\\":400,\\"ts_un\\":false,\\"ts_va\\":\\"sub\\",\\"ts_bgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":null},\\"ts_fgc2\\":{\\"clr_type\\":0,\\"hclr_color\\":\\"#000000\\"},\\"ts_bd_i\\":false,\\"ts_fs_i\\":false,\\"ts_ff_i\\":false,\\"ts_it_i\\":false,\\"ts_sc_i\\":false,\\"ts_st_i\\":false,\\"ts_un_i\\":false,\\"ts_va_i\\":false,\\"ts_bgc2_i\\":false,\\"ts_fgc2_i\\":false}]}],\\"dsl_metastyleslices\\":[{\\"stsl_type\\":\\"autocorrect\\",\\"stsl_styles\\":[{\\"ac_ot\\":null,\\"ac_ct\\":null,\\"ac_type\\":null,\\"ac_sm\\":{\\"asm_s\\":0,\\"asm_rl\\":0,\\"asm_l\\":\\"\\"},\\"ac_id\\":\\"\\"}]},{\\"stsl_type\\":\\"collapsed_content\\",\\"stsl_styles\\":[{\\"colc_icc\\":false}]},{\\"stsl_type\\":\\"composing_decoration\\",\\"stsl_styles\\":[{\\"cd_u\\":false,\\"cd_bgc\\":{\\"clr_type\\":0,\\"hclr_color\\":null}}]},{\\"stsl_type\\":\\"composing_region\\",\\"stsl_styles\\":[{\\"cr_c\\":false}]},{\\"stsl_type\\":\\"draft_comment\\",\\"stsl_styles\\":[{\\"dcs_cids\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"ignore_word\\",\\"stsl_styles\\":[{\\"iwos_i\\":false}]},{\\"stsl_type\\":\\"revision_diff\\",\\"stsl_styles\\":[{\\"revdiff_dt\\":0,\\"revdiff_a\\":\\"\\",\\"revdiff_aid\\":\\"\\"}]},{\\"stsl_type\\":\\"smart_todo\\",\\"stsl_styles\\":[{\\"sts_cid\\":null,\\"sts_ot\\":null,\\"sts_ac\\":null,\\"sts_hi\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"sts_pa\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"sts_dm\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"spellcheck\\",\\"stsl_styles\\":[{\\"sc_id\\":\\"\\",\\"sc_ow\\":null,\\"sc_sl\\":null,\\"sc_sugg\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"sc_sm\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}}}]},{\\"stsl_type\\":\\"voice_corrections\\",\\"stsl_styles\\":[{\\"vcs_c\\":{\\"cv\\":{\\"op\\":\\"set\\",\\"opValue\\":[]}},\\"vcs_id\\":\\"\\"}]},{\\"stsl_type\\":\\"voice_dotted_span\\",\\"stsl_styles\\":[{\\"vdss_p\\":null,\\"vdss_id\\":\\"\\"}]}],\\"dsl_suggestedinsertions\\":{\\"sgsl_sugg\\":[]},\\"dsl_suggesteddeletions\\":{\\"sgsl_sugg\\":[]},\\"dsl_entitypositionmap\\":{},\\"dsl_entitymap\\":{},\\"dsl_entitytypemap\\":{},\\"dsl_drawingrevisionaccesstokenmap\\":{},\\"dsl_relateddocslices\\":{},\\"dsl_nestedmodelmap\\":{}},\\"autotext_content\\":{}}","edi":"QT9bASY3_GwFN8ZN119g2Ja2EHnrx_nq6yjODnrlfjrbkZEpqMl5NY_AGJtzSbcFsVk9XklA8IoHTqo123xXoO8cLKmVgnTCRWC6udfsvDpa","edrk":"xKYajWttYyLMt_u511ACUFI3qewboAf7dCubtDmoDhoCHwlXkw..","dct":"kix","ds":false,"cses":false}',
        });

        const expectedValue = doc(block(BLOCKS.PARAGRAPH, {}, text('HelloWorld')));

        richText.expectValue(expectedValue);
      });
    });
  }
);
