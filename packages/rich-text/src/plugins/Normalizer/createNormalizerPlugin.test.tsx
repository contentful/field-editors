/** @jsx jsx */
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { createNormalizerPlugin } from './createNormalizerPlugin';
import { jsx, createTestEditor, mockPlugin, assertOutput } from '../../test-utils';
import { transformWrapIn } from '../../helpers/transformers';

describe('Normalizer', () => {
  const rules = [
    {
      validChildren: [BLOCKS.PARAGRAPH],
    },
  ];

  let input: any;

  beforeEach(() => {
    input = (
      <editor>
        <hul>
          <hli>
            <hembed type="Entry" id="embedded-entry" />
            <hp>List item</hp>
          </hli>
        </hul>
      </editor>
    );
  });

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

  describe('rule.transform', () => {
    it('works with conditional transformation', () => {
      const { editor } = createTestEditor({
        input: (
          <editor>
            <hul>
              <hli>
                <hembed type="Entry" id="embedded-entry" />
                <hinline type="Entry" id="inline-entry" />
                <hp>List item</hp>
              </hli>
            </hul>
          </editor>
        ),
        plugins: [
          mockPlugin({
            isElement: true,
            type: BLOCKS.LIST_ITEM,
            normalizer: [
              {
                validChildren: [BLOCKS.PARAGRAPH],
                transform: {
                  [INLINES.EMBEDDED_ENTRY]: transformWrapIn(BLOCKS.PARAGRAPH),
                  // default: transformRemove
                },
              },
            ],
          }),
          createNormalizerPlugin(),
        ],
      });

      assertOutput({
        editor,
        expected: (
          <editor>
            <hul>
              <hli>
                <hp>
                  <hinline type="Entry" id="inline-entry" />
                </hp>
                <hp>List item</hp>
              </hli>
            </hul>
          </editor>
        ),
      });
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
