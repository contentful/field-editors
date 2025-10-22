/** @jsx jsx */
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer';

import { jsx } from '../test-utils';
import { getTextContent } from './getTextContent';


describe('getTextContent', () => {
  const cases = [
    {
      title: 'empty document',
      input: <editor></editor>,
    },
    {
      title: 'list of paragraphs',
      input: (
        <editor>
          <hp>
            <htext>paragraph 1</htext>
          </hp>
          <hp>
            <htext>paragraph 2</htext>
          </hp>
          <hp>
            <htext>paragraph 3</htext>
          </hp>
        </editor>
      ),
    },
    {
      title: 'void blocks',
      input: (
        <editor>
          <hp>
            <htext>paragraph 1</htext>
          </hp>
          <hhr />
          <hhr />
          <hp>
            <htext>paragraph 2</htext>
          </hp>
          <hp>
            <htext>paragraph 3</htext>
          </hp>
        </editor>
      ),
    },
    {
      title: 'blockquote inside list item',
      input: (
        <editor>
          <hul>
            <hli>
              <hp>
                <htext>paragraph 1</htext>
              </hp>
              <hquote>
                <hp>
                  <htext>paragraph 2</htext>
                </hp>
              </hquote>
            </hli>
          </hul>

          <hp>
            <htext>trailing paragraph</htext>
          </hp>
        </editor>
      ),
    },
    {
      title: 'empty blockquote between paragraphs',
      input: (
        <editor>
          <hp>
            <htext>paragraph 1</htext>
          </hp>
          <hquote>
            <hp>
              <htext></htext>
            </hp>
          </hquote>
          <hp>
            <htext>paragraph 3</htext>
          </hp>
        </editor>
      ),
    },
    {
      title: 'paragraphs with inline nodes',
      input: (
        <editor>
          <hp>
            <htext>text 1</htext>
            <hinline id="first-entry" type="Entry" />
            <htext>text 2</htext>
            <hinline id="another-entry" type="Entry" />
          </hp>
          <hp>
            <htext>text 3</htext>
          </hp>
        </editor>
      ),
    },
  ];

  cases.forEach(({ title, input }) => {
    it(title, () => {
      expect(getTextContent(input as any)).toBe(
        documentToPlainTextString(toContentfulDocument({ document: (input as any).children })),
      );
    });
  });
});
