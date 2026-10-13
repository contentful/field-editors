import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { describe, expect, it } from 'vitest';

import { wrapLink } from '../../helpers/editor';
import { createTestEditor } from '../../test-utils/createTestEditor';

it('converts selected text into a hyperlink', () => {
  const { editor } = createTestEditor({});
  editor.children = [{ type: BLOCKS.PARAGRAPH, children: [{ text: 'My cool website' }] }];
  editor.tf.select({ anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 15 } });
  editor.tf.withoutNormalizing(() => {
    wrapLink(editor, {
      text: 'My cool website',
      url: 'https://example.com',
      type: INLINES.HYPERLINK,
    });
  });
  expect(editor.children[0].children).toEqual([
    { text: '' },
    {
      type: INLINES.HYPERLINK,
      data: { uri: 'https://example.com' },
      children: [{ text: 'My cool website' }],
    },
    { text: '' },
  ]);
});

it('preserves formatting and can undo and redo converting selected text', () => {
  const { editor } = createTestEditor({});
  const original = [
    { type: BLOCKS.PARAGRAPH, children: [{ text: 'Before bold After', bold: true }] },
  ];
  editor.children = original;
  editor.tf.select({ anchor: { path: [0, 0], offset: 7 }, focus: { path: [0, 0], offset: 11 } });
  editor.tf.withoutNormalizing(() => {
    wrapLink(editor, { type: INLINES.HYPERLINK, url: 'https://example.com', text: 'bold' });
  });
  const linked = [
    {
      type: BLOCKS.PARAGRAPH,
      children: [
        { text: 'Before ', bold: true },
        {
          type: INLINES.HYPERLINK,
          data: { uri: 'https://example.com' },
          children: [{ text: 'bold', bold: true }],
        },
        { text: ' After', bold: true },
      ],
    },
  ];
  expect(editor.children).toEqual(linked);
  editor.tf.undo();
  expect(editor.children).toEqual(original);
  editor.tf.redo();
  expect(editor.children).toEqual(linked);
});

const linkOptions = [
  { type: INLINES.HYPERLINK, url: 'https://example.com' },
  {
    type: INLINES.ENTRY_HYPERLINK,
    target: { sys: { id: 'entry-id', type: 'Link', linkType: 'Entry' } },
  },
  {
    type: INLINES.ASSET_HYPERLINK,
    target: { sys: { id: 'asset-id', type: 'Link', linkType: 'Asset' } },
  },
] satisfies Omit<Parameters<typeof wrapLink>[1], 'text'>[];

describe.each(linkOptions)('$type', (options) => {
  it.each([
    { name: 'a forward selection', backward: false, text: 'My cool website' },
    { name: 'a backward selection', backward: true, text: 'My cool website' },
    { name: 'a changed link label', backward: false, text: 'New label' },
  ])('keeps $name linked without changing surrounding content', ({ backward, text }) => {
    const { editor } = createTestEditor({});
    const existingLink = {
      type: INLINES.HYPERLINK,
      data: { uri: 'https://existing.example' },
      children: [{ text: 'Existing link', data: {} }],
      isVoid: false,
    };
    editor.children = [
      {
        type: BLOCKS.PARAGRAPH,
        children: [
          { text: 'Before My cool website After', data: {} },
          existingLink,
          { text: '', data: {} },
        ],
        data: {},
        isVoid: false,
      },
    ];
    const start = { path: [0, 0], offset: 7 };
    const end = { path: [0, 0], offset: 22 };
    editor.tf.select(backward ? { anchor: end, focus: start } : { anchor: start, focus: end });
    editor.tf.withoutNormalizing(() => wrapLink(editor, { ...options, text }));

    expect(editor.children[0].children).toEqual([
      { text: 'Before ', data: {} },
      {
        type: options.type,
        data: options.url ? { uri: options.url } : { target: options.target },
        children: [{ text, data: {} }],
      },
      { text: ' After', data: {} },
      existingLink,
      { text: '', data: {} },
    ]);
    expect(editor.selection).toEqual({
      anchor: { path: [0, 1, 0], offset: text.length },
      focus: { path: [0, 1, 0], offset: text.length },
    });
  });
});

it('replaces the label of an existing link', () => {
  const { editor } = createTestEditor({});
  editor.children = [
    {
      type: BLOCKS.PARAGRAPH,
      children: [
        { text: '' },
        {
          type: INLINES.HYPERLINK,
          data: { uri: 'https://old.example' },
          children: [{ text: 'old' }],
        },
        { text: '' },
      ],
    },
  ];
  editor.tf.select({ path: [0, 1, 0], offset: 1 });
  editor.tf.withoutNormalizing(() => {
    wrapLink(editor, {
      type: INLINES.HYPERLINK,
      url: 'https://new.example',
      text: 'new',
      path: [0, 1],
    });
  });

  expect(editor.children[0].children[1]).toEqual({
    type: INLINES.HYPERLINK,
    data: { uri: 'https://new.example' },
    children: [{ text: 'new' }],
  });
});
