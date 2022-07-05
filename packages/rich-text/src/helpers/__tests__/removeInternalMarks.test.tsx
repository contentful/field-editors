/** @jsx jsx */

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';

import { COMMAND_PROMPT } from '../../plugins/CommandPalette/constants';
import { jsx } from '../../test-utils';
import { removeInternalMarks } from '../removeInternalMarks';

describe('internal mark', () => {
  describe('First level nodes', () => {
    const data = [
      {
        title: 'Paragraph mark is removed',
        input: toContentfulDocument(
          (
            (
              <editor>
                <hp>
                  <htext {...{ [COMMAND_PROMPT]: true }} />
                </hp>
              </editor>
            ) as any
          ).children
        ),
        expected: toContentfulDocument(
          (
            (
              <editor>
                <hp>
                  <htext />
                </hp>
              </editor>
            ) as any
          ).children
        ),
      },
      {
        title: 'Heading mark is removed',
        input: toContentfulDocument(
          (
            (
              <editor>
                <hh1>
                  <htext {...{ [COMMAND_PROMPT]: true }} />
                </hh1>
              </editor>
            ) as any
          ).children
        ),
        expected: toContentfulDocument(
          (
            (
              <editor>
                <hh1>
                  <htext />
                </hh1>
              </editor>
            ) as any
          ).children
        ),
      },
      {
        title: 'Block quote mark is removed',
        input: toContentfulDocument(
          (
            (
              <editor>
                <hquote>
                  <hp>
                    <htext {...{ [COMMAND_PROMPT]: true }} />
                  </hp>
                </hquote>
              </editor>
            ) as any
          ).children
        ),
        expected: toContentfulDocument(
          (
            (
              <editor>
                <hquote>
                  <hp>
                    <htext />
                  </hp>
                </hquote>
              </editor>
            ) as any
          ).children
        ),
      },
      {
        title: 'Other marks are not removed',
        input: toContentfulDocument(
          (
            (
              <editor>
                <hquote>
                  <hp>
                    <htext bold underline {...{ [COMMAND_PROMPT]: true }} />
                  </hp>
                </hquote>
              </editor>
            ) as any
          ).children
        ),
        expected: toContentfulDocument(
          (
            (
              <editor>
                <hquote>
                  <hp>
                    <htext bold underline />
                  </hp>
                </hquote>
              </editor>
            ) as any
          ).children
        ),
      },
    ];
    for (const { input, expected, title } of data) {
      it(`${title}`, () => {
        expect(removeInternalMarks(input)).toEqual(expected);
      });
    }
  });
});
