/** @jsx jsx */
import { BLOCKS } from '@contentful/rich-text-types';

import { jsx, createTestEditor, mockPlugin, assertOutput } from '../../test-utils';
import { createNormalizerPlugin } from './createNormalizerPlugin';

describe('Normalizer', () => {
  const rules = [
    {
      validChildren: [BLOCKS.PARAGRAPH],
    },
  ];

  const input = (
    <editor>
      <hul>
        <hli>
          <hembed type="Asset" id="asset-id" />
          <hp>List item</hp>
        </hli>
      </hul>
    </editor>
  );

  const expected = (
    <editor>
      <hul>
        <hli>
          <hp>List item</hp>
        </hli>
      </hul>
    </editor>
  );

  describe('rule.match', () => {
    it('matches elements of type "plugin.type" by default', () => {
      const { editor } = createTestEditor({
        input,
        plugins: [
          mockPlugin({
            isElement: true,
            type: BLOCKS.LIST_ITEM,
            normalizer: rules,
          }),
          createNormalizerPlugin(),
        ],
      });

      assertOutput({ editor, expected });
    });

    it('rejects rules without "match" in a non-element plugin', () => {
      expect(() =>
        createTestEditor({
          input,
          plugins: [mockPlugin({ normalizer: rules }), createNormalizerPlugin()],
        })
      ).toThrow(/rule.match MUST be defined/);
    });
  });

  describe('rule.validChildren', () => {
    it('supports custom functions', () => {
      const { editor } = createTestEditor({
        input,
        plugins: [
          mockPlugin({
            isElement: true,
            type: BLOCKS.LIST_ITEM,
            normalizer: [
              {
                validChildren: (_, [node]) => {
                  return (node as any).type === BLOCKS.PARAGRAPH;
                },
              },
            ],
          }),
          createNormalizerPlugin(),
        ],
      });

      assertOutput({ editor, expected });
    });
  });
});
