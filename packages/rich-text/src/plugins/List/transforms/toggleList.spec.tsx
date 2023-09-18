/** @jsx jsx */
import { BLOCKS } from '@contentful/rich-text-types';
import { PlateEditor } from '@udecode/plate-common';

import { assertOutput, jsx, createTestEditor } from '../../../test-utils';
import { toggleList } from './toggleList';

describe('toggle on', () => {
  it('should turn a p to list', () => {
    const input = (
      <editor>
        <hp>
          1<cursor />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>
              1<cursor />
            </hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.UL_LIST });

    assertOutput({ editor, expected });
  });

  it('should turn a p with a selection to list', () => {
    const input = (
      <editor>
        <hp>
          Planetas <anchor />
          mori in
          <focus /> gandavum!
        </hp>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>
              Planetas <anchor />
              mori in
              <focus /> gandavum!
            </hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.UL_LIST });

    assertOutput({ editor, expected });
  });

  it('should turn multiple p to list', () => {
    const input = (
      <editor>
        <hp>
          <anchor />1
        </hp>
        <hp>2</hp>
        <hp>
          3<focus />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>
              <anchor />1
            </hp>
          </hli>
          <hli>
            <hp>2</hp>
          </hli>
          <hli>
            <hp>
              3<focus />
            </hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.UL_LIST });

    assertOutput({ editor, expected });
  });
});

describe('toggle off', () => {
  it('should split a simple list to two', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
          </hli>
          <hli>
            <hp>
              2
              <cursor />
            </hp>
          </hli>
          <hli>
            <hp>3</hp>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
          </hli>
        </hul>
        <hp>
          2<cursor />
        </hp>
        <hul>
          <hli>
            <hp>3</hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.UL_LIST });

    assertOutput({ editor, expected });
  });

  it('should split a nested list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
            <hul>
              <hli>
                <hp>11</hp>
              </hli>
              <hli>
                <hp>
                  12
                  <cursor />
                </hp>
              </hli>
              <hli>
                <hp>13</hp>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
            <hul>
              <hli>
                <hp>11</hp>
              </hli>
            </hul>
          </hli>
        </hul>
        <hp>
          12
          <cursor />
        </hp>
        <hul>
          <hli>
            <hp>13</hp>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.UL_LIST });

    assertOutput({ editor, expected });
  });

  it('should turn a list to multiple p', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>
              <anchor />1
            </hp>
          </hli>
          <hli>
            <hp>2</hp>
          </hli>
          <hli>
            <hp>
              3<focus />
            </hp>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>
          <anchor />1
        </hp>
        <hp>2</hp>
        <hp>
          3<focus />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.UL_LIST });

    assertOutput({ editor, expected });
  });
});

describe('toggle over', () => {
  it('should toggle different list types', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>
              1<cursor />
            </hp>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hol>
          <hli>
            <hp>1</hp>
          </hli>
        </hol>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.OL_LIST });

    assertOutput({ editor, expected });
  });

  it('should only toggle the nested list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
            <hul>
              <hli>
                <hp>
                  11
                  <cursor />
                </hp>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
            <hol>
              <hli>
                <hp>
                  11
                  <cursor />
                </hp>
              </hli>
            </hol>
          </hli>
        </hul>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.OL_LIST });

    assertOutput({ editor, expected });
  });

  it('should only toggle everything that is selected', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>
              <anchor />1
            </hp>
            <hul>
              <hli>
                <hp>
                  11
                  <focus />
                </hp>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hol>
          <hli>
            <hp>
              <anchor />1
            </hp>
            <hol>
              <hli>
                <hp>
                  11
                  <focus />
                </hp>
              </hli>
            </hol>
          </hli>
        </hol>
        <hp>
          <htext />
        </hp>
      </editor>
    ) as any as PlateEditor;

    const { editor } = createTestEditor({
      input,
    });

    toggleList(editor, { type: BLOCKS.OL_LIST });

    assertOutput({ editor, expected });
  });
});
