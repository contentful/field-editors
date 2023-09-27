import React from 'react';

import { Entry, FieldExtensionSDK } from '@contentful/app-sdk';
import { EntryCard } from '@contentful/f36-components';
import { BLOCKS, EMPTY_DOCUMENT } from '@contentful/rich-text-types';
import { Node, mergeAttributes, getSchema } from '@tiptap/core';
import { ListItem } from '@tiptap/extension-list-item';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import toContentfulDocument from './adapter/toContentful';
import toTiptap from './adapter/toTiptap';
import Commands from './extensions/suggestion/commands';
import getSuggestionItems from './extensions/suggestion/items';
import renderItems from './extensions/suggestion/renderItems';
import { UnknownMark } from './extensions/unknown-mark';
import { UnknownNode } from './extensions/unknown-node';
import type { ConnectedProps } from './RichTextEditor';
import { styles } from './TipTapEditor.styles';

function entityToLink(entity) {
  const { id, type } = entity.sys;
  return { sys: { id, type: 'Link', linkType: type } };
}

const MenuBar = ({ sdk }: { sdk: FieldExtensionSDK }) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <>
      <button
        data-test-id="quote-toolbar-button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}>
        blockquote
      </button>
      <button
        data-test-id="ul-toolbar-button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}>
        bullet list
      </button>
      <button
        data-test-id="ol-toolbar-button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}>
        ordered list
      </button>
      <button
        data-test-id="table-toolbar-button"
        onClick={() => editor.chain().focus().insertTable().run()}
        className={editor.isActive('table') ? 'is-active' : ''}>
        table
      </button>
      <button
        onClick={async () => {
          const entry = (await sdk.dialogs.selectSingleEntry()) as Entry;
          const link = entityToLink(entry);
          console.log(entry);
          editor
            .chain()
            .focus()
            .insertContentAt(editor.view.state.selection, {
              type: BLOCKS.EMBEDDED_ENTRY,
              attrs: { target: link },
            })
            .run();
        }}
        className={editor.isActive(BLOCKS.EMBEDDED_ENTRY) ? 'is-active' : ''}>
        embed entry
      </button>
      <button
        data-test-id="clear-marks-toolbar-button"
        // TODO adjust unsetAllMarks to have unsetUnknownMark as part of it
        onClick={() => editor.chain().focus().unsetAllMarks().unsetUnknownMark().run()}>
        clear formatting
      </button>
    </>
  );
};

const CustomListItem = ListItem.extend({
  content: 'block*',
});

// const EmbeddedEntry = Image.extend({
//   // content: 'block*',
//   draggable: true,

// })

const EmbeddedEntry = Node.create({
  name: BLOCKS.EMBEDDED_ENTRY,
  group: 'block',
  draggable: true,
  inline: false,

  addAttributes() {
    return {
      target: {},
    };
  },

  addNodeView() {
    console.log('addNodeView');
    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper>
        <div data-drag-handle>
          <EntryCard title={node.attrs.target.sys.id} description="Mock description" />
        </div>
      </NodeViewWrapper>
    ));
  },

  parseHTML() {
    return [{ tag: BLOCKS.EMBEDDED_ENTRY }];
  },

  renderHTML({ HTMLAttributes }) {
    return [BLOCKS.EMBEDDED_ENTRY, mergeAttributes(HTMLAttributes)];
  },
});

const extensions = [
  StarterKit.configure({
    listItem: false,
    // bold: false,
    // blockquote: false,
  }),
  CustomListItem.configure({}),
  Table.configure({
    resizable: true,
  }).extend({
    addCommands() {
      return {
        ...this.parent?.(),
        insertTable: (...args) => {
          // if already in table return false
          if (this.editor.isActive('table')) {
            return false;
          }
          return this.parent?.().insertTable?.(...args);
        },
      };
    },
  }),
  TableRow,
  TableHeader.extend({
    content: 'paragraph+',
  }),
  TableCell.extend({
    content: 'paragraph+',
  }),
  Commands.configure({
    suggestion: {
      items: getSuggestionItems,
      render: renderItems,
    },
  }),
  EmbeddedEntry.configure({}),
  UnknownMark,
  UnknownNode,
];

// We can separately get the schema and use this in the adapter to tell if nodes and marks are expected or not
const schema = getSchema(extensions);

export const TipTapEditor = (props: ConnectedProps) => {
  return (
    <div data-test-id="rich-text-editor">
      <EditorProvider
        enableCoreExtensions
        slotBefore={<MenuBar sdk={props.sdk} />}
        extensions={extensions}
        editorProps={{
          attributes: {
            'data-test-id': 'rich-text-editor-tiptap',
            class: styles.tiptap({ minHeight: props.minHeight }),
          },
        }}
        css={styles.tiptap}
        onUpdate={({ editor }) => {
          const content = editor.getJSON();
          const cfDoc = toContentfulDocument({ document: content });
          props?.onChange(cfDoc);
        }}
        content={{
          type: 'doc',
          content: toTiptap({
            document: props.value || EMPTY_DOCUMENT,
            tiptapSchema: schema,
          }),
        }}
      />
    </div>
  );
};
