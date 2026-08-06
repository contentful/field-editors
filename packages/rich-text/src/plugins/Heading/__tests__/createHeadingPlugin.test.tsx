/* eslint-disable react/no-unknown-property */
/** @jsx jsx */
import { BLOCKS } from '@contentful/rich-text-types';
import { describe, expect, it, vi } from 'vitest';

import { assertOutput, createTestEditor, jsx } from '../../../test-utils';
import { createHeadingPlugin } from '../createHeadingPlugin';

describe('normalization', () => {
  it('can contain inline entries & hyperlinks', () => {
    const input = (
      <editor>
        <hh1>
          some text before
          <hinline type="Entry" id="inline-entry" />
          <hlink uri="https://contentful.com" />
          <hlink entry="entry-id" />
          <hlink resource="resource-urn" />
          <hlink asset="asset-id" />
          some text after
        </hh1>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected: input });
  });

  it('unwraps nested paragraphs', () => {
    const input = (
      <editor>
        <hh1>
          one{' '}
          <hp>
            two <hp>three </hp>
          </hp>
          four
        </hh1>
      </editor>
    );

    const expected = (
      <editor>
        <hh1>one two three four</hh1>

        <hp>
          <htext />
        </hp>
      </editor>
    );

    assertOutput({ input, expected });
  });

  describe('lifts other invalid children', () => {
    it('block void elements', () => {
      const input = (
        <editor>
          {/* Asset block */}
          <hh1>
            <hembed type="Asset" id="1" /> start
          </hh1>

          <hh1>
            end <hembed type="Asset" id="2" />
          </hh1>

          <hh1>
            in <hembed type="Asset" id="3" /> between
          </hh1>

          {/* Entry block */}
          <hh1>
            <hembed type="Entry" id="1" /> start
          </hh1>

          <hh1>
            end <hembed type="Entry" id="2" />
          </hh1>

          <hh1>
            in <hembed type="Entry" id="3" /> between
          </hh1>

          {/* HR*/}
          <hh1>
            <hhr /> start
          </hh1>

          <hh1>
            end <hhr />
          </hh1>

          <hh1>
            in <hhr /> between
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          {/* Asset block */}
          <hembed type="Asset" id="1" />
          <hh1> start</hh1>

          <hh1>end </hh1>
          <hembed type="Asset" id="2" />

          <hh1>in </hh1>
          <hembed type="Asset" id="3" />
          <hh1> between</hh1>

          {/* Entry block */}
          <hembed type="Entry" id="1" />
          <hh1> start</hh1>

          <hh1>end </hh1>
          <hembed type="Entry" id="2" />

          <hh1>in </hh1>
          <hembed type="Entry" id="3" />
          <hh1> between</hh1>

          {/* HR*/}
          <hhr />
          <hh1> start</hh1>

          <hh1>end </hh1>
          <hhr />

          <hh1>in </hh1>
          <hhr />
          <hh1> between</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('nested headings', () => {
      const input = (
        <editor>
          <hh1>
            some
            <hh1>
              <htext bold italic underline>
                paragraph
              </htext>
            </hh1>
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

          <hh1>
            <htext bold italic underline>
              paragraph
            </htext>
          </hh1>

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles quotes', () => {
      const input = (
        <editor>
          <hh1>
            some
            <hquote>
              <hp>quote</hp>
            </hquote>
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

          <hquote>
            <hp>quote</hp>
          </hquote>

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles lists', () => {
      const input = (
        <editor>
          <hh1>
            some
            <hul>
              <hli>
                <hp>list item</hp>
              </hli>
            </hul>
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

          <hul>
            <hli>
              <hp>list item</hp>
            </hli>
          </hul>

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });

    it('handles tables', () => {
      const input = (
        <editor>
          <hh1>
            some
            <htable>
              <htr>
                <htd>
                  <hp>cell 1</hp>
                </htd>
                <htd>
                  <hp>cell 2</hp>
                </htd>
              </htr>
            </htable>
            text
          </hh1>
        </editor>
      );

      const expected = (
        <editor>
          <hh1>some</hh1>

          <htable>
            <htr>
              <htd>
                <hp>cell 1</hp>
              </htd>
              <htd>
                <hp>cell 2</hp>
              </htd>
            </htr>
          </htable>

          <hh1>text</hh1>

          <hp>
            <htext />
          </hp>
        </editor>
      );

      assertOutput({ input, expected });
    });
  });
});

describe('buildHeadingEventHandler / onKeyDown', () => {
  const H5_KEYCODE = 53; // '5'
  const H3_KEYCODE = 51; // '3'

  const fireModAlt = (editor: any, plugin: any, keyCode: number, key: string) => {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: true,
      altKey: true,
      which: keyCode,
      keyCode,
      bubbles: true,
      cancelable: true,
    });

    plugin.handlers!.onKeyDown!(editor, plugin)(event as any);
  };

  const getHeadingPlugin = (nodeType: string) => {
    const heading = createHeadingPlugin();
    const plugin = heading.plugins!.find((p) => p.type === nodeType)!;
    return plugin;
  };

  it('does not toggle a heading when the selection is inside a table cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hp>
                <htext />
                <cursor />
              </hp>
            </htd>
          </htr>
        </htable>
      </editor>
    );

    const trackingHandler = vi.fn();
    const { editor } = createTestEditor({ input, trackingHandler });
    const plugin = getHeadingPlugin(BLOCKS.HEADING_5);

    fireModAlt(editor, plugin, H5_KEYCODE, '5');

    expect(
      editor.children.some((n: any) =>
        JSON.stringify(n).includes(`"type":"${BLOCKS.HEADING_5}"`),
      ),
    ).toBe(false);
    expect(trackingHandler).not.toHaveBeenCalled();
  });

  it('does not toggle a heading when the selection is inside a table header cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <hth>
              <hp>
                <htext />
                <cursor />
              </hp>
            </hth>
          </htr>
        </htable>
      </editor>
    );

    const trackingHandler = vi.fn();
    const { editor } = createTestEditor({ input, trackingHandler });
    const plugin = getHeadingPlugin(BLOCKS.HEADING_5);

    fireModAlt(editor, plugin, H5_KEYCODE, '5');

    expect(
      editor.children.some((n: any) =>
        JSON.stringify(n).includes(`"type":"${BLOCKS.HEADING_5}"`),
      ),
    ).toBe(false);
    expect(trackingHandler).not.toHaveBeenCalled();
  });

  it('still toggles a heading in a plain paragraph outside a table (regression guard)', () => {
    const input = (
      <editor>
        <hp>
          <htext />
          <cursor />
        </hp>
      </editor>
    );

    const trackingHandler = vi.fn();
    const { editor } = createTestEditor({ input, trackingHandler });
    const plugin = getHeadingPlugin(BLOCKS.HEADING_5);

    fireModAlt(editor, plugin, H5_KEYCODE, '5');

    expect(
      editor.children.some((n: any) =>
        JSON.stringify(n).includes(`"type":"${BLOCKS.HEADING_5}"`),
      ),
    ).toBe(true);
    expect(trackingHandler).toHaveBeenCalledWith(
      'insert',
      expect.objectContaining({ nodeType: BLOCKS.HEADING_5 }),
    );
  });

  it('does not toggle a heading when the selection is in a list item nested inside a table cell', () => {
    const input = (
      <editor>
        <htable>
          <htr>
            <htd>
              <hul>
                <hli>
                  <hp>
                    <htext />
                    <cursor />
                  </hp>
                </hli>
              </hul>
            </htd>
          </htr>
        </htable>
      </editor>
    );

    const trackingHandler = vi.fn();
    const { editor } = createTestEditor({ input, trackingHandler });
    const plugin = getHeadingPlugin(BLOCKS.HEADING_3);

    fireModAlt(editor, plugin, H3_KEYCODE, '3');

    expect(
      editor.children.some((n: any) =>
        JSON.stringify(n).includes(`"type":"${BLOCKS.HEADING_3}"`),
      ),
    ).toBe(false);
    expect(trackingHandler).not.toHaveBeenCalled();
  });
});
