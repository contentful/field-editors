import React from 'react';

import { styles } from './TipTapEditor.styles';

// import TextStyle from '@tiptap/extension-text-style';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BulletList } from '@tiptap/extension-bullet-list';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Paragraph } from '@tiptap/extension-paragraph';

import type { ConnectedProps } from './RichTextEditor';
import toContentfulDocument from './adapter/toContentful';
import toTiptap from './adapter/toTiptap';

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}>
        blockquote
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}>
        bullet list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}>
        ordered list
      </button>
    </>
  );
};

const CustomListItem = ListItem.extend({
  content: 'block*',
});

const extensions = [
  // Color.configure({ types: [TextStyle.name, ListItem.name] }),
  // TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    listItem: false,
  }),
  // Document.configure({}),
  // Text.configure({}),
  // Paragraph.configure({}),
  // BulletList.configure({}),
  // OrderedList.configure({}),
  CustomListItem.configure({}),
];

// const initialValue = {
//   type: 'doc',
//   content: toTiptap({
//     document: {
//       nodeType: 'document',
//       data: {},
//       content: [
//         {
//           nodeType: 'paragraph',
//           data: {},
//           content: [
//             {
//               marks: [],
//               nodeType: 'text',
//               value: 'Hello ',
//               data: {},
//             },
//             {
//               marks: [
//                 {
//                   type: 'bold',
//                 },
//               ],
//               nodeType: 'text',
//               value: 'World',
//               data: {},
//             },
//             {
//               marks: [],
//               nodeType: 'text',
//               value: '!',
//               data: {},
//             },
//           ],
//         },
//       ],
//     },
//   }),
// };

export const TipTapEditor = (props: ConnectedProps) => {
  return (
    <EditorProvider
      enableCoreExtensions
      className={styles.tiptap}
      slotBefore={<MenuBar />}
      extensions={extensions}
      onUpdate={({ editor }) => {
        const content = editor.getJSON();
        console.log(content);
        const cfDoc = toContentfulDocument({ document: content });
        props?.onChange(cfDoc);
      }}
      content={{
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello World!',
              },
            ],
          },
        ],
      }}
    />
  );
};
